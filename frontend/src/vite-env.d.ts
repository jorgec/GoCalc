/// <reference types="svelte" />
/// <reference types="vite/client" />
declare global {
    interface Window {
        runtime: any; // You can replace 'any' with a more specific type if you have it
    }
}