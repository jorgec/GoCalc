// src/stores/uiStore.js
import { writable } from 'svelte/store';

// Original toggles:
export const showLoadSpecs = writable(false);
export const showConsole = writable(false);
export const showSpecForm = writable(false);

// For lighting form input
export const showLightingInput = writable(false);