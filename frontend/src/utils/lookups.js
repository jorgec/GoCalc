import {wireDataTable} from "../stores/wireDataStore.js";

export function wireDataLookup(wireSize, wireType) {
    // Validate inputs: wireSize must be a valid number and wireType must be a string.
    if (typeof wireSize !== "number" || isNaN(wireSize)) {
        console.error("Invalid wireSize provided. Must be a valid number.");
        return false;
    }

    if (typeof wireType !== "string") {
        console.error("Invalid wireType provided. Must be a string.");
        return false;
    }
    // Determine the rating field based on wireType.
    const ratingKey = (wireType === "THHN") ? "THHN_rating" :
        (wireType === "THW")  ? "THW_rating"  : null;

    if (!ratingKey) {
        console.error("Invalid wire type provided. Use 'THHN' or 'THW'.");
        return null;
    }

    // Iterate through the dataset to find the first row where the rating is >= wireSize.
    for (let i = 0; i < wireDataTable.length; i++) {
        if (wireDataTable[i][ratingKey] >= wireSize) {
            return formatWireDataRow(wireDataTable[i]);
        }
    }

    // If no suitable record is found, return null.
    return null;
}

export function formatWireDataRow(wireDataRow){
    return {
        "wiresize_metric": wireDataRow.wiresize_metric + "mm²",
        "wiresize_awg": wireDataRow.wiresize_awg + " AWG",
        "THW_rating": wireDataRow.THW_rating,
        "THHN_rating": wireDataRow.THHN_rating,
        "conduitsize_metric_pvc": wireDataRow.conduitsize_metric_pvc + "mm Ø PVC",
        "conduitsize_imperial_pvc": wireDataRow.conduitsize_imperial_pvc + '"',
        "conduitsize_metric_rmc": wireDataRow.conduitsize_metric_rmc + "mm Ø RMC",
        "conduitsize_imperial_rmc": wireDataRow.conduitsize_imperial_rmc + '"',
        "branch_AT": wireDataRow.branch_AT,
        "entrance_AT": wireDataRow.entrance_AT,
    }
}