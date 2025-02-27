// src/utils/calculations.js
import { get } from 'svelte/store';
import { constants } from '../stores/constantsStore';
import {loadSpecifications, selectedLightingDemandFactorID, volts} from '../stores/dataStore'; // Import volts
import {totalOfAllAmp, totalOfAllVA} from "../stores/derivedStore.js";

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
        return { wireSize: null, wireType: [] };
    }
    const wireSizingData = constants.wireSizingData.entries;
    const $volts = get(volts); // Get current volts value

    let loadType = loadSpec.category;
    let amperage = 0;

    if (loadSpec.subtotal && loadSpec.subtotal > 0 && $volts > 0) {
        amperage = parseFloat(loadSpec.subtotal) / parseFloat($volts)
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

    if (!matchedEntry) {
        for (const entry of wireSizingData) {
            const entryAmp = parseFloat(entry.Amp);
            if(amperage <= entryAmp) {
                matchedEntry = entry;
                break;
            }
        }
    }

    if (matchedEntry) {
        return {
            wireSize: matchedEntry["Wire Size"],
            wireType: matchedEntry["Wire Type"]
        };
    } else {
        return {
            wireSize: null,
            wireType: []
        };
    }
}

export function wireData(wireSize, wireType) {

    return `${wireSize} mm² ${wireType}`;
}

export function determineConduitSize(wireSize) {
    console.log(wireSize);
    let retVal = "N/A";
    if (!constants.conduitSizing || !constants.conduitSizing.entries) {
        return retVal; // Or a suitable default, like "N/A"
    }

    const conduitSizes = constants.conduitSizing.entries;

    // Convert wireSize to a string to match the keys in conduitSizes
    const wireSizeStr = String(wireSize);
    console.log(wireSizeStr);

    // Direct lookup
    if (conduitSizes.hasOwnProperty(wireSizeStr)) {
        retVal = `${conduitSizes[wireSizeStr]} mm Ø PVC`;
    }else{
        retVal = 'alaws';
    }

    return retVal; // Or a suitable default value
}

export function loadCurrentIFL(volts, load, totalVA) {
    return (totalVA + ((load * .8)*.5)) / volts;
}


window.calcWireSize = determineWireSizeAndType;
window.wireData = wireData;