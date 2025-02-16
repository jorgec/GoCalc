// src/utils/calculations.js
import { get } from 'svelte/store';
import { constants } from '../stores/constantsStore';
import { selectedLightingDemandFactorID } from '../stores/dataStore';
/**
 * Calculate lighting demand factor based on
 * "lightingDemandFactors" rules from constants.json
 */
export function calculateDemandFactor(value) {
    const dfID = get(selectedLightingDemandFactorID);
    if (dfID !== null) {
        const rules = constants.lightingDemandFactors[dfID];
        let remainder = value;
        let total = 0;

        for (let i = 0; i < rules.length; i++) {
            const [max, percentage] = rules[i];
            let applicableValue = 0;

            if (max === null) {
                // no upper limit
                applicableValue = remainder;
            } else if (remainder > max) {
                applicableValue = max - (rules[i - 1] ? rules[i - 1][0] : 0);
                remainder -= applicableValue;
            } else {
                applicableValue = remainder;
                remainder = 0;
            }
            total += applicableValue * (percentage / 100);
            if (remainder === 0) break;
        }
        return total;
    }
    return value;
}

/**
 * Summarize all specs with demand factor logic
 */
export function getSumOfSpecifications(items) {
    let sumOfSpecs = {};
    let tempLightingDemandFactor = 0;
    let tempConvenienceDemandFactor = 0;
    let tempOtherDemandFactor = 0;
    let totalSumOfSpecs = 0;

    // Summation by category
    for (let item of items) {
        if (!sumOfSpecs[item.category]) {
            sumOfSpecs[item.category] = { sum: 0, count: 0 };
        }
        sumOfSpecs[item.category].sum += parseFloat(item.subtotal) || 0;
        sumOfSpecs[item.category].count += 1;
    }

    // Demand factor rules
    for (const [key, value] of Object.entries(sumOfSpecs)) {
        // Single Kitchen load => 80% rule
        if (value.count === 1 && key === 'Kitchen Load') {
            sumOfSpecs[key].sum = parseFloat((value.sum * 0.8).toFixed(2));
        }

        if (key === 'Lighting') {
            tempLightingDemandFactor += calculateDemandFactor(parseFloat(value.sum));
        } else if (key === 'Convenience outlet') {
            tempConvenienceDemandFactor += value.sum;
        } else {
            tempOtherDemandFactor += value.sum;
        }
    }

    // 10,000 VA + 50% of the remainder for convenience
    if (tempConvenienceDemandFactor > 10000) {
        let tempExcess = tempConvenienceDemandFactor - 10000;
        tempConvenienceDemandFactor = 10000 + tempExcess * 0.5;
    }

    const finalLightingPlusConvenience = tempLightingDemandFactor + tempConvenienceDemandFactor;
    totalSumOfSpecs = finalLightingPlusConvenience + tempOtherDemandFactor;

    return {
        sumOfSpecs,
        totalSumOfSpecs,
        applicationDemandFactor: finalLightingPlusConvenience
    };
}