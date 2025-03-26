// src/utils/mutators.js
import {get} from 'svelte/store';
import {
    applicationDemandFactor,
    convenienceVA,
    floorArea, globalConduitType, globalWireType, horsepower,
    isABC,
    lightingRows,
    loadSpecifications,
    projectDate,
    projectInCharge,
    projectLocation,
    projectName,
    projectOwner,
    quantity,
    ratings, rowConduitType, rowWireType,
    sa,
    sab,
    sabc,
    selectedAddOnValue,
    selectedCategoryIndex,
    selectedCategoryType,
    selectedOccupancyValue,
    selectedTypeValue,
    spareName,
    sumOfSpecifications,
    systemPhaseType,
    threeGang,
    totalSumOfSpecs,
    volts,
    wattage,
} from '../stores/dataStore';

import {loadSpecEditId, showLightingInput, statusMessage} from '../stores/uiStore';

import {laborPercentage, logisticsCost, materialsInventory} from '../stores/materialInventoryStore';

import {constants, lookupWattage} from '../stores/constantsStore';
import {determineConduitSize, determineWireSizeAndType, getSumOfSpecifications} from './calculations';
import {determineWireParams, determineWireSize, formatWireDataRow, wireDataLookup} from "./lookups.js";
import {formatDecimal} from "./misc.js";

// --- Helper Functions (Internal) ---

/** Recompute sums & demand factors after changes to loadSpecifications */
export function recalcSpecifications() {
    const items = get(loadSpecifications);
    const phase = get(systemPhaseType);
    const {sumOfSpecs, totalSumOfSpecs: total, applicationDemandFactor: adf} =
        getSumOfSpecifications(items);

    recalcHP(phase);
    sumOfSpecifications.set(sumOfSpecs);
    totalSumOfSpecs.set(total);
    applicationDemandFactor.set(adf);
}

// --- Exported Mutator Functions ---
export function recalcHP(phase){
    loadSpecifications.update(specs => {
        const _volts = get(volts);

        return specs.map(spec => {
            if (spec.horsepower && (spec.horsepower !== 0 && spec.horsepower !== "") && spec.category === "Motor") {
                let wattage = parseFloat(spec.wattage);
                if(wattage <= 0 || !wattage){
                    wattage = lookupWattage(spec.horsepower, _volts, phase);
                }
                let subtotal = spec.quantity * wattage;
                return {
                    ...spec,
                    subtotal: subtotal,
                    wattage: wattage !== undefined ? wattage : (spec.wattage !== 0 ? (spec.wattage / 746).toFixed(2) : 0)
                };
            }
            return spec; // ✅ Always return the spec, even if unchanged
        });
    });
}

/** Move a specification row UP in the loadSpecifications array */
export function moveSpecUp(index) {
    if (index <= 0) return;
    loadSpecifications.update(specs => {
        const newSpecs = [...specs];
        [newSpecs[index - 1], newSpecs[index]] = [newSpecs[index], newSpecs[index - 1]];
        return newSpecs;
    });
    recalcSpecifications(); // Recalculate after moving
}

/** Move a specification row DOWN in the loadSpecifications array */
export function moveSpecDown(index) {
    loadSpecifications.update(specs => {
        if (index >= specs.length - 1) return specs; // Prevent moving past the end
        const newSpecs = [...specs];
        [newSpecs[index + 1], newSpecs[index]] = [newSpecs[index], newSpecs[index + 1]];
        return newSpecs;
    });
    recalcSpecifications(); // Recalculate after moving
}

/** Remove a specification from the loadSpecifications array by index */
export function removeLoadSpecification(indexToRemove) {
    loadSpecifications.update(current =>
        current.filter((_, idx) => idx !== indexToRemove)
    );
    recalcSpecifications(); // Recalculate after removing
}

/** Add another row for lighting AND set `showLightingInput = true` */
export function addAnotherLightingRow() {
    showLightingInput.set(true); // Show the lighting input section
    lightingRows.update(rows => [
        ...rows,
        {typeValue: null, wattage: 0, quantity: 1} // Default values for new row
    ]);
}

