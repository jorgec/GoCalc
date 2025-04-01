// src/stores/derivedStore.js
import {derived, get} from 'svelte/store';
import {
    currentPanelBoard,
    floorArea,
    globalConduitType,
    globalWireType,
    loadSpecifications, panelBoardCollations,
    panelboardName, panelBoards,
    projectDate,
    projectInCharge,
    projectLocation,
    projectName,
    projectOwner,
    rowConduitType,
    selectedAddOnValue,
    selectedOccupancyValue,
    selectedTypeValue,
    systemPhaseType,
    volts
} from './dataStore';
import {wireData} from '../utils/calculations';
import {
    laborCost,
    laborPercentage,
    logisticsCost,
    materialsCost,
    materialsInventory,
    totalInventoryCost,
    totalProjectCost
} from './materialInventoryStore';
import {formatInt} from "../utils/misc.js";
import {determineWireParams, formatWireDataRow, wireDataLookup} from "../utils/lookups.js"; // Include inventory store

// Derived store for the CSV data
export const csvData = derived(
    [loadSpecifications, volts, systemPhaseType],
    ([$loadSpecifications, $volts, $phase]) => {
        const _globalConduitType = get(rowConduitType).toString();
        const _globalWireType = get(globalWireType).toString();
        const result = [];
        let pairIndex = 0;

        for (let i = 0; i < $loadSpecifications.length; i++) {
            const spec = $loadSpecifications[i];
            const CRKTno = i + 1;

            // Calculate wire size and type
            // let {localWireSize, localWireType} = determineWireSizeAndType({...spec, volts: $volts});

            const wireParams = determineWireParams(spec.wireSize, spec.wireType);
            const wireParamsAnnotated = formatWireDataRow(wireParams);

            let conduitSize = spec.conduitSize;
            let conduitSizeAnnotated = spec.conduitSize;
            if (_globalConduitType === "PVC") {
                conduitSizeAnnotated = `${wireParamsAnnotated.conduitsize_metric_pvc} (${wireParamsAnnotated.conduitsize_imperial_pvc})`;
            } else {
                conduitSizeAnnotated = `${wireParamsAnnotated.conduitsize_metric_rmc} (${wireParamsAnnotated.conduitsize_imperial_rmc})`;
            }
            conduitSizeAnnotated += " ø " + _globalConduitType;

            let loadStr = spec.name;
            let ratings = '';
            if (spec.category === 'Lighting') {
                if (spec.lightingLoads) {
                    const combos = spec.lightingLoads.map(
                        (row) => `${row.quantity}x ${row.wattage}W ${row.type}`
                    );
                    loadStr = combos.join('; ');
                } else {
                    loadStr = '';
                }
                ratings = '';
            } else {
                loadStr = '';
                if (spec.category === 'Convenience Outlet') {
                    ratings = spec.name;
                } else {
                    const acronym = spec.name.match(/[A-Z]+[a-z]*|[a-z]+/g)?.map(w => w[0].toUpperCase()).join('') || '';
                    ratings = `${spec.quantity} ${spec.category} (${spec.name})`;
                    if (spec.category === 'Motor') {
                        let hpText = `${spec.wattage}W `;
                        if(spec.horsepower !== null){
                            hpText = `${spec.horsepower}HP `;
                        }
                        ratings = `${spec.quantity} ${spec.category} (${hpText}${acronym})`;
                    }
                }
            }
            const AnnotatedWireSizeAndType = "2 - " + wireParamsAnnotated.wiresize_metric + " (" + wireParamsAnnotated.wiresize_awg + ") " + spec.wireType;
            let displayAT = wireParams.branch_AT;
            // if(spec.category === 'Kitchen Load'){
            //     displayAT = wireParams.entrance_AT;
            // }
            let rowObj = {
                CRKTno,
                Load: loadStr,
                'Convenience Outlet': ratings,
                'Volt Ampere': formatInt(spec.subtotal),
                Volts: $volts,
                AmpLoadSingle: '',
                AmpLoadAB: '',
                AmpLoadBC: '',
                AmpLoadCA: '',
                AmpLoadABC: '',
                "Sa": spec.sa,
                "Sab": spec.sab,
                "Sabc": spec.sabc,
                "Three Gang": spec.threeGang,
                WireSize: parseFloat(spec.wireSize).toFixed(1) || 0.0, // Use calculated wire size or empty string
                WireType: spec.wireType,
                WireSizeAndType: wireData(parseFloat(spec.wireSize).toFixed(1), spec.wireType),
                AnnotatedWireSizeAndType: AnnotatedWireSizeAndType,
                ConduitSize: conduitSize || 0.0,
                CounduitSizeAnnotated: conduitSizeAnnotated || "",
                WireParams: wireParams,
                KAIC: 10,
                Pole: 2,
                Type: "PLUG-IN",
                AT: displayAT
            };
            const numericSubtotal = parseFloat(spec.subtotal) || 0;
            const ampLoadValue = $volts > 0 ? numericSubtotal / $volts : 0;

            if ($phase === 0) {
                rowObj.AmpLoadSingle = ampLoadValue;
                rowObj.AmpLoadSingleDisplay = ampLoadValue.toFixed(2);
            } else {
                if (spec.abc) {
                    rowObj.AmpLoadABC = ampLoadValue;
                } else {
                    const group = Math.floor(pairIndex / 2) % 3;
                    if (group === 0) {
                        rowObj.AmpLoadAB = ampLoadValue;
                        rowObj.AmpLoadABDisplay = ampLoadValue.toFixed(2);
                    } else if (group === 1) {
                        rowObj.AmpLoadBC = ampLoadValue;
                        rowObj.AmpLoadBCDisplay = ampLoadValue.toFixed(2);
                    } else {
                        rowObj.AmpLoadCA = ampLoadValue;
                        rowObj.AmpLoadCADisplay = ampLoadValue.toFixed(2);
                    }
                    pairIndex++;
                }
            }

            result.push(rowObj);
        }

        return result;
    }
);


