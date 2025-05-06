// src/utils/calculations.js
import {get} from 'svelte/store';
import {constants} from '../stores/constantsStore';
import {
    globalConduitType,
    globalWireType,
    panelBoardCollations,
    selectedLightingDemandFactorID,
    volts
} from '../stores/dataStore';
import {formatDecimal} from "./misc.js";
import {csvData} from "../stores/derivedStore.js";
import {onDestroy} from "svelte";
import {wireDataLookup} from "./lookups.js"; // Import volts


/**
 * Calculate lighting demand factor based on
 * "lightingDemandFactors" rules from constants.json
 */
export function calculateDemandFactor(value) {
    const dfID = get(selectedLightingDemandFactorID);
    if (dfID !== null && constants.lightingDemandFactors && constants.lightingDemandFactors[dfID]) {
        const rules = constants.lightingDemandFactors[dfID];
        let remainder = value;
        let total = 0;

        for (let i = 0; i < rules.length; i++) {
            const [max, percentage] = rules[i];
            let applicableValue = 0;

            if (max === null) {
                applicableValue = remainder;
            } else if (remainder > max) {
                applicableValue = max - (rules[i - 1] ? rules[i - 1][0] : 0);
                remainder -= applicableValue;
            } else {
                applicableValue = remainder;
                remainder = 0;
            }
            total += applicableValue * (percentage / 100);
            if (remainder === 0) break;
        }
        return total;
    }
    return value;
}

/**
 * Summarize all specs with demand factor logic
 */
export function getSumOfSpecifications(items) {
    let sumOfSpecs = {};
    let tempLightingDemandFactor = 0;
    let tempConvenienceDemandFactor = 0;
    let tempOtherDemandFactor = 0;
    let totalSumOfSpecs = 0;

    // Summation by category
    for (let item of items) {
        if (!sumOfSpecs[item.category]) {
            sumOfSpecs[item.category] = { sum: 0, count: 0 };
        }
        sumOfSpecs[item.category].sum += parseFloat(item.subtotal) || 0;
        sumOfSpecs[item.category].count += 1;
    }

    // Demand factor rules
    for (const [key, value] of Object.entries(sumOfSpecs)) {
        // Single Kitchen load => 80% rule
        if (value.count === 1 && key === 'Kitchen Load') {
            sumOfSpecs[key].sum = parseFloat((value.sum * 0.8).toFixed(2));
        }

        if (key === 'Lighting') {
            tempLightingDemandFactor += calculateDemandFactor(parseFloat(value.sum));
        } else if (key === 'Convenience outlet') {
            tempConvenienceDemandFactor += value.sum;
        } else {
            tempOtherDemandFactor += value.sum;
        }
    }

    // 10,000 VA + 50% of the remainder for convenience
    if (tempConvenienceDemandFactor > 10000) {
        let tempExcess = tempConvenienceDemandFactor - 10000;
        tempConvenienceDemandFactor = 10000 + tempExcess * 0.5;
    }

    const finalLightingPlusConvenience = tempLightingDemandFactor + tempConvenienceDemandFactor;
    totalSumOfSpecs = finalLightingPlusConvenience + tempOtherDemandFactor;

    return {
        sumOfSpecs,
        totalSumOfSpecs,
        applicationDemandFactor: finalLightingPlusConvenience
    };
}

// --- determineWireSizeAndType ---
export function determineWireSizeAndType(loadSpec) {
    if (!constants.wireSizingData) { // Safety check
        return { wireSize: 0.0, wireType: [] };
    }
    const wireSizingData = constants.wireSizingData.entries;
    const volts = loadSpec.volts;

    let loadType = loadSpec.category;
    let amperage = 0;

    if (loadSpec.subtotal && loadSpec.subtotal > 0 && volts > 0) {
        amperage = parseFloat(loadSpec.subtotal) / parseFloat(volts)
    }

    if (loadType === "Lighting") {
        loadType = "Lighting";
    } else if (loadType === "Convenience outlet") {
        loadType = "Convenience outlet";
    } else if (loadType === "Kitchen Load") {
        if (loadSpec.name.includes("Oven")) {
            loadType = "Electric Oven";
        } else if (loadSpec.name.includes("Range")) {
            loadType = "Electric Range";
        } else {
            loadType = "Small Appliance Circuits";
        }
    } else if (loadType === "Motor") {
        if (loadSpec.name.includes("Air-Conditioning Unit") || loadSpec.name.includes("Tonner ACU") ) {
            loadType = "Air-Conditioning Unit";
            if (loadSpec.name.includes("Tonner ACU")) {
                loadType = "Tonner ACU"
            }
        } else if (loadSpec.name.includes("Water Heater")) {
            loadType = "Water Heater"
        }
        else if (loadSpec.horsepower) {
            const hp = parseFloat(loadSpec.horsepower);
            if (hp >= 1 && hp <= 3) {
                loadType = "Motor Load (1 HP - 3 HP, 230V)";
            } else if (hp >= 5 && hp <= 10) {
                loadType = "Motor Load (5 HP - 10 HP, 230V)";
            } else if (hp >= 15 && hp <= 20) {
                loadType = "Motor Load (15 HP - 20 HP, 230V)";
            } else {
                loadType = "Motor Load (Other)";
            }
        }
        else {
            loadType = "Motor Load (Other)";
        }
    } else {
        loadType = "Other Loads"
    }

    let matchedEntry = null;
    for (const entry of wireSizingData) {
        if (entry["Load Type"] === loadType) {
            matchedEntry = entry;
            break;
        }
    }
    console.log("=======matchedEntry========");
    console.log(matchedEntry);

    if (matchedEntry) {
        return {
            wireSize: formatDecimal(matchedEntry["Wire Size"]),
            wireType: ["THHN"]
        };
    } else {
        return null;
    }
}