/** Remove one lighting row by index */
export function removeLightingRow(rowIndex) {
    lightingRows.update(rows => rows.filter((_, i) => i !== rowIndex));
}

/**
 * Resets the SpecForm fields to their default values.  Clears lighting rows.
 */
export function resetSpecForm() {
    quantity.set(1);
    wattage.set(0);
    convenienceVA.set(180);
    spareName.set('');
    selectedCategoryIndex.set(null);
    selectedCategoryType.set(null);
    ratings.set('');
    isABC.set(false);
    lightingRows.set([]);      // Clear lighting rows
    showLightingInput.set(false); // Hide lighting input section
    sa.set(0);
    sab.set(0);
    sabc.set(0);
    threeGang.set(0);
    loadSpecEditId.set(null);
}

function checkLoadSpecificationForm(rowData, part) {
    let check = {};
    if (part === "lighting-row") {
        check['type'] = rowData.type !== '';
        check['wattage'] = rowData.wattage > 0;
        check['quantity'] = rowData.quantity > 0;

    }

    if (part === "lighting-switches") {
        check['switches'] = rowData.sa >= 0 || rowData.sab >= 0 || rowData.sabc >= 0 || rowData.threeGang >= 0;
    }

    for (let [key, value] of Object.entries(check)) {
        if (!value) {
            return {
                status: false,
                msg: `Error in ${key}`
            }
        }
    }

    return {
        status: true,
        msg: "Clear"
    }
}

/**
 * Adds a new load specification to the loadSpecifications array,
 * based on the currently selected category and input values.
 * Then resets the form and recalculates derived values.
 */
