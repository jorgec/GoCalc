// src/stores/uiStore.js
import { writable } from 'svelte/store';

// Original toggles:
export const showLoadSpecs = writable(false);
export const showConsole = writable(false);
export const showSpecForm = writable(false);
export const showCsvTable = writable(false);
export const intentionToClose = writable(false);

// For lighting form input
export const showLightingInput = writable(false);

export const statusMessage = writable({ text: '', type: '' }); // { text: string, type: 'info' | 'warning' | 'error' | '' }

export const showMaterialsInventory = writable(false);

