// src/stores/dataStore.js
import { writable } from 'svelte/store';

// Basic fields
export const projectName = writable('');
export const projectLocation = writable('');
export const projectOwner = writable('');
export const projectInCharge = writable('');
export const projectDate = writable(Date());
export const floorArea = writable(0);
export const totalLoad = writable(0);          // used by occupancy logic
export const loadByOccupancy = writable(0);    // occupant-based calculation

// Occupancy selections
export const selectedOccupancyValue = writable(null);
export const selectedAddOnValue = writable(null);
export const selectedTypeValue = writable(null);

// System Phase & Voltage
export const systemPhaseType = writable(null); // 0=single-phase, 1=three-phase
export const volts = writable(230);

// For category-based specs
export const selectedCategoryIndex = writable(null);
export const selectedCategoryType = writable(null);

// For lighting
export const lightingRows = writable([]);

// For convenience outlet
export const convenienceVA = writable(180);

// Shared fields
export const quantity = writable(1);
export const wattage = writable(0);
export const horsepower = writable(0);
export const spareName = writable('');
export const ratings = writable('');
export const isABC = writable(false);

// The array of all specs
export const loadSpecifications = writable([]);

// Summaries
export const sumOfSpecifications = writable({});
export const totalSumOfSpecs = writable(0);
export const selectedLightingDemandFactorID = writable(null);
export const applicationDemandFactor = writable(0);