export function addLoadSpecification() {
    const idx = get(selectedCategoryIndex);
    const _globalConduitType = get(globalConduitType).toString();
    const _globalWireType = get(globalWireType).toString();
    if (idx == null) return;  // No category selected

    let category = constants.loadSpecificationCategories[idx];
    let details = {};
    let retVal = {
        status: true,
        msg: idx
    };

    let check = false;
    let msg = '';
    // --- Handle each category separately ---

    // LIGHTING (Category Index 0)
    if (idx === 0) {
        if (idx === 0) {
            const rows = get(lightingRows);      // 1. Get rows synchronously
            if (rows.length === 0) {
                statusMessage.set({text: "Please add at least one lighting row", type: "error"});
                return;  // Stop here
            }

            let rowDetails = [];
            let totalLighting = 0;
            let tempName = (rows.length > 1) ? "Multiple Lighting Loads" : "Lighting Load";

            // 2. Validate each row before adding
            for (let row of rows) {
                // Attempt to find the matching type label
                let foundType = (category.types || [])
                    .find(t => t.value === +row.typeValue);

                const rowData = {
                    type: foundType ? foundType.label : '',
                    wattage: row.wattage,
                    quantity: row.quantity,
                };

                // Call your validation function
                const {status, msg} = checkLoadSpecificationForm(rowData, "lighting-row");
                if (!status) {
                    // If invalid, set the error message and STOP
                    statusMessage.set({text: `Lighting row error: ${msg}`, type: 'error'});
                    return;  // No rows are added
                }

                // If valid, accumulate
                totalLighting += rowData.wattage * rowData.quantity;
                rowDetails.push(rowData);
            }
            let switches = {
                sa: get(sa) >= 0,
                sab: get(sab) >= 0,
                sabc: get(sabc) >= 0,
                threeGang: get(threeGang) >= 0
            }

            const {status, msg} = checkLoadSpecificationForm(switches, "lighting-switches");
            if (!status) {
                // If invalid, set the error message and STOP
                statusMessage.set({text: `Switch Error`, type: 'error'});
                return;  // No rows are added
            }

            // If we get here, all rows are valid
            details = {
                category: category.label,
                name: `${tempName} (${rowDetails.length} rows)`,
                lightingLoads: rowDetails,
                wattage: totalLighting,
                horsepower: (totalLighting / 746).toFixed(2),
                quantity: rowDetails.length,
                sa: get(sa),
                sab: get(sab),
                sabc: get(sabc),
                threeGang: get(threeGang),
                subtotal: totalLighting.toFixed(2),
                ratings: '-',
                abc: false
            };

            // Reset lighting input after success
            lightingRows.set([]);
            showLightingInput.set(false);
        }
    }

    // CONVENIENCE OUTLET (Category Index 1)
    else if (idx === 1) {
        const qty = get(quantity);
        const cva = get(convenienceVA);

        details = {
            category: category.label,
            name: `${qty} CO @ ${cva}VA`,
            quantity: qty,
            va: cva,        // Use the entered VA value
            wattage: cva,   // Wattage is the same as VA
            horsepower: (cva / 746).toFixed(2), // Calculate HP
            subtotal: (qty * cva).toFixed(2),
            ratings: '-', // No ratings
            abc: false    // ABC checkbox doesn't apply
        };
    }

    // KITCHEN, MOTOR, OTHER LOADS (Categories with 'types')
    else if (idx === 2 || idx === 3 || idx === 5) {
        let w = get(wattage);
        if(!w){
            w = 0.0;
        }else{
            w = parseFloat(w);
        }
        const catTypeIndex = get(selectedCategoryType);
        const catType = category.types?.[catTypeIndex]; // Safe access
        const typeLabel = catType ? catType.label : 'Unknown';
        const hp = get(horsepower);
        let _horsepower = (w / 746).toFixed(2);
        if(idx === 3){ // motors
            if(w === 0.0){
                w = lookupWattage(hp, get(volts), get(systemPhaseType));
                _horsepower = hp;
            }
        }
        details = {
            category: category.label,
            name: typeLabel,
            quantity: 1,
            wattage: w,
            horsepower: _horsepower,
            subtotal: (1 * w).toFixed(2),
            ratings: get(ratings).trim() !== '' ? get(ratings) : '-',
            abc: (get(systemPhaseType) == 1 && get(isABC)) ? true : false
        };
    }

    // SPARE (Category Index 4)
    else if (idx === 4) {
        const w = get(wattage);
        const chosenName = get(spareName).trim() !== '' ? get(spareName) : 'Spare'; // Default name
        details = {
            category: category.label,
            name: chosenName,
            quantity: 1,
            wattage: w,
            horsepower: (w / 746).toFixed(2),
            subtotal: (1 * w).toFixed(2),
            ratings: get(ratings).trim() !== '' ? get(ratings) : '-',
            abc: (get(systemPhaseType) == 1 && get(isABC)) ? true : false
        };
    }

    // --- Common logic for all categories ---

    // Add the new specification to the store, calculating wire/conduit size.
    loadSpecifications.update(current => {
        const newSpec = {...details};

        // const {wireSize, wireType} = determineWireSizeAndType({...newSpec, volts: get(volts)});
        // const wireSpecDefaults = determineWireSizeAndType({...newSpec, volts: get(volts)});
        const wireType = get(rowWireType);
        let wireSizeRow = determineWireSize(newSpec, parseFloat(newSpec.subtotal), wireType);
        const wireSize = wireSizeRow.wiresize_metric;

        const wireParams = determineWireParams(wireSize, wireType);
        const wireParamsAnnotated = formatWireDataRow(wireParams);

        newSpec.wireSize = formatDecimal(wireSize, 1);
        newSpec.wireTypeSelection = wireType;
        newSpec.wireType = wireType;
        if(Array.isArray(wireType)){
            newSpec.wireType = wireType[0];
        }

        // newSpec.conduitSize = determineConduitSize(wireSize); // Calculate conduit

        if(_globalConduitType === "RMC"){
            newSpec.conduitSize = `${wireParamsAnnotated.conduitsize_metric_rmc} (${wireParamsAnnotated.conduitsize_imperial_rmc})`;
        }else{
            newSpec.conduitSize = `${wireParamsAnnotated.conduitsize_metric_pvc} (${wireParamsAnnotated.conduitsize_imperial_pvc})`;
        }

        newSpec.wireParams = wireParams;
        newSpec.wireParamsAnnotated = wireParamsAnnotated;

        const specId = get(loadSpecEditId);
        console.log(specId);
        if(specId !== null){
            current[specId] = newSpec;
            console.log(current);
            return current;
        }

        return [...current, newSpec]; // Return the updated array
    });

    resetSpecForm();          // Reset the form
    recalcSpecifications(); // Recalculate derived values

    return retVal;
}

