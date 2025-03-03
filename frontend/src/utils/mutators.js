// src/utils/mutators.js
import {get} from 'svelte/store';
import {
    applicationDemandFactor,
    convenienceVA,
    floorArea,
    isABC,
    lightingRows,
    loadSpecifications,
    projectDate,
    projectInCharge,
    projectLocation,
    projectName,
    projectOwner,
    quantity,
    ratings,
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

import {showLightingInput, statusMessage} from '../stores/uiStore';

import {laborPercentage, logisticsCost, materialsInventory} from '../stores/materialInventoryStore';

import {constants} from '../stores/constantsStore';
import {determineConduitSize, determineWireSizeAndType, getSumOfSpecifications} from './calculations';

// --- Helper Functions (Internal) ---

/** Recompute sums & demand factors after changes to loadSpecifications */
function recalcSpecifications() {
    const items = get(loadSpecifications);
    const {sumOfSpecs, totalSumOfSpecs: total, applicationDemandFactor: adf} =
        getSumOfSpecifications(items);

    sumOfSpecifications.set(sumOfSpecs);
    totalSumOfSpecs.set(total);
    applicationDemandFactor.set(adf);
}

// --- Exported Mutator Functions ---

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
        const w = get(wattage);
        const catTypeIndex = get(selectedCategoryType);
        const catType = category.types?.[catTypeIndex]; // Safe access
        const typeLabel = catType ? catType.label : 'Unknown';

        details = {
            category: category.label,
            name: typeLabel,
            quantity: 1,
            wattage: w,
            horsepower: (w / 746).toFixed(2),
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
        const {wireSize, wireType} = determineWireSizeAndType({...newSpec, volts: get(volts)});

        newSpec.wireSize = wireSize;
        newSpec.wireType = wireType;
        newSpec.wireTypeSelection = wireType;
        newSpec.wireType = wireType;
        newSpec.conduitSize = determineConduitSize(wireSize); // Calculate conduit

        return [...current, newSpec]; // Return the updated array
    });

    resetSpecForm();          // Reset the form
    recalcSpecifications(); // Recalculate derived values

    return retVal;
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

        // Load Specifications (Crucially, *replace* the existing array)
        if (Array.isArray(projectData.loadSpecifications)) {
            loadSpecifications.set(projectData.loadSpecifications);
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


        // Recalculate derived values. VERY important after loading.

        setTimeout(() => statusMessage.set({text: '', type: ''}), 5000);
        recalcSpecifications();
        statusMessage.set({text: "Project loaded successfully!", type: 'info'});

    } catch (error) {
        console.error("Error loading project:", error);  // Log the full error
        statusMessage.set({text: `Error loading project: ${error}`, type: 'error'});
    }
}