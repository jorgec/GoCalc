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
        panelBoards,
        currentPanelBoard, loadSpecifications, panelboardName
    } from "../stores/dataStore";

    import {showSpecForm} from "../stores/uiStore";
    import {constants} from "../stores/constantsStore";
    import {get} from "svelte/store";
    import {
        loadSpecificationsFromPanelboard,
        removePanelboardSet,
        saveSpecficiationsToPanelboard
    } from "../utils/mutators.js";

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
                loadByOccupancy.set(tmpLoad * parseFloat($floorArea));
                selectedLightingDemandFactorID.set(occType.lighting_df);
            }
        } else {
            totalLoad.set(0);
            loadByOccupancy.set(0);
            selectedLightingDemandFactorID.set(null);
        }
    }

    function savePanelboard(){
        const panelboardId = get(currentPanelBoard);
        saveSpecficiationsToPanelboard(panelboardId);
    }

    function removePanelboard() {
        const panelboardId = get(currentPanelBoard);
        removePanelboardSet(panelboardId);
        newPanelboard();
    }

    function newPanelboard(){
        currentPanelBoard.set(null);
        showSpecForm.set(true);
        panelboardName.set('');
        loadSpecifications.set([]);
    }

    let showPanelboardDropdown = false;
</script>

<div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
    <div class="w-full p-6 pt-2 bg-white shadow-lg my-4">
        <h2 class="text-xl font-semibold text-gray-800">
            Schedule of Loads
        </h2>
        <div class="flex flex-wrap gap-4">

            <!-- Type of Occupancy -->
            <div class="relative flex-1 min-w-[240px]">
                <select
                        bind:value={$selectedOccupancyValue}
                        required
                        class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled selected hidden></option>
                    {#each constants.occupancyTypes as {label, value}}
                        <option value={value}>{label}</option>
                    {/each}
                </select>
                <label for="typeOfOccupancy"
                       class="absolute left-3 top-2 text-gray-500 text-sm transition-all
               peer-focus:text-sm peer-focus:top-2
               peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400
               peer-focus:text-blue-500">
                    Type of Occupancy
                </label>
            </div>

            <!-- Occupancy Type (conditional) -->
            {#if selectedOccupancyTypes.length > 0}
                <div class="relative flex-1 min-w-[240px]">
                    <select
                            bind:value={$selectedTypeValue}
                            required
                            class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled selected hidden></option>
                        {#each selectedOccupancyTypes as t, i}
                            <option value={i}>{t.label}</option>
                        {/each}
                    </select>
                    <label for="occupancyType"
                           class="absolute left-3 top-2 text-gray-500 text-sm transition-all
                 peer-focus:text-sm peer-focus:top-2
                 peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400
                 peer-focus:text-blue-500">
                        Occupancy Type
                    </label>
                </div>
            {/if}

            <!-- AddOn (conditional) -->
            {#if selectedAddOns.length > 0}
                <div class="relative flex-1 min-w-[160px]">
                    <select
                            bind:value={$selectedAddOnValue}
                            class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Optional</option>
                        {#each selectedAddOns as addon, i}
                            <option value={i}>{addon.label}</option>
                        {/each}
                    </select>
                    <label for="occupancyAddOn"
                           class="absolute left-3 top-2 text-gray-500 text-sm transition-all
                 peer-focus:text-sm peer-focus:top-2
                 peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400
                 peer-focus:text-blue-500">
                        AddOn
                    </label>
                </div>
            {/if}

            <!-- System Phase -->
            <div class="relative flex-1 min-w-[160px]">
                <select
                        bind:value={$systemPhaseType}
                        required
                        class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled selected hidden></option>
                    {#each constants.phaseTypes as {label, value}}
                        <option value={value}>{label}</option>
                    {/each}
                </select>
                <label for="systemPhaseType"
                       class="absolute left-3 top-2 text-gray-500 text-sm transition-all
               peer-focus:text-sm peer-focus:top-2
               peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400
               peer-focus:text-blue-500">
                    System Phase
                </label>
            </div>

            <!-- Individual Wire Type -->
            <div class="relative flex-1 min-w-[160px]">
                <select
                        bind:value={$rowWireType}
                        required
                        class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled selected hidden></option>
                    <option value="THHN">THHN</option>
                    <option value="THW">THW</option>
                </select>
                <label for="rowWireType"
                       class="absolute left-3 top-2 text-gray-500 text-sm transition-all
               peer-focus:text-sm peer-focus:top-2
               peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400
               peer-focus:text-blue-500">
                    Type of Wire
                </label>
            </div>

            <!-- Individual Conduit Type -->
            <div class="relative flex-1 min-w-[160px]">
                <select
                        bind:value={$rowConduitType}
                        required
                        class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled selected hidden></option>
                    <option value="PVC">PVC</option>
                    <option value="RMC">RMC</option>
                </select>
                <label for="rowConduitType"
                       class="absolute left-3 top-2 text-gray-500 text-sm transition-all
               peer-focus:text-sm peer-focus:top-2
               peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400
               peer-focus:text-blue-500">
                    Type of Conduit
                </label>
            </div>
            <!-- Floor Area -->
            <div class="relative flex-1 min-w-[100px]">
                <input
                        type="number"
                        id="floorArea"
                        bind:value={$floorArea}
                        required
                        placeholder=" "
                        class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label for="floorArea" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                    Floor Area
                </label>
            </div>

            <!-- Volts -->
            <div class="relative flex-1 min-w-[160px] hidden">
                <input
                        type="number"
                        id="volts"
                        bind:value={$volts}
                        disabled
                        min="1"
                        placeholder=" "
                        class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label for="volts" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                    Volts
                </label>
            </div>

        </div>
    </div>
</div>
<div class="-mt-4 mb-6 flex gap-2 px-6">
    <!-- Add Panelboard button -->
    <button
            class="bg-teal-600 text-white font-semibold py-2 px-4 rounded-b-md shadow hover:bg-teal-900 transition"
            on:click={() => newPanelboard()}
    >
        Add Panelboard
    </button>
    <button
            class="bg-green-600 text-white font-semibold py-2 px-4 rounded-b-md shadow hover:bg-green-900 transition"
            on:click={() => savePanelboard()}
    >
        Save Panelboard
    </button>
    {#if $currentPanelBoard !== null}
        <button
                class="bg-red-400 text-white font-semibold py-2 px-4 rounded-b-md shadow hover:bg-red-900 transition"
                on:click={() => removePanelboard()}
        >
            Remove Current Panelboard: {$currentPanelBoard}
        </button>
    {/if}

    <!-- Panelboards dropdown -->
    <div class="relative">
        <button
                class="bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-b-md border border-gray-300 hover:bg-gray-200 transition"
                on:click={() => showPanelboardDropdown = !showPanelboardDropdown}
        >
            Panelboards
            <svg class="inline w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        {#if showPanelboardDropdown}
            <ul class="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                {#each $panelBoards as panelboard, i}
                    <li>
                        <a
                                on:click={() => {
                                        loadSpecificationsFromPanelboard(i);
                                        showPanelboardDropdown = false;
                                    }
                                }
                                href="#!" class="block px-4 py-2 hover:bg-gray-100">
                            {panelboard.panelboardName}
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>