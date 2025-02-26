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

export function slugify(...strings) {
    return strings.map(str =>
        str
            .replace(/\./g, '_')       // Replace all periods with underscores
            .replace(/\s+/g, '-')      // Replace spaces with dashes
            .replace(/[^a-zA-Z0-9-_]/g, '') // Remove special characters except dashes and underscores
            .toLowerCase()             // Convert to lowercase
    );
}