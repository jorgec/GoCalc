// src/stores/materialInventoryStore.js
import {derived, writable} from 'svelte/store';
import materialConstants from '../material_dictionary.json';

// Store for labor & logistics
export const laborPercentage = writable(0.70); // Defaults to 70% (0.70)
export const logisticsCost = writable(0.00); // Defaults to 0

// Store for inventory items
export const inventory = writable({});

// Store for brands
export const materialDictionary = materialConstants["Inventory"];
export const brands = materialConstants["brands"];
export const wireTypes = materialConstants["Wire Types"];

// Derived store for calculating the total cost of all inventory items
export const totalInventoryCost = derived(inventory, $inventory => {
    let total = 0;
    Object.values($inventory).forEach(categoryItems => {
        categoryItems.forEach(item => {
            total += parseFloat(item.Subtotal) || 0;
        });
    });
    return total.toFixed(2);
});

// Derived calculations
export const materialsCost = derived(totalInventoryCost, $total => $total * 1.25);
export const laborCost = derived([totalInventoryCost, laborPercentage], ([$total, $labor]) => $total * $labor);
export const totalProjectCost = derived([materialsCost, laborCost, logisticsCost],
    ([$materials, $labor, $logistics]) => $materials + $labor + $logistics);