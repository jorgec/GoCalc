import { writable } from 'svelte/store';

// ✅ Load the initial JSON statically (during bundling)
import initialConstants from '../constants.json';

// ✅ Use writable store with initial constants
const constantsStore = writable(initialConstants);

// 🔄 Fetch and update constants dynamically at runtime
async function loadConstants() {
    try {
        const response = await fetch('/constants.json'); // Load dynamically
        if (!response.ok) throw new Error('Failed to load constants.json');
        const data = await response.json();
        constantsStore.set(data); // Update the store with fetched data
    } catch (error) {
        console.error('Error loading constants:', error);
    }
}

// ✅ Load new constants at startup (overrides initial values if needed)
loadConstants();

// ✅ Proxy to allow `constants.key` access directly
export const constants = new Proxy({}, {
    get: (_, key) => {
        let value = undefined;
        constantsStore.subscribe(data => {
            value = data[key] ?? (key === "occupancyTypes" ? [] : undefined);
        })(); // Immediately get latest value
        return value;
    }
});

setInterval(loadConstants, 5000); // Reload every 5 seconds