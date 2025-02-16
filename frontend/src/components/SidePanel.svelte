<!-- src/components/SidePanel.svelte -->
<script>
    import {
        totalLoad,
        loadByOccupancy,
        sumOfSpecifications,
        applicationDemandFactor,
        totalSumOfSpecs
    } from "../stores/dataStore";
</script>

<div class="container-fluid m-2 pl-4">
    <div class="h-20 py-4">
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
                    <code>{data.sum}</code>
                </div>
            </div>
        {/each}

        <div class="my-4 p-2 px-3 bg-teal-300 text-teal-950">
            <p>
                <span class="font-semibold">Application Demand Factor:</span>
                <code>{$applicationDemandFactor} VA</code>
            </p>
            <p>
                <span class="font-bold">Total:</span>
                <code>{$totalSumOfSpecs} VA</code>
            </p>
        </div>
    </div>
</div>