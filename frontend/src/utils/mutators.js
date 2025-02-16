// src/utils/mutators.js
import { get } from 'svelte/store';
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
    floorArea
} from '../stores/dataStore';

import {
    showLightingInput
} from '../stores/uiStore'; // <--- we also toggle lighting input here if needed

import { constants } from '../stores/constantsStore';
import { getSumOfSpecifications } from './calculations';

/**
 * EXACT logic from your original code, but placed here
 * in a utility file that mutates your Svelte stores.
 */

/** Move a specification row UP */
export function moveSpecUp(index) {
    if (index <= 0) return;
    loadSpecifications.update(specs => {
        const newSpecs = [...specs];
        [newSpecs[index - 1], newSpecs[index]] = [newSpecs[index], newSpecs[index - 1]];
        return newSpecs;
    });
    recalcSpecifications();
}

/** Move a specification row DOWN */
export function moveSpecDown(index) {
    loadSpecifications.update(specs => {
        if (index >= specs.length - 1) return specs;
        const newSpecs = [...specs];
        [newSpecs[index + 1], newSpecs[index]] = [newSpecs[index], newSpecs[index + 1]];
        return newSpecs;
    });
    recalcSpecifications();
}

/** Remove a specification from the main list */
export function removeLoadSpecification(indexToRemove) {
    loadSpecifications.update(current =>
        current.filter((_, idx) => idx !== indexToRemove)
    );
    recalcSpecifications();
}

/** Add another row for lighting AND set `showLightingInput = true` */
export function addAnotherLightingRow() {
    showLightingInput.set(true);
    lightingRows.update(rows => [
        ...rows,
        { typeValue: null, wattage: 0, quantity: 1 }
    ]);
}

/** Remove one lighting row by index */
export function removeLightingRow(rowIndex) {
    lightingRows.update(rows => rows.filter((_, i) => i !== rowIndex));
}

/**
 * Main function to add the chosen specification
 * based on category, then recalc
 */
export function addLoadSpecification() {
    const idx = get(selectedCategoryIndex);
    if (idx == null) return;

    let category = constants.loadSpecificationCategories[idx];
    let details = {};

    // LIGHTING
    if (idx === 0) {
        let totalLighting = 0;
        let rowDetails = [];
        let unsub = lightingRows.subscribe(rows => {
            for (let row of rows) {
                totalLighting += row.wattage * row.quantity;
                let foundType = (category.types || []).find(t => t.value === +row.typeValue);
                rowDetails.push({
                    type: foundType ? foundType.label : 'Unknown',
                    wattage: row.wattage,
                    quantity: row.quantity
                });
            }
        });
        unsub();

        details = {
            category: category.label,
            name: `Multiple Lighting Loads (${rowDetails.length} rows)`,
            lightingLoads: rowDetails,
            wattage: totalLighting,
            horsepower: (totalLighting / 746).toFixed(2),
            quantity: 1,
            subtotal: totalLighting.toFixed(2),
            ratings: '-',
            abc: false
        };

        // Reset lighting rows & hide the input form
        lightingRows.set([]);
        showLightingInput.set(false);
    }

    // CONVENIENCE OUTLET
    else if (idx === 1) {
        const qty = get(quantity);
        const cva = get(convenienceVA);

        details = {
            category: category.label,
            name: 'N/A',
            quantity: qty,
            va: cva,
            wattage: cva,
            horsepower: (cva / 746).toFixed(2),
            subtotal: (qty * cva).toFixed(2),
            ratings: '-',
            abc: false
        };
    }

    // KITCHEN
    else if (idx === 2) {
        const w = get(wattage);
        details = {
            category: category.label,
            name: category.types[get(selectedCategoryType)].label,
            quantity: 1,
            wattage: w,
            horsepower: (w / 746).toFixed(2),
            subtotal: (1 * w).toFixed(2),
            ratings: get(ratings).trim() !== '' ? get(ratings) : '-',
            abc: (get(systemPhaseType) == 1 && get(isABC)) ? true : false
        };
    }

    // MOTOR
    else if (idx === 3) {
        const w = get(wattage);
        details = {
            category: category.label,
            name: category.types[get(selectedCategoryType)].label,
            quantity: 1,
            wattage: w,
            horsepower: (w / 746).toFixed(2),
            subtotal: (1 * w).toFixed(2),
            ratings: get(ratings).trim() !== '' ? get(ratings) : '-',
            abc: (get(systemPhaseType) == 1 && get(isABC)) ? true : false
        };
    }

    // SPARE
    else if (idx === 4) {
        const w = get(wattage);
        const chosenName = get(spareName).trim() !== '' ? get(spareName) : 'Spare';
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

    // OTHER LOADS
    else if (idx === 5) {
        const w = get(wattage);
        details = {
            category: category.label,
            name: category.types[get(selectedCategoryType)].label,
            quantity: 1,
            wattage: w,
            horsepower: (w / 746).toFixed(2),
            subtotal: (1 * w).toFixed(2),
            ratings: get(ratings).trim() !== '' ? get(ratings) : '-',
            abc: (get(systemPhaseType) == 1 && get(isABC)) ? true : false
        };
    }

    // Finally add the spec
    loadSpecifications.update(current => [...current, { ...details }]);

    // Reset fields
    quantity.set(1);
    wattage.set(0);
    convenienceVA.set(180);
    horsepower.set(0);
    spareName.set('');
    selectedCategoryIndex.set(null);
    selectedCategoryType.set(null);
    ratings.set('');
    isABC.set(false);

    recalcSpecifications();
}

/** Recompute sums & demand factors after changes */
function recalcSpecifications() {
    const items = get(loadSpecifications);
    const { sumOfSpecs, totalSumOfSpecs: total, applicationDemandFactor: adf } =
        getSumOfSpecifications(items);

    sumOfSpecifications.set(sumOfSpecs);
    totalSumOfSpecs.set(total);
    applicationDemandFactor.set(adf);
}