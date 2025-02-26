export function formatWithCommas(value) {
    if (isNaN(value)) return '0'; // Handle non-numeric values gracefully
    return value.toLocaleString('en-US'); // Uses built-in localization for proper formatting
}

export function formatInt(value) {
    if (typeof value === 'string') {
        value = parseFloat(value); // Convert string to number
    }
    return isNaN(value) ? 0 : Math.trunc(value); // Ensure it's a number and truncate
}