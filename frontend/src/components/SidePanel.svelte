<!-- src/components/SidePanel.svelte -->
<script>
    import {
        applicationDemandFactor,
        floorArea,
        globalConduitType,
        globalWireType,
        loadByOccupancy,
        loadSpecifications,
        sumOfSpecifications,
        totalLoad,
        totalSumOfSpecs,
        volts
    } from "../stores/dataStore";

    import {loadCurrentIFL} from "../utils/calculations.js";
    import {wireDataLookup} from "../utils/lookups.js";
    import {recalcSpecifications} from "../utils/mutators.js";

    import {showMaterialsInventory, showImageModal, modalImage} from "../stores/uiStore";
    import wire_table from "../assets/images/wire_table.jpg";
    import conduit_table from "../assets/images/conduit_table.jpg";
    import overcurrent_protection from "../assets/images/overcurrent_protection.jpg";
    import {
        derivedHighestNonTrivialLoad,
        serviceEntranceAmpacity,
        totalOfAllAmp,
        totalOfAllVA,
        updatePanelBoardCollations
    } from "../stores/derivedStore";

    import {formatWithCommas} from "../utils/misc.js";
    import {SaveMaterialInventory, LoadMaterialInventory, ExposePath} from "../../wailsjs/go/main/App.js";
    import {materialDictionary, wireTypes, brands, inventory} from "../stores/materialInventoryStore.js";
    import {get} from "svelte/store";

    $: wireRecommendation = wireDataLookup($serviceEntranceAmpacity, $globalWireType);

    $: if ($globalConduitType) {
        loadSpecifications.update(specs => {
            return specs;
        });
        recalcSpecifications(); // Recalculate after moving
    }

    let materialInventory;
    let savePath;

    function PrepMaterialInventory(){
        materialInventory = {
            "Inventory": $inventory,
            "brands": $brands,
            "Wire Types": wireTypes,
        }
        SaveMaterialInventory(materialInventory);
    }

    async function ArmMaterialInventory() {
        materialInventory = await LoadMaterialInventory();
        savePath = await ExposePath("material_dictionary.json");
        console.log(materialInventory);
        brands.set(materialInventory.brands);
        inventory.set(materialInventory.Inventory);
    }

</script>

<div class="container-fluid m-2 pl-4">
    {#if $showMaterialsInventory}
        {savePath}
        <div class="h-20 py-4">
            <div class="my-4 p-2 px-3">
                <button
                        type="button"
                        class="bg-gray-600 hover:bg-gray-800 text-gray-200 hover:text-white p-2 rounded"
                        on:click|preventDefault={PrepMaterialInventory}
                >
                    Save Materials
                </button>
                <button
                        class="bg-gray-600 hover:bg-gray-800 text-gray-200 hover:text-white p-2 rounded"
                        on:click|preventDefault={ArmMaterialInventory}
                >
                    Load Materials
                </button>
            </div>
        </div>
    {:else}
        <div class="h-20 py-4">
            <div class="my-4 p-2 px-3">

                {#if parseFloat($floorArea) > 0}
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
                                <code>{formatWithCommas(data.sum)} VA</code>
                            </div>
                        </div>
                    {/each}


                    <p>
                        <span class="font-semibold">Application Demand Factor:</span>
                        <code>{formatWithCommas($applicationDemandFactor)} VA</code>
                    </p>
                    <p>
                        <span class="font-bold">Total:</span>
                        <code>{formatWithCommas($totalOfAllVA)} VA</code>
                    </p>
                    <p>
                        <span class="font-bold">Total Amp:</span>
                        <code>{formatWithCommas($totalOfAllAmp)} A</code>
                    </p>
                {/if}
                <p>
                    <span class="font-bold">Service Entrance Ampacity:</span>
                    <code>{formatWithCommas($serviceEntranceAmpacity)} A</code>
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
                            <option value="THHN">THHN</option>
                            <option value="THW">THW</option>
                        </select>
                    </div>
                    <div>
                        <label for="conduitType" class="block text-gray-700 font-bold mb-2">Conduit Type</label>
                        <select
                                id="conduitType"
                                bind:value={$globalConduitType}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="PVC">PVC</option>
                            <option value="RMC">RMC</option>
                        </select>
                    </div>
                </div>
                {#if wireRecommendation}
                    <div class="my-4 p-4 text-gray-900 bg-green-200">

                        Use <strong>2 - <a href="#!" on:click|preventDefault={() => modalImage.set(wire_table)} class="underline">
                        {wireRecommendation.wiresize_metric} ({wireRecommendation.wiresize_awg}
                        ) {$globalWireType}</a> wires</strong>

                        in
                        <strong>
                            <a href="#!" on:click|preventDefault={() => modalImage.set(conduit_table)} class="underline">
                            {#if $globalConduitType === "PVC"}
                                {wireRecommendation.conduitsize_metric_pvc}
                                ({wireRecommendation.conduitsize_imperial_pvc}) Ø {$globalConduitType} pipe
                            {:else}
                                {wireRecommendation.conduitsize_metric_rmc}
                                ({wireRecommendation.conduitsize_imperial_rmc}) Ø {$globalConduitType} pipe
                            {/if}
                            </a>
                        </strong>
                    </div>
                    <div class="my-4 p-4 text-gray-900 bg-green-200">
                        Use
                        <strong>1 -
                            <a href="#!" on:click|preventDefault={() => modalImage.set(overcurrent_protection)} class="underline">
                                {wireRecommendation.entrance_AT} AT, 2P, {$volts}V 10 KAIC MCCB
                            </a>
                        </strong>
                        for Overcurrent Protection
                    </div>
                {:else }
                    <div class="text-red-900 bg-red-200 p-4 my-4">
                        Insufficient data for wire recommendation
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
            <div class="my-4 p-2 px-3">
                <button
                        class="bg-gray-600 hover:bg-gray-800 text-gray-200 hover:text-white p-2 rounded"
                        on:click={recalcSpecifications}
                >
                    Recalculate Specifications
                </button>
            </div>
        </div>
    {/if}
</div>