<!-- src/components/LoadSpecsTable.svelte -->
<script>
    import {loadSpecifications, updateLoadSpecifications, volts, sa, sab, sabc, threeGang} from "../stores/dataStore";
    import {showLoadSpecs, loadSpecEditId} from "../stores/uiStore";
    import {moveSpecDown, moveSpecUp, removeLoadSpecification} from "../utils/mutators";

    import {totalOfAllAmp, totalOfAllVA} from "../stores/derivedStore";
    import {formatDecimal, formatInt, formatWithCommas} from "../utils/misc.js";
    import {get} from "svelte/store";

    let showWireTypeModal = false;
    let wireTypes = ["THHN", "THHW", "THW", "THWN"];
    let currentIdx = null;
    let selectedWireType = null;

    let showSwitchEditModal = false;

    function setLoadSpecEditId(idx){
        loadSpecEditId.set(idx);
    }

    function setWireType() {
        if (!selectedWireType) {
            return;
        }

        updateLoadSpecifications(`${currentIdx}.wireType`, [selectedWireType]); // Overwrites the value

        showWireTypeModal = false;
        // updateLoadSpecifications(`${currentIdx}.wireType`, 'test'); // Overwrites the value
    }

    function setSwitchData(){
        updateLoadSpecifications(`${currentIdx}.sa`, $sa);
        updateLoadSpecifications(`${currentIdx}.sab`, $sab);
        updateLoadSpecifications(`${currentIdx}.sabc`, $sabc);
        updateLoadSpecifications(`${currentIdx}.threeGang`, $threeGang);
        showSwitchEditModal = false;
    }

    function getWireType(wireType) {
        if (Array.isArray(wireType) && wireType.length > 0) {
            return String(wireType[0]);
        } else if (typeof wireType === 'string') {
            return wireType;
        }
        return "THHN"; // Return null if the input is neither an array nor a string
    }


    function loadSwitchData(idx){
        const currentLoadSpecifications = get(loadSpecifications);
        sa.set(currentLoadSpecifications[idx].sa);
        sab.set(currentLoadSpecifications[idx].sab);
        sabc.set(currentLoadSpecifications[idx].sabc);
        threeGang.set(currentLoadSpecifications[idx].threeGang);
    }

</script>