// Derived store for the total VA
export const totalOfAllVA = derived(
    [loadSpecifications, volts],
    ([$loadSpecifications, $volts]) => {

        let vaSum = 0;

        if (Array.isArray($loadSpecifications) && $loadSpecifications.length > 0) {
            for (const spec of $loadSpecifications) {
                vaSum += parseFloat(spec.subtotal) || 0;
            }
        }

        return vaSum;
    }
);

// Derived store for the total Amp load
export const totalOfAllAmp = derived(
    [loadSpecifications, volts],
    ([$loadSpecifications, $volts]) => {
        if (Array.isArray($loadSpecifications) && $loadSpecifications.length > 0) {
            let ampSum = 0;
            for (const spec of $loadSpecifications) {
                const numericSubtotal = parseFloat(spec.subtotal) || 0;
                ampSum += $volts > 0 ? numericSubtotal / $volts : 0;
            }
            return ampSum;
        }
    }
);

export const serviceEntranceAmpacity = derived(
    totalOfAllAmp,
    ($totalOfAllAmp) => $totalOfAllAmp * 1.25
);

export const derivedHighestNonTrivialLoad = derived(
    [loadSpecifications, volts],
    ([$loadSpecifications, $volts]) => {
        if ($loadSpecifications.length > 0) {
            let highestNonTrivialLoad = [-1, 0];
            for (let i = 0; i < $loadSpecifications.length; i++) {
                const spec = $loadSpecifications[i];
                // Change to motor if it should be just motor category specifically
                if (spec.category === 'Motor') {
                    let currentAmpLoad = $volts > 0 ? parseFloat(spec.subtotal) || 0 / $volts : 0;
                    console.log(spec, currentAmpLoad);
                    if (currentAmpLoad > highestNonTrivialLoad[1]) {
                        highestNonTrivialLoad = [i, currentAmpLoad];
                    }
                }
            }
            if (highestNonTrivialLoad[0] >= 0) {
                return highestNonTrivialLoad[1];
            }
            return 0;

        }
        return 0;
    }
)

