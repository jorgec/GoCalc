// src/stores/materialInventoryStore.js
import {derived, get, writable} from 'svelte/store';
import materialConstants from '../material_dictionary.json';

// Store for labor & logistics
export const laborPercentage = writable(70); // Defaults to 70% (0.70)
export const logisticsCost = writable(0.00); // Defaults to 0

// Store for inventory items
export const inventory = writable(materialConstants["Inventory"]);
export const materialsInventory = writable([]);

export const materialDictionary = materialConstants["Inventory"];
export const wireTypes = materialConstants["Wire Types"];

// Store for brands
const initialBrands = materialConstants["brands"];
export const brands = writable(initialBrands);
// Function to add a brand
export function addBrand(newBrand) {
    brands.update(currentBrands => {
        if (!currentBrands.includes(newBrand)) {
            return [...currentBrands, newBrand];
        }
        return currentBrands; // Return the current brands if the new brand already exists
    });
}

// Function to remove a brand
export function removeBrand(brandToRemove) {
    brands.update(currentBrands => {
        return currentBrands.filter(brand => brand !== brandToRemove);
    });
}

// Derived store for calculating the total cost of all inventory items
export const totalInventoryCost = derived(materialsInventory, $materialsInventory => {

    let total = 0;
    Object.values($materialsInventory).forEach(categoryItems => {
        categoryItems.forEach(item => {
            total += parseFloat(item.Subtotal) || 0;
        });
    });
    return total.toFixed(2);
});

// Function to add an item to a category
export function addItemToCategory(category, newItem) {
    inventory.update(currentInventory => {
        if (currentInventory[category]) {
            return {
                ...currentInventory,
                [category]: [...currentInventory[category], newItem]
            };
        } else {
            return {
                ...currentInventory,
                [category]: [newItem]
            };
        }
    });
    console.log("Updated Inventory:", get(inventory)); // Log the updated store using get()
}

// Function to remove an item from a category, using slug as identifier.
export function removeItemFromCategory(category, itemSlug) {
    inventory.update(currentInventory => {
        if (currentInventory[category]) {
            return {
                ...currentInventory,
                [category]: currentInventory[category].filter(item => item.slug !== itemSlug)
            };
        }
        return currentInventory;
    });
}

// Derived calculations
export const materialsCost = derived(totalInventoryCost, $total => $total * 1.25);
export const laborCost = derived([totalInventoryCost, laborPercentage], ([$total, $labor]) => $total * ($labor/100));
export const totalProjectCost = derived([materialsCost, laborCost, logisticsCost],
    ([$materials, $labor, $logistics]) => $materials + $labor + $logistics);