export function updateSpecs(loadSpecifications){
    for(let i = 0; i < loadSpecifications.length; i++){
        loadSpecifications[i] = updateWireData(loadSpecifications[i]);
    }
    return loadSpecifications;
}

export function updateWireData(row){
    if(! ('wireParamsAnnotated' in row)){
        row.wireParams = determineWireParams(row.wireSize, row.wireType);
        row.wireParamsAnnotated = formatWireDataRow(row.wireParams);
    }
    return row;
}

/**
 * Loads project data from a parsed JSON object.  This function
 * *replaces* the current project data with the provided data.
 * @param {object} projectData The parsed JSON data.
 */
export function loadProjectData(projectData) {
    try {
        // --- Populate the stores ---
        // Basic fields (with default values if missing):
        projectName.set(projectData.projectName || '');
        floorArea.set(projectData.floorArea || 0);
        volts.set(projectData.volts || 230);  // Default to 220V
        systemPhaseType.set(projectData.systemPhaseType ?? null); // Use nullish coalescing
        selectedOccupancyValue.set(projectData.selectedOccupancyValue ?? null);
        selectedAddOnValue.set(projectData.selectedAddOnValue ?? null);
        selectedTypeValue.set(projectData.selectedTypeValue ?? null);
        laborPercentage.set(projectData.labor || 0.70);
        logisticsCost.set(projectData.logistics || 0.00);
        projectOwner.set(projectData.projectOwner || '');
        projectDate.set(projectData.projectDate || '');
        projectLocation.set(projectData.projectLocation || '');
        projectInCharge.set(projectData.projectInCharge || '');
        globalWireType.set(projectData.globalWireType || '');
        globalConduitType.set(projectData.globalConduitType || '');
        rowConduitType.set(projectData.rowConduitType || 'PCV');

        // Check for missing data in loadSpecifications

        let loadSpecs = [];
        // Load Specifications (Crucially, *replace* the existing array)
        if (Array.isArray(projectData.loadSpecifications)) {
            loadSpecs = updateSpecs(projectData.loadSpecifications);
            console.log(loadSpecs);
            loadSpecifications.set(loadSpecs);
        } else {
            // Handle the case where loadSpecifications is missing or invalid.
            loadSpecifications.set([]); // Set to an empty array
            statusMessage.set({
                text: "Warning: Invalid loadSpecifications data. Loading empty array.",
                type: "warning"
            });
        }

        if (projectData.materialsInventory) {
            materialsInventory.set(projectData.materialsInventory);
        } else {
            materialsInventory.set({});
            statusMessage.set({text: "Warning: No inventory data found.", type: "warning"});
        }

        // Load labor and logistics values
        laborPercentage.set(projectData.labor ?? 0.70);
        logisticsCost.set(projectData.logistics ?? 0.00);

        // Reset other stores (important for consistent state):
        selectedCategoryIndex.set(null);
        selectedCategoryType.set(null);
        lightingRows.set([]);
        showLightingInput.set(false);
        quantity.set(1);
        wattage.set(0);
        convenienceVA.set(180);
        spareName.set('');
        ratings.set('');
        isABC.set(false);
        rowConduitType.set('PVC');


        // Recalculate derived values. VERY important after loading.

        setTimeout(() => statusMessage.set({text: '', type: ''}), 5000);
        recalcSpecifications();
        statusMessage.set({text: "Project loaded successfully!", type: 'info'});

    } catch (error) {
        console.error("Error loading project:", error);  // Log the full error
        statusMessage.set({text: `Error loading project: ${error}`, type: 'error'});
    }
}