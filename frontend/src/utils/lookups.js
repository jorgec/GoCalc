import {wireDataTable} from "../stores/wireDataStore.js";
import {get} from "svelte/store";
import {volts} from "../stores/dataStore.js";
import {constants} from "../stores/constantsStore.js";

export function categoryIndexLookup(cat){
    const categories = constants.loadSpecificationCategories;
    for(let i = 0; i < categories.length; i++){
        if(categories[i].label === cat){
            return i;
        }
    }
    return null;
}

export function categoryTypeLookup(catId, typeValue) {
    const category = constants.loadSpecificationCategories[catId];
    if (Object.hasOwn(category, 'types') && category.types.length > 0) {
        for(let i = 0; i < category.types.length; i++){
            const type = category.types[i];
            if(type.label === typeValue){
                return type.value;
            }
        }
    }
    return null;
}

export function wireDataLookup(wireSize, wireType = "THHN", transform = true) {
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
            if(transform){
                return formatWireDataRow(wireDataTable[i]);
            }
            return wireDataTable[i];
        }
    }

    // If no suitable record is found, return null.
    return null;
}

export function formatWireDataRow(wireDataRow){
    let digits = 1;
    let tmp = parseFloat(wireDataRow.wiresize_metric);
    if(tmp > 100){
        digits = 0;
    }
    tmp = tmp.toFixed(1);
    return {
        "wiresize_metric": tmp + "mm²",
        "wiresize_awg": "#" + wireDataRow.wiresize_awg + " AWG",
        "THW_rating": wireDataRow.THW_rating,
        "THHN_rating": wireDataRow.THHN_rating,
        "conduitsize_metric_pvc": wireDataRow.conduitsize_metric_pvc + "mm",
        "conduitsize_imperial_pvc": wireDataRow.conduitsize_imperial_pvc + '"',
        "conduitsize_metric_rmc": wireDataRow.conduitsize_metric_rmc + "mm",
        "conduitsize_imperial_rmc": wireDataRow.conduitsize_imperial_rmc + '"',
        "branch_AT": wireDataRow.branch_AT,
        "entrance_AT": wireDataRow.entrance_AT,
    }
}

export function determineWireParams(wireSize_metric) {
    wireSize_metric = parseFloat(wireSize_metric);
    const wireData = wireDataTable;

    // Validate that wireSize_metric is a valid number.
    if (typeof wireSize_metric !== "number" || isNaN(wireSize_metric)) {
        console.error("Invalid wireSize_metric provided. Must be a valid number.");
        return wireData[wireData.length - 1];
    }

    // Look for the row in wireData with an exact match on wiresize_metric.
    const result = wireData.find(item => item.wiresize_metric === wireSize_metric);

    // If found, return the corresponding row; otherwise return null.
    return result || wireData[wireData.length - 1];
}

// export function determineWireSize(baseRating, wireType = "THHN") {
//     const key = wireType === "THHN" ? "THHN_rating" :
//         wireType === "THW" ? "THW_rating" :
//             "THHN_rating";
//
//     if (!key) {
//         throw new Error("wireType must be either 'THHN' or 'THW'");
//     }
//     const v = get(volts);
//     const rating = parseFloat(baseRating)/v;
//
//     // Filter wires that meet or exceed the rating
//     const suitableWires = wireDataTable.filter(row => row[key] >= rating);
//     console.log(suitableWires);
//
//     if (suitableWires.length === 0) {
//         return null;
//     }
//
//     // Return the one with the smallest wiresize_metric
//     const res = suitableWires.reduce((smallest, current) =>
//         current.wiresize_metric < smallest.wiresize_metric ? current : smallest
//     );
//     console.log("reduce");
//     console.log(res);
// }

export function determineWireSize(loadSpec, baseRating, wireType = "THHN") {
    const wireSizingData = constants.wireSizingData;
    let key = wireType === "THHN" ? "THHN_rating" :
        wireType === "THW" ? "THW_rating" :
            null;

    if (!key) {
        throw new Error("wireType must be either 'THHN' or 'THW'");
    }

    const v = get(volts);
    let rating = parseFloat(baseRating) / v;
    if(loadSpec.category === "Motor"){
        // console.log("original rating: " + baseRating + "/" + v + "=" + rating);
        rating = rating * 1.75;
        key = "branch_AT";
    }
    if(loadSpec.category === "Kitchen Load"){
        key = "branch_AT";
    }

    // console.log("adjusted rating: " + rating);

    // First, try to find a matching entry in wireSizingData
    let matchingLoadEntry = null;
    for (let i = 0; i < wireSizingData.entries.length; i++) {
        const entry = wireSizingData.entries[i];
        if (
            entry["Load Type"] === loadSpec.category ||
            entry["Load Type"] === loadSpec.name
        ) {
            matchingLoadEntry = entry;
            break;
        }
    }

    let candidateWires;

    if (matchingLoadEntry) {
        const requiredMinSize = matchingLoadEntry["Wire Size"];
        candidateWires = wireDataTable.filter(row =>
            row.wiresize_metric >= requiredMinSize && row[key] >= rating
        );
    } else {
        // No exact match, use fallback logic based on category
        let requiredMinSize = 0;

        if (loadSpec.category === "Motor") {
            requiredMinSize = 3.5;
        } else if (loadSpec.category === "Lighting") {
            // No minimum size constraint, use normal logic
            candidateWires = wireDataTable.filter(row => row[key] >= rating);
        } else {
            requiredMinSize = 3.5;
        }

        if (!candidateWires) {
            candidateWires = wireDataTable.filter(row =>
                row.wiresize_metric >= requiredMinSize && row[key] >= rating
            );
        }
    }

    if (candidateWires.length === 0) {
        return null;
    }

    // Return the smallest wire that matches
    return candidateWires.reduce((smallest, current) =>
        current.wiresize_metric < smallest.wiresize_metric ? current : smallest
    );
}