export function wireData(wireSize, wireType) {

    return `${wireSize} mm² ${wireType}`;
}

export function determineConduitSize(wireSize) {

    let retVal = "N/A";
    if (!constants.conduitSizing || !constants.conduitSizing.entries) {
        return retVal;
    }

    const conduitSizes = constants.conduitSizing.entries;

    // Convert wireSize to a string to match the keys in conduitSizes
    const wireSizeStr = String(wireSize);

    // Direct lookup
    if (conduitSizes.hasOwnProperty(wireSizeStr)) {
        retVal = `${conduitSizes[wireSizeStr]} mm Ø PVC`;
    }else{
        retVal = 'alaws';
    }

    return retVal; // Or a suitable default value
}

export function loadCurrentIFL(volts, load, totalVA) {
    return (totalVA + ((load * .8)*.25)) / volts;
}

export function getWireRecommendation(value) {
    const WireRecommendationLookup = constants.WireRecommendationLookup;
    for (let i = 0; i < WireRecommendationLookup.length; i++) {
        if (value <= WireRecommendationLookup[i][0]) {
            return WireRecommendationLookup[i][1];
        }
    }

    return 0.00;
}

function getMax(arr){
    if(! Array.isArray(arr)){
        return 0;
    }
    if(arr.length <=0){
        return 0;
    }
    let max = parseFloat(arr[0]);
    for(let i = 0; i < arr.length; i++){
        if(max > parseFloat(arr[i])){
            max = parseFloat(arr[i]);
        }
    }
    return parseFloat(max);
}

function getSum(arr){
    if(! Array.isArray(arr)){
        return 0;
    }
    if(arr.length <=0){
        return 0;
    }
    let sum = 0.0;
    for(let i = 0; i < arr.length; i++){
        sum += parseFloat(arr[i]);
    }
    return parseFloat(sum);
}

export function mainDistributionCalculations(){
    const collations = get(panelBoardCollations);
    let sums = {};
    
    const wireType = get(globalWireType);
    const conduitType = get(globalConduitType);

    sums.totalVA = collations.va.reduce((sum, val) => sum + (typeof val === 'number' ? val : Number(val) || 0), 0);
    sums.totalA = collations.a.reduce((sum, val) => sum + (typeof val === 'number' ? val : Number(val) || 0), 0);
    sums.getMaxLoad = getMax(collations.highestMotorLoad);
    sums.ifl = loadCurrentIFL(get(volts), sums.getMaxLoad, sums.totalVA);
    sums.i = sums.totalA * 1.25;
    sums.at = getSum(collations.branchAT);

    const wireRecommendation = wireDataLookup(sums.i, wireType);

    sums.wireRecommendation = `${wireRecommendation.wiresize_metric} (${wireRecommendation.wiresize_awg}) ${wireType}`;

    let conduitRecommendation = '';
    if(conduitType === "PVC"){
        conduitRecommendation = `${wireRecommendation.conduitsize_metric_pvc} (${wireRecommendation.conduitsize_imperial_pvc}) Ø ${conduitType}`;
    }else{
        conduitRecommendation = `${wireRecommendation.conduitsize_metric_rmc} (${wireRecommendation.conduitsize_imperial_rmc}) Ø ${conduitType}`;
    }
    sums.conduitRecommendation = conduitRecommendation;
    return sums;


}

export function sumCsvData(data) {

    // We’ll accumulate each column in variables
    let voltAmpere = 0;
    let ampLoadSingle = 0;
    let ampLoadSingleDisplay = 0;
    let ampLoadAB = 0;
    let ampLoadABDisplay = 0;
    let ampLoadBC = 0;
    let ampLoadBCDisplay = 0;
    let ampLoadCA = 0;
    let ampLoadCADisplay = 0;
    let ampLoadABC = 0;
    let ampLoadABCDisplay = 0;
    let sa = 0;
    let sab = 0;
    let sabc = 0;
    let threeGang = 0;

    for (const row of data) {
        // For each numeric property, parse the value or default to 0
        voltAmpere += parseFloat(row['Volt Ampere']) || 0;
        ampLoadSingle += parseFloat(row.AmpLoadSingle) || 0;
        ampLoadAB += parseFloat(row.AmpLoadAB) || 0;
        ampLoadBC += parseFloat(row.AmpLoadBC) || 0;
        ampLoadCA += parseFloat(row.AmpLoadCA) || 0;
        ampLoadABC += parseFloat(row.AmpLoadABC) || 0;
        sa += parseFloat(row.Sa) || 0;
        sab += parseFloat(row.Sab) || 0;
        sabc += parseFloat(row.Sabc) || 0;
        threeGang += parseFloat(row['Three Gang']) || 0;
    }
    ampLoadSingleDisplay = ampLoadSingle.toFixed(2)
    ampLoadABDisplay = ampLoadAB.toFixed(2)
    ampLoadBCDisplay = ampLoadBC.toFixed(2)
    ampLoadCADisplay = ampLoadCA.toFixed(2)
    ampLoadABCDisplay = ampLoadABC.toFixed(2)

    // Return an object that can be used in your component
    return {
        voltAmpere,
        ampLoadSingle,
        ampLoadAB,
        ampLoadBC,
        ampLoadCA,
        ampLoadABC,
        sa,
        sab,
        sabc,
        threeGang,
        ampLoadSingleDisplay,
        ampLoadABDisplay,
        ampLoadBCDisplay,
        ampLoadCADisplay,
        ampLoadABCDisplay,
    };
}

window.calcWireSize = determineWireSizeAndType;
window.wireData = wireData;