// src/stores/derivedStore.js
import {derived} from 'svelte/store';
import {
    floorArea,
    loadSpecifications, projectDate, projectInCharge, projectLocation,
    projectName, projectOwner,
    selectedAddOnValue,
    selectedOccupancyValue,
    selectedTypeValue,
    systemPhaseType,
    volts
} from './dataStore';
import {determineConduitSize, determineWireSizeAndType, wireData} from '../utils/calculations';
import {
    inventory,
    laborCost,
    laborPercentage,
    logisticsCost,
    materialsCost,
    totalInventoryCost,
    totalProjectCost
} from './materialInventoryStore'; // Include inventory store

// Derived store for the CSV data
export const csvData = derived(
    [loadSpecifications, volts, systemPhaseType],
    ([$loadSpecifications, $volts, $phase]) => {
        const result = [];
        let pairIndex = 0;

        for (let i = 0; i < $loadSpecifications.length; i++) {
            const spec = $loadSpecifications[i];
            const CRKTno = i + 1;

            // Calculate wire size and type
            let {wireSize, wireType} = determineWireSizeAndType({...spec, volts: $volts});
            let conduitSize = determineConduitSize(wireSize);

            let loadStr = spec.name;
            if (spec.category === 'Lighting' && spec.lightingLoads) {
                const combos = spec.lightingLoads.map(
                    (row) => `${row.type}: ${row.wattage}W x ${row.quantity}`
                );
                loadStr = combos.join('; ');
            }

            let rowObj = {
                CRKTno,
                Load: loadStr,
                Ratings: spec.ratings || '-',
                'Volt Ampere': spec.subtotal,
                Volts: $volts,
                AmpLoadSingle: '',
                AmpLoadAB: '',
                AmpLoadBC: '',
                AmpLoadCA: '',
                AmpLoadABC: '',
                WireSize: wireSize || '', // Use calculated wire size or empty string
                WireType: (wireType && wireType.length > 0) ? wireType.join(', ') : '',
                WireSizeAndType: wireData(wireSize, wireType),
                ConduitSize: conduitSize || '',
            };

            const numericSubtotal = parseFloat(spec.subtotal) || 0;
            const ampLoadValue = $volts > 0 ? numericSubtotal / $volts : 0;


            if ($phase === 0) {
                rowObj.AmpLoadSingle = ampLoadValue.toFixed(2);
            } else {
                if (spec.abc) {
                    rowObj.AmpLoadABC = ampLoadValue.toFixed(2);
                } else {
                    const group = Math.floor(pairIndex / 2) % 3;
                    if (group === 0) {
                        rowObj.AmpLoadAB = ampLoadValue.toFixed(2);
                    } else if (group === 1) {
                        rowObj.AmpLoadBC = ampLoadValue.toFixed(2);
                    } else {
                        rowObj.AmpLoadCA = ampLoadValue.toFixed(2);
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
        for (const spec of $loadSpecifications) {
            vaSum += parseFloat(spec.subtotal) || 0;
        }
        return vaSum;
    }
);

// Derived store for the total Amp load
export const totalOfAllAmp = derived(
    [loadSpecifications, volts],
    ([$loadSpecifications, $volts]) => {
        let ampSum = 0;
        for (const spec of $loadSpecifications) {
            const numericSubtotal = parseFloat(spec.subtotal) || 0;
            ampSum += $volts > 0 ? numericSubtotal / $volts : 0;
        }
        return ampSum;
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
        loadSpecifications,
        inventory,
        laborPercentage,
        logisticsCost,
        totalInventoryCost,
        materialsCost,
        laborCost,
        totalProjectCost
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
         $loadSpecifications,
         $inventory,
         $laborPercentage,
         $logisticsCost,
         $totalInventoryCost,
         $materialsCost,
         $laborCost,
         $totalProjectCost

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
            loadSpecifications: $loadSpecifications,
            inventory: $inventory,
            labor: $laborPercentage,
            logistics: $logisticsCost,
            totalInventoryCost: $totalInventoryCost,
            materialsCost: $materialsCost,
            laborCost: $laborCost,
            totalProjectCost: $totalProjectCost

        };
    }
);

