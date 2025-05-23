// src/stores/dataStore.js
import { writable } from 'svelte/store';
import {SaveConstants} from "../../wailsjs/go/main/App.js";

// Basic fields
export const isUnlocked = writable(false);
export const projectName = writable('');
export const projectLocation = writable('');
export const projectOwner = writable('');
export const projectInCharge = writable('');
export const projectDate = writable(Date());
export const floorArea = writable('');
export const panelboardName = writable('');
export const totalLoad = writable(0);          // used by occupancy logic
export const loadByOccupancy = writable(0);    // occupant-based calculation

// Occupancy selections
export const selectedOccupancyValue = writable(null);
export const selectedAddOnValue = writable(null);
export const selectedTypeValue = writable(null);

// System Phase & Voltage
export const systemPhaseType = writable(0); // 0=single-phase, 1=three-phase
export const volts = writable(230);

// For category-based specs
export const selectedCategoryIndex = writable(null);
export const selectedCategoryType = writable(null);

// For lighting
export const lightingRows = writable([]);
export const sa = writable(0);
export const sab = writable(0);
export const sabc = writable(0);
export const threeGang = writable(0);

// For convenience outlet
export const convenienceVA = writable(180);

// Shared fields
export const quantity = writable(1);
export const wattage = writable(0);
export const horsepower = writable(0);
export const spareName = writable('');
export const ratings = writable('');
export const isABC = writable(false);
export const demandFactor = writable(100.0);

// The array of all specs
export const loadSpecifications = writable([]);

// Summaries
export const sumOfSpecifications = writable({});
export const totalSumOfSpecs = writable(0);
export const selectedLightingDemandFactorID = writable(null);
export const applicationDemandFactor = writable(0);

// Global specs
export const globalWireType = writable("THHN");
export const globalConduitType = writable("PVC");

export const rowConduitType = writable("PVC");
export const rowWireType = writable("THHN");

export const panelBoards = writable([]);
export const panelBoardList = writable([]);
export const currentPanelBoard = writable(null);

// Main Panel data
export const panelBoardCollations = writable({
    "va": [],
    "a": [],
    "wire": [],
    "conduit": [],
    "branchAT": [],
    "highestMotorLoad": [],
    "serviceEntranceAmpacity": [],
    "wireRecommendation": []

});

export const mainDistributionSums = writable({
    totalVA: 0,
    totalA: 0,
    getMaxLoad: 0,
    ifl: 0,
    i: 0,
    wireRecommendation: '',
    conduitRecommendation: '',
    at: 0
});

export function updateLoadSpecifications(path, value) {
    loadSpecifications.update(current => {

        const keys = path.split('.');
        let obj = JSON.parse(JSON.stringify(current));
        let ref = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];

            if (!ref[key]) ref[key] = {}; // Ensure path exists
            else ref[key] = { ...ref[key] };

            ref = ref[key]; // Move deeper
        }

        ref[keys[keys.length - 1]] = value;

        return obj;
    });
}

window.myLoadSpecs = loadSpecifications;