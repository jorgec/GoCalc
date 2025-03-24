<!-- src/components/BasicForm.svelte -->
<script>
    import {
        floorArea,
        loadByOccupancy,
        selectedAddOnValue,
        selectedLightingDemandFactorID,
        selectedOccupancyValue,
        selectedTypeValue,
        systemPhaseType,
        totalLoad,
        volts,
        rowWireType,
        rowConduitType,
    } from "../stores/dataStore";

    import {showSpecForm} from "../stores/uiStore";
    import {constants} from "../stores/constantsStore";

    // Derive occupant-based logic, just like original
    $: occupancyObj = constants.occupancyTypes.find(o => o.value == +$selectedOccupancyValue);
    $: selectedOccupancyTypes = occupancyObj?.types || [];
    $: selectedAddOns = occupancyObj?.addons || [];

    // If user picks an occupancy => show the spec form
    $: showSpecForm.set($selectedOccupancyValue !== null);

    // EXACT occupant-based calculations from your original $: blocks
    $: {
        if ($selectedOccupancyValue !== null && $selectedTypeValue !== null) {
            const occType = selectedOccupancyTypes[$selectedTypeValue];
            if (occType) {
                let tmpLoad = occType.unit_load;
                if (selectedAddOns.length > 0 && $selectedAddOnValue !== null && $selectedAddOnValue !== '') {
                    const addon = selectedAddOns[$selectedAddOnValue];
                    if (addon) tmpLoad += addon.unit_load;
                }
                totalLoad.set(tmpLoad);
                loadByOccupancy.set(tmpLoad * $floorArea);
                selectedLightingDemandFactorID.set(occType.lighting_df);
            }
        } else {
            totalLoad.set(0);
            loadByOccupancy.set(0);
            selectedLightingDemandFactorID.set(null);
        }
    }
</script>

<!-- EXACT markup for floor area, occupancy selects, system phase, volts -->
<div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">Load Specifications</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div class="h-20 py-4">
            <label for="floorArea" class="block text-gray-700 text-sm font-bold mb-2">
                Floor Area:
            </label>
            <input
                    type="number"
                    id="floorArea"
                    bind:value={$floorArea}
                    required
                    min="0"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter floor area"
            />
        </div>

        <div class="h-20 py-4">
            <label for="typeOfOccupancy" class="block text-gray-700 text-sm font-bold mb-2">
                Type of Occupancy:
            </label>
            <select
                    bind:value={$selectedOccupancyValue}
                    required
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                <option value={null}>-- Select --</option>
                {#each constants.occupancyTypes as {label, value}}
                    <option value={value}>{label}</option>
                {/each}
            </select>
        </div>

        {#if selectedOccupancyTypes.length > 0}
            <div class="h-20 py-4">
                <label for="occupancyType" class="block text-gray-700 text-sm font-bold mb-2">
                    Occupancy Type:
                </label>
                <select
                        bind:value={$selectedTypeValue}
                        required
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value={null}>-- Select --</option>
                    {#each selectedOccupancyTypes as t, i}
                        <option value={i}>{t.label}</option>
                    {/each}
                </select>
            </div>
        {/if}

        {#if selectedAddOns.length > 0}
            <div class="h-20 py-4">
                <label for="occupancyAddOn" class="block text-gray-700 text-sm font-bold mb-2">
                    AddOn:
                </label>
                <select
                        bind:value={$selectedAddOnValue}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="">Optional</option>
                    {#each selectedAddOns as addon, i}
                        <option value={i}>{addon.label}</option>
                    {/each}
                </select>
            </div>
        {/if}

        <div class="h-20 py-4">
            <label for="systemPhaseType" class="block text-gray-700 text-sm font-bold mb-2">
                System Phase:
            </label>
            <select
                    bind:value={$systemPhaseType}
                    required
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                {#each constants.phaseTypes as {label, value}}
                    <option value={value}>{label}</option>
                {/each}
            </select>
        </div>

        <div class="h-20 py-4">
            <label for="rowConduitType" class="block text-gray-700 text-sm font-bold mb-2">
                Individual Wire Type
            </label>
            <select
                    bind:value={$rowWireType}
                    required
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                <option value={null}>-- Select --</option>
                <option value="THHN">THHN</option>
                <option value="THW">THW</option>
            </select>
        </div>

        <div class="h-20 py-4">
            <label for="rowConduitType" class="block text-gray-700 text-sm font-bold mb-2">
                Individual Conduit Type
            </label>
            <select
                    bind:value={$rowConduitType}
                    required
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                <option value={null}>-- Select --</option>
                <option value="PVC">PVC</option>
                <option value="RMC">RMC</option>
            </select>
        </div>

        <div class="h-20 py-4">
            <label for="volts" class="block text-gray-700 text-sm font-bold mb-2">
                Volts:
            </label>
            <input
                    type="number"
                    id="volts"
                    bind:value={$volts}
                    required
                    min="1"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
        </div>
    </div>
</div>