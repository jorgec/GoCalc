export function formatWithCommas(value) {
    if (isNaN(value)) return '0'; // Handle non-numeric values gracefully
    return value.toLocaleString('en-US'); // Uses built-in localization for proper formatting
}