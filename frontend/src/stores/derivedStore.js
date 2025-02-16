// src/stores/derivedStore.js
import { derived } from 'svelte/store';
import { loadSpecifications, volts, systemPhaseType } from './dataStore';

/**
 * 1) CSV Data:
 *    This precisely replicates your original logic for building
 *    a CSV-like array, including the pairing logic for 3-phase loads.
 */
export const csvData = derived(
    [loadSpecifications, volts, systemPhaseType],
    ([$loadSpecifications, $volts, $phase]) => {
        const result = [];
        let pairIndex = 0; // increments for each non-ABC spec, 2 specs per "group"

        for (let i = 0; i < $loadSpecifications.length; i++) {
            const spec = $loadSpecifications[i];
            const CRKTno = i + 1;

            // Build the "Load" column
            let loadStr = spec.name;
            if (spec.category === 'Lighting' && spec.lightingLoads) {
                const combos = spec.lightingLoads.map(
                    (row) => `${row.type}: ${row.wattage}W x ${row.quantity}`
                );
                loadStr = combos.join('; ');
            }

            // Initialize each row object with the desired columns
            let rowObj = {
                CRKTno,
                Load: loadStr,
                Ratings: spec.ratings || '-',
                'Volt Ampere': spec.subtotal,
                Volts: $volts,
                AmpLoadSingle: '',
                AmpLoadAB: '',
                AmpLoadBC: '',
                AmpLoadCA: '',
                AmpLoadABC: '',
                SizeOfWire: spec.sizeOfWire || '',
                ConduitSize: spec.conduitSize || ''
            };

            // Compute numeric amp
            const numericSubtotal = parseFloat(spec.subtotal) || 0;
            const ampLoadValue = $volts > 0 ? numericSubtotal / $volts : 0;

            if ($phase === 0) {
                // Single-phase => use AmpLoadSingle
                rowObj.AmpLoadSingle = ampLoadValue.toFixed(2);
            } else {
                // 3-phase logic
                if (spec.abc) {
                    // If user checked ABC, put it in AmpLoadABC
                    rowObj.AmpLoadABC = ampLoadValue.toFixed(2);
                    // Do NOT increment pairIndex => next spec uses same group
                } else {
                    // Pairing logic => 2 specs per group => group = floor(pairIndex / 2) mod 3
                    const group = Math.floor(pairIndex / 2) % 3;
                    if (group === 0) {
                        rowObj.AmpLoadAB = ampLoadValue.toFixed(2);
                    } else if (group === 1) {
                        rowObj.AmpLoadBC = ampLoadValue.toFixed(2);
                    } else {
                        rowObj.AmpLoadCA = ampLoadValue.toFixed(2);
                    }
                    pairIndex++;
                }
            }

            result.push(rowObj);
        }

        return result;
    }
);

/**
 * 2) Totals for the table footer:
 *    totalOfAllVA => sum of all 'subtotal'
 *    totalOfAllAmp => sum of all 'subtotal/volts'
 */
export const totalOfAllVA = derived(
    [loadSpecifications, volts],
    ([$specs, $volts]) => {
        let vaSum = 0;
        for (const spec of $specs) {
            vaSum += parseFloat(spec.subtotal) || 0;
        }
        return vaSum;
    }
);

export const totalOfAllAmp = derived(
    [loadSpecifications, volts],
    ([$specs, $volts]) => {
        let ampSum = 0;
        for (const spec of $specs) {
            const numericSubtotal = parseFloat(spec.subtotal) || 0;
            ampSum += $volts > 0 ? numericSubtotal / $volts : 0;
        }
        return ampSum;
    }
);