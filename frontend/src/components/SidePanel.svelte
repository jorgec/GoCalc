<!-- src/components/SidePanel.svelte -->
<script>
    import {
        applicationDemandFactor,
        floorArea,
        loadByOccupancy,
        sumOfSpecifications,
        totalLoad,
        totalSumOfSpecs,
        volts,
        globalConduitType,
        globalWireType
    } from "../stores/dataStore";

    import {loadCurrentIFL, getWireRecommendation} from "../utils/calculations.js";
    import {wireDataLookup} from "../utils/lookups.js";

    import {
        derivedHighestNonTrivialLoad,
        serviceEntranceAmpacity,
        totalOfAllAmp,
        totalOfAllVA
    } from "../stores/derivedStore";

    import {formatDecimal, formatWithCommas} from "../utils/misc.js";
    console.log("globals", $globalWireType, $globalConduitType);

    $: wireRecommendation = wireDataLookup($serviceEntranceAmpacity, $globalWireType);

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

        </div>
        <div class="my-4 p-2 px-3">
            <h2 class="text-xl font-bold">Wire and Conduit Recommendation</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="wireType" class="block text-gray-700 font-bold mb-2">Wire Type</label>
                    <select
                            id="wireType"
                            bind:value={$globalWireType}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option></option>
                        <option value="THW">THW</option>
                        <option value="THHN">THHN</option>
                    </select>
                </div>
                <div>
                    <label for="conduitType" class="block text-gray-700 font-bold mb-2">Conduit Type</label>
                    <select
                            id="conduitType"
                            bind:value={$globalConduitType}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option></option>
                        <option value="PCV">PCV</option>
                        <option value="RMC">RMC</option>
                    </select>
                </div>
            </div>
            {#if wireRecommendation}
                <div class="my-4 p-4 text-gray-900 bg-green-200">
                    <strong>
                        Use 2 - {wireRecommendation.wiresize_metric} ({wireRecommendation.wiresize_awg}) {$globalWireType} wires
                        in
                        {#if $globalConduitType === "PCV"}
                            {wireRecommendation.conduitsize_metric_pvc} ({wireRecommendation.conduitsize_imperial_pvc}) {$globalConduitType} pipe
                        {:else}
                            {wireRecommendation.conduitsize_metric_rmc} ({wireRecommendation.conduitsize_imperial_rmc}) {$globalConduitType} pipe
                        {/if}
                    </strong>
                </div>
            {:else }
                <div class="text-red-900 bg-red-200 p-4 my-4">
                    Please set Wire and Conduit Type
                </div>
            {/if}
        </div>
        <div class="my-4 p-2 px-3">
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