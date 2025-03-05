<!-- src/components/SidePanel.svelte -->
<script>
    import {
        applicationDemandFactor,
        floorArea,
        loadByOccupancy,
        sumOfSpecifications,
        totalLoad,
        totalSumOfSpecs,
        volts
    } from "../stores/dataStore";

    import {loadCurrentIFL, getWireRecommendation} from "../utils/calculations.js";

    import {
        derivedHighestNonTrivialLoad,
        serviceEntranceAmpacity,
        totalOfAllAmp,
        totalOfAllVA
    } from "../stores/derivedStore";

    import {formatDecimal, formatWithCommas} from "../utils/misc.js";

</script>

<div class="container-fluid m-2 pl-4">

    <div class="h-20 py-4">
        <div class="my-4 p-2 px-3">

            {#if $floorArea > 0}
                <h3 class="block text-gray-700 font-bold mb-2">
                    Lighting Load at {$totalLoad}VA per m<sup>2</sup>:
                    <code>{$loadByOccupancy} VA</code>
                </h3>

                <h3 class="block text-gray-700 font-bold mb-2">Sum of Specifications</h3>
                {#each Object.entries($sumOfSpecifications) as [category, data]}
                    <div class="max-w-md mx-auto grid grid-cols-2 gap-4 text-sm p-0 m-0">
                        <div class="font-semibold p-0 m-0">
                            {category} ({data.count})
                        </div>
                        <div class="p-0 m-0">
                            <code>{formatWithCommas(data.sum)}</code>
                        </div>
                    </div>
                {/each}


                <p>
                    <span class="font-semibold">Application Demand Factor:</span>
                    <code>{formatWithCommas($applicationDemandFactor)} VA</code>
                </p>
                <p>
                    <span class="font-bold">Total:</span>
                    <code>{formatWithCommas($totalSumOfSpecs)} VA</code>
                </p>
                <p>
                    <span class="font-bold">Total Amp:</span>
                    <code>{formatWithCommas($totalOfAllAmp)}</code>
                </p>
            {/if}
            <p>
                <span class="font-bold">Service Entrance Ampacity:</span>
                <code>{formatWithCommas($serviceEntranceAmpacity)}</code>
            </p>
            <p>
                <span class="font-bold">Wire Recommendation:</span>
                <code>{formatDecimal(getWireRecommendation($serviceEntranceAmpacity))}mm<sup>2</sup></code>
            </p>

            <p>
                <span class="font-bold">Computation at 80% Demand Factor:</span>
                <code>{formatWithCommas(loadCurrentIFL($volts, $derivedHighestNonTrivialLoad, $totalOfAllVA))}</code>
            </p>
            <dl>
                <div class="max-w-md mx-auto grid grid-cols-2 gap-4 text-sm p-0 m-0">
                    <dt class="p-0 m-0 font-bold">Volts</dt>
                    <dd class="p-0 m-0">{$volts}</dd>
                </div>
                <div class="max-w-md mx-auto grid grid-cols-2 gap-4 text-sm p-0 m-0">
                    <dt class="p-0 m-0 font-bold">Highest Motor Load</dt>
                    <dd class="p-0 m-0">{$derivedHighestNonTrivialLoad}</dd>
                </div>
                <div class="max-w-md mx-auto grid grid-cols-2 gap-4 text-sm p-0 m-0">
                    <dt class="p-0 m-0 font-bold">Total VA</dt>
                    <dd class="p-0 m-0">{$totalOfAllVA}</dd>
                </div>
            </dl>
        </div>

    </div>
</div>