// Derived store for the entire project data (for saving)
export const projectData = derived(
    [
        projectName,
        projectDate,
        projectLocation,
        projectOwner,
        projectInCharge,
        floorArea,
        selectedOccupancyValue,
        selectedAddOnValue,
        selectedTypeValue,
        systemPhaseType,
        volts,
        // loadSpecifications,
        materialsInventory,
        laborPercentage,
        logisticsCost,
        totalInventoryCost,
        materialsCost,
        laborCost,
        totalProjectCost,
        globalWireType,
        globalConduitType,
        panelboardName,
        panelBoards,
    ],
    ([
         $projectName,
         $projectDate,
         $projectLocation,
         $projectOwner,
         $projectInCharge,
         $floorArea,
         $selectedOccupancyValue,
         $selectedAddOnValue,
         $selectedTypeValue,
         $systemPhaseType,
         $volts,
         // $loadSpecifications,
         $materialsInventory,
         $laborPercentage,
         $logisticsCost,
         $totalInventoryCost,
         $materialsCost,
         $laborCost,
         $totalProjectCost,
         $globalWireType,
         $globalConduitType,
         $panelboardName,
        $panelBoards

     ]) => {
        return {
            projectName: $projectName,
            projectDate: $projectDate,
            projectLocation: $projectLocation,
            projectOwner: $projectOwner,
            projectInCharge: $projectInCharge,
            floorArea: $floorArea,
            selectedOccupancyValue: $selectedOccupancyValue,
            selectedAddOnValue: $selectedAddOnValue,
            selectedTypeValue: $selectedTypeValue,
            systemPhaseType: $systemPhaseType,
            volts: $volts,
            // loadSpecifications: $loadSpecifications,
            materialsInventory: $materialsInventory,
            labor: $laborPercentage,
            logistics: $logisticsCost,
            totalInventoryCost: $totalInventoryCost,
            materialsCost: $materialsCost,
            laborCost: $laborCost,
            totalProjectCost: $totalProjectCost,
            globalWireType: $globalWireType,
            globalConduitType: $globalConduitType,
            panelboardName: $panelboardName,
            panelBoards: $panelBoards
        };
    }
);

window.myDerived = {
    "csv": csvData,
    "projectData": projectData
}

// monitoring for derived values
export function updatePanelBoardCollations(storeName, value, key) {
    const pboard = get(currentPanelBoard);
    let _panelBoardCollations = get(panelBoardCollations);
    if(key in _panelBoardCollations){
        _panelBoardCollations[key][pboard] = value;

        if(key === "serviceEntranceAmpacity"){
            const _globalWireType = get(globalWireType);
            const _globalConduitType = get(globalConduitType);
            const wireRecommendation = wireDataLookup(value, _globalWireType);
            _panelBoardCollations["wire"][pboard] = _globalWireType;
            _panelBoardCollations["conduit"][pboard] = _globalConduitType;
            _panelBoardCollations["wireRecommendation"][pboard] = wireRecommendation;
            _panelBoardCollations["highestMotorLoad"][pboard] = get(derivedHighestNonTrivialLoad);
        }

    }
    panelBoardCollations.set(_panelBoardCollations);
    console.log(_panelBoardCollations);
}

function monitorStore(store, storeName, callback, key) {
    let lastValue = undefined;

    return store.subscribe(value => {
        if (value !== null && value !== lastValue) {
            lastValue = value;
            callback(storeName, value, key);
        }
    });
}

// Set up monitors
const unsubscribers = [
    monitorStore(serviceEntranceAmpacity, 'serviceEntranceAmpacity', updatePanelBoardCollations, "serviceEntranceAmpacity"),
    monitorStore(totalOfAllAmp, 'totalOfAllAmp', updatePanelBoardCollations, "a"),
    monitorStore(totalOfAllVA, 'totalOfAllVA', updatePanelBoardCollations, "va")
];

// Optional: clean up
export function stopMonitoring() {
    unsubscribers.forEach(unsub => unsub());
}