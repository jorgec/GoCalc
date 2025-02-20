// src/utils/mutators.js
import {get} from 'svelte/store';
import {
    lightingRows,
    loadSpecifications,
    sumOfSpecifications,
    totalSumOfSpecs,
    applicationDemandFactor,
    systemPhaseType,
    selectedCategoryIndex,
    selectedCategoryType,
    ratings,
    isABC,
    spareName,
    quantity,
    wattage,
    convenienceVA,
    selectedLightingDemandFactorID,
    selectedOccupancyValue,
    selectedAddOnValue,
    selectedTypeValue,
    floorArea,
    projectName,
    volts,
} from '../stores/dataStore';

import {
    showLightingInput,
    statusMessage
} from '../stores/uiStore';

import {
    inventory,
    laborPercentage,
    logisticsCost
} from '../stores/materialInventoryStore';

import {constants} from '../stores/constantsStore';
import {determineWireSizeAndType, getSumOfSpecifications, determineConduitSize} from './calculations';

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

    // --- Handle each category separately ---

    // LIGHTING (Category Index 0)
    if (idx === 0) {
        let totalLighting = 0;
        let rowDetails = [];
        // Use an IIFE
        lightingRows.subscribe(rows => {
            for (let row of rows) {
                totalLighting += row.wattage * row.quantity;
                // Find correct type of selection
                let foundType = (category.types || []).find(t => t.value === +row.typeValue);
                rowDetails.push({
                    type: foundType ? foundType.label : 'Unknown',  // Handle potentially missing type
                    wattage: row.wattage,
                    quantity: row.quantity
                });
            }
        })();


        details = {
            category: category.label,
            name: `Multiple Lighting Loads (${rowDetails.length} rows)`,
            lightingLoads: rowDetails,
            wattage: totalLighting,
            horsepower: (totalLighting / 746).toFixed(2), // Calculate HP
            quantity: 1, // Quantity is always 1 for the combined lighting load
            subtotal: totalLighting.toFixed(2),
            ratings: '-', // No ratings for lighting
            abc: false    // ABC checkbox doesn't apply to lighting
        };

        // Reset lighting rows & hide input after adding.
        lightingRows.set([]);
        showLightingInput.set(false);
    }

    // CONVENIENCE OUTLET (Category Index 1)
    else if (idx === 1) {
        const qty = get(quantity);
        const cva = get(convenienceVA);

        details = {
            category: category.label,
            name: 'N/A',  // No specific name for convenience outlets
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
        newSpec.sizeOfWire = wireSize;
        newSpec.wireType = wireType;
        newSpec.conduitSize = determineConduitSize(wireSize); // Calculate conduit

        return [...current, newSpec]; // Return the updated array
    });

    resetSpecForm();          // Reset the form
    recalcSpecifications(); // Recalculate derived values
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
        volts.set(projectData.volts || 220);  // Default to 220V
        systemPhaseType.set(projectData.systemPhaseType ?? null); // Use nullish coalescing
        selectedOccupancyValue.set(projectData.selectedOccupancyValue ?? null);
        selectedAddOnValue.set(projectData.selectedAddOnValue ?? null);
        selectedTypeValue.set(projectData.selectedTypeValue ?? null);
        laborPercentage.set(projectData.labor || 0.70);
        logisticsCost.set(projectData.logistics || 0.00);

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

        if (projectData.inventory) {
            inventory.set(projectData.inventory);
        } else {
            inventory.set({});
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
        recalcSpecifications();
        statusMessage.set({text: "Project loaded successfully!", type: 'info'});
        setTimeout(() => statusMessage.set({text: '', type: ''}), 5000);

    } catch (error) {
        console.error("Error loading project:", error);  // Log the full error
        statusMessage.set({text: `Error loading project: ${error}`, type: 'error'});
    }
}