<div class="my-4">


    {#if showWireTypeModal}
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <!-- Modal Container -->
            <div class="bg-white rounded-lg shadow-lg w-96">
                <!-- Modal Header -->
                <div class="px-4 py-3 border-b flex justify-between items-center">
                    <h2 class="text-lg font-semibold">Update Wire</h2>
                    <button class="text-gray-500 hover:text-gray-700" on:click={() => showWireTypeModal = false}>
                        ✖
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-4">
                    <div class="h-20 py-4">
                        <label for="wireTypeSelect" class="block text-gray-700 text-sm font-bold mb-2">Wire Type</label>
                        <select
                                id="wireTypeSelect"
                                bind:value={selectedWireType}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value={null}>Select a Wire Type</option>
                            {#each ["THHN", "THHW", "THW", "THWN"] as wireType}
                                <option value={wireType}>{wireType}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-4 py-3 border-t flex justify-end">
                    <button class="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2"
                            on:click={setWireType}>
                        Add
                    </button>
                    <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            on:click={() => showWireTypeModal = false}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    {/if}

    {#if showSwitchEditModal}
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <!-- Modal Container -->
            <div class="bg-white rounded-lg shadow-lg w-96">
                <!-- Modal Header -->
                <div class="px-4 py-3 border-b flex justify-between items-center">
                    <h2 class="text-lg font-semibold">Edit Switches</h2>
                    <button class="text-gray-500 hover:text-gray-700" on:click={() => showSwitchEditModal = false}>
                        ✖
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-4">
                    <div class="w-full border-t border-gray-300 mt-3 pt-2">
                        <div class="grid grid-cols-4 gap-2">
                            <!-- Sa -->
                            <div class="flex flex-col">
                                <label class="text-gray-700 text-xs font-medium">Sa</label>
                                <input
                                        type="number"
                                        min="0"
                                        bind:value={$sa}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                />
                            </div>

                            <!-- Sab -->
                            <div class="flex flex-col">
                                <label class="text-gray-700 text-xs font-medium">Sab</label>
                                <input
                                        type="number"
                                        min="0"
                                        bind:value={$sab}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                />
                            </div>

                            <!-- Sabc -->
                            <div class="flex flex-col">
                                <label class="text-gray-700 text-xs font-medium">Sabc</label>
                                <input
                                        type="number"
                                        min="0"
                                        bind:value={$sabc}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                />
                            </div>

                            <!-- 3 Gang -->
                            <div class="flex flex-col">
                                <label class="text-gray-700 text-xs font-medium">3 Gang</label>
                                <input
                                        type="number"
                                        min="0"
                                        bind:value={$threeGang}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-4 py-3 border-t flex justify-end">
                    <button class="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2"
                            on:click={setSwitchData}>
                        Update
                    </button>
                    <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            on:click={() => showSwitchEditModal = false}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    {/if}

    {#if $showLoadSpecs && Array.isArray($loadSpecifications) && $loadSpecifications.length > 0}
        <div class="flow-root">
            <div class="overflow-y-auto">
                <div class="inline-block w-full">
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                        <table class="w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                            <tr>
                                <th
                                        scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                >
                                    Category
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    Name
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    Unit Load
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    Quantity
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    VA
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    Switches
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    Wire and Type
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    Volts
                                </th>
                                <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                    Amp Load
                                </th>
                                <th
                                        scope="col"
                                        class="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                >
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                            {#if Array.isArray($loadSpecifications) && $loadSpecifications.length > 0}
                                {#each $loadSpecifications as spec, idx}
                                    <tr class="hover:bg-gray-200 transition-colors duration-200">
                                        <td
                                                class="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                                        >
                                            {spec.category}
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            {spec.name}
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            {#if spec.lightingLoads}
                                                <ul class="list-disc list-inside">
                                                    {#each spec.lightingLoads as row}
                                                        <li>
                                                            {row.type}: {row.wattage}W x {row.quantity}
                                                        </li>
                                                    {/each}
                                                </ul>
                                            {:else}
                                                <code>
                                                    {#if spec.category === "Motor"}
                                                        {spec.horsepower}HP
                                                    {:else}
                                                        {spec.wattage}W <!-- | {spec.horsepower}HP-->
                                                    {/if}
                                                </code>
                                            {/if}
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            <code>{spec.quantity}</code>
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            <code>{formatWithCommas(formatInt(spec.subtotal))}</code>
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            <a href="#!"
                                               class="text-orange-400"
                                               on:click={() => {
                                               showSwitchEditModal = true;
                                               currentIdx = idx;
                                               loadSwitchData(idx);
                                           }}
                                            >
                                                <code>
                                                    {#if spec.sa}{spec.sa}{:else}0{/if}/{#if spec.sab}{spec.sab}{:else}0{/if}/{#if spec.sabc}{spec.sabc}{:else}0{/if}/{#if spec.threeGang}{spec.threeGang}{:else}0{/if}
                                                </code>
                                            </a>
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            <a href="#!"
                                               class="text-orange-400"
                                               on:click={() => {
                                               showWireTypeModal = true;
                                               wireTypes = spec.wireTypeSelection;
                                               currentIdx = idx;
                                           }}
                                            >
                                                2 - {spec.wireParamsAnnotated.wiresize_metric} ({spec.wireParamsAnnotated.wiresize_awg}) {getWireType(spec.wireType)}
                                            </a>
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            <code>{$volts}</code>
                                        </td>
                                        <td
                                                class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                        >
                                            {#if $volts > 0}
                                                <code>
                                                    {(parseFloat(spec.subtotal) / $volts).toFixed(2)}
                                                </code>
                                            {:else}
                                                <code>0</code>
                                            {/if}
                                        </td>
                                        <td
                                                class="relative whitespace-nowrap py-1 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                                        >
                                            <!-- Move Up -->
                                            <button
                                                    type="button"
                                                    on:click={() => moveSpecUp(idx)}
                                                    style="background-color: transparent; border: none; cursor: pointer; padding: 5px;"
                                                    title="Move Up"
                                            >
                                                <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="gray"
                                                        viewBox="0 0 24 24"
                                                >
                                                    <path
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            d="M12 19V5M5 12l7-7 7 7"
                                                    />
                                                </svg>
                                            </button>
                                            <!-- Move Down -->
                                            <button
                                                    type="button"
                                                    on:click={() => moveSpecDown(idx)}
                                                    style="background-color: transparent; border: none; cursor: pointer; padding: 5px;"
                                                    title="Move Down"
                                            >
                                                <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="gray"
                                                        viewBox="0 0 24 24"
                                                >
                                                    <path
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            d="M12 5v14M5 12l7 7 7-7"
                                                    />
                                                </svg>
                                            </button>
                                            <!-- Remove -->
                                            <button
                                                    type="button"
                                                    on:click={() => removeLoadSpecification(idx)}
                                                    style="background-color: transparent; border: none; cursor: pointer; padding: 5px;"
                                                    title="Remove"
                                            >
                                                <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="18"
                                                        height="18"
                                                        fill="red"
                                                        viewBox="0 0 24 24"
                                                >
                                                    <path
                                                            d="M3 6v16c0 1.104.896 2 2
                               2h14c1.104 0 2-.896 2-2V6H3zm16
                               2h-3v12h3V8zm-5 0H9v12h5V8zm-6
                               0H5v12h3V8zm4-6l-1-2h-4l-1
                               2H2v2h20V2h-5z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                    type="button"
                                                    on:click={() => setLoadSpecEditId(idx)}
                                                    style="background-color: transparent; border: none; cursor: pointer; padding: 5px;"
                                                    title="Edit"
                                                    >
                                                <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="18"
                                                        height="18"
                                                        fill="orange"
                                                        viewBox="0 0 24 24"
                                                >
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                            </tbody>
                            <tfoot class="bg-gray-100">
                            <tr>
                                <td colspan="4" class="text-right font-semibold py-2 px-3">
                                    Totals:
                                </td>
                                <td class="py-2 px-3 text-sm text-gray-800">
                                    <code>{formatWithCommas(formatInt($totalOfAllVA.toFixed(2)))}</code>
                                </td>
                                <td></td>
                                <td></td>
                                <td class="py-2 px-3 text-sm text-gray-800">
                                    <code>{$volts}</code>
                                </td>
                                <td class="py-2 px-3 text-sm text-gray-800">
                                    <code>{formatWithCommas($totalOfAllAmp.toFixed(2))}</code>
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>