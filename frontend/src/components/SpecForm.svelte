<script>
    import {
        sa,
        sab,
        sabc,
        threeGang,
        convenienceVA,
        isABC,
        lightingRows,
        quantity,
        ratings,
        selectedCategoryIndex,
        selectedCategoryType,
        spareName,
        wattage
    } from "../stores/dataStore";

    import {constants, updateConstant} from "../stores/constantsStore";
    import {addAnotherLightingRow, addLoadSpecification, removeLightingRow, resetSpecForm} from "../utils/mutators";

    import {showLightingInput, showSpecForm, statusMessage} from "../stores/uiStore";

    // For "hasCategoryTypes" logic:
    $: catIndex = $selectedCategoryIndex;
    $: chosenCategory = (catIndex != null)
        ? constants.loadSpecificationCategories[catIndex]
        : null;
    $: hasCategoryTypes = !!(chosenCategory?.types?.length && catIndex !== 0);

    let addCustomMotorFlag = false;

    let newMotorName = '';
    let customCat = null;

    function addCustomModal(cat) {
        addCustomMotorFlag = true;
        customCat = cat;
    }

    function prepAddLoadSpecification() {
        addLoadSpecification();
    }

    function addCustom() {

        if (newMotorName === '' || !customCat) {
            statusMessage.set({text: "Name can't be empty", type: 'error'});
        }else{
            let cat = parseInt(customCat);
            let customMotor = {
                label: newMotorName,
                value: 999,
                unit_load: 1
            };

            updateConstant(`loadSpecificationCategories.${cat}.types`, [
                ...constants.loadSpecificationCategories[cat].types,
                customMotor
            ]);

            chosenCategory = constants.loadSpecificationCategories[cat];
            addCustomMotorFlag = false;
            newMotorName = '';
        }
    }

</script>

{#if addCustomMotorFlag}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-lg w-96">
            <!-- Modal Header -->
            <div class="px-4 py-3 border-b flex justify-between items-center">
                <h2 class="text-lg font-semibold">Add Custom Motor</h2>
                <button class="text-gray-500 hover:text-gray-700" on:click={() => addCustomMotorFlag = false}>
                    ✖
                </button>
            </div>

            <!-- Modal Body -->
            <div class="p-4">
                <div class="h-20 py-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>
                    <input
                            required
                            type="text"
                            bind:value={newMotorName}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                    />
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-4 py-3 border-t flex justify-end">
                <button class="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2"
                        on:click={addCustom}>
                    Add
                </button>
                <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        on:click={() => addCustomMotorFlag = false}>
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

{#if $showSpecForm}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-b-gray-500 p-0">
        <div class="h-20 py-4">
            <label for="category" class="block text-gray-700 text-sm font-bold mb-2">
                Load Specification Category:
            </label>
            <select
                    id="category"
                    bind:value={$selectedCategoryIndex}
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                <option value={null}>Select a Category</option>
                {#each constants.loadSpecificationCategories as category, i}
                    <option value={i}>{category.label}</option>
                {/each}
            </select>
        </div>

        {#if hasCategoryTypes}
            <div class="h-20 py-4">
                <label for="selectedCategoryType" class="block text-gray-700 text-sm font-bold mb-2">
                    Type:
                </label>
                <select
                        bind:value={$selectedCategoryType}
                        required
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value={null}>Select Type</option>
                    {#each chosenCategory.types as t, i}
                        <option value={i}>{t.label}</option>
                    {/each}
                </select>
            </div>
        {/if}

        {#if catIndex === 0}
            <div class="col-span-4 py-4 border rounded bg-white px-2">
                <h3 class="font-bold text-gray-700 mb-2">
                    Lighting
                </h3>

                {#if $showLightingInput || $lightingRows.length > 0}
                    {#each $lightingRows as row, rowIndex}
                        <div class="flex flex-wrap gap-2 mb-2 items-end">
                            <!-- Type Selection -->
                            <div class="flex flex-col">
                                <label class="block text-gray-700 text-sm font-bold">Type:</label>
                                <select
                                        bind:value={row.typeValue}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                >
                                    <option value={null}>Select Type</option>
                                    {#each chosenCategory.types as t}
                                        <option value={t.value}>{t.label}</option>
                                    {/each}
                                </select>
                            </div>

                            <!-- Quantity -->
                            <div class="flex flex-col">
                                <label class="block text-gray-700 text-sm font-bold">Quantity</label>
                                <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        bind:value={row.quantity}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                />
                            </div>

                            <!-- Wattage -->
                            <div class="flex flex-col">
                                <label class="block text-gray-700 text-sm font-bold">Wattage</label>
                                <input
                                        type="number"
                                        min="1"
                                        bind:value={row.wattage}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                />
                            </div>

                            <!-- Remove Button -->
                            <button
                                    type="button"
                                    on:click={() => removeLightingRow(rowIndex)}
                                    class="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded ml-2"
                            >
                                Remove
                            </button>
                        </div>
                    {/each}
                {/if}

                <button
                        type="button"
                        on:click={addAnotherLightingRow}
                        class="bg-teal-500 hover:bg-teal-700 text-white py-1 px-2 rounded"
                >
                    Add Lighting Row
                </button>
            </div>

            <!-- Switches Section -->
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
        {/if}

        {#if catIndex === 1}
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">VA:</label>
                <input
                        type="number"
                        min="1"
                        bind:value={$convenienceVA}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
            </div>
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Quantity:</label>
                <input
                        type="number"
                        min="1"
                        max="8"
                        bind:value={$quantity}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
            </div>
        {/if}

        {#if catIndex === 2}
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Wattage:</label>
                <input
                        type="number"
                        min="1"
                        bind:value={$wattage}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
            </div>
        {/if}

        {#if catIndex === 3}
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Wattage:</label>
                <input
                        type="number"
                        min="1"
                        bind:value={$wattage}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
            </div>
        {/if}

        {#if catIndex === 4}
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Spare Name (optional)</label>
                <input
                        type="text"
                        bind:value={$spareName}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="e.g. Spare Heater, Spare Light..."
                />
            </div>
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Wattage:</label>
                <input
                        type="number"
                        min="1"
                        bind:value={$wattage}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
            </div>
        {/if}

        {#if catIndex === 5}
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Wattage:</label>
                <input
                        type="number"
                        min="1"
                        bind:value={$wattage}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
            </div>
        {/if}

        {#if catIndex !== null && catIndex != 0 && catIndex != 1}
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="ratings">
                    Ratings:
                </label>
                <input
                        type="text"
                        bind:value={$ratings}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="e.g. 1/2 HP, 220V..."
                />
            </div>
        {/if}

    </div>
    <div class="flex items-center gap-4 py-4">
        {#if catIndex === 3 || catIndex == 5}
            <div>
                <button
                        on:click={() => {
                            addCustomMotorFlag = true;
                            addCustomModal(catIndex);
                        }}
                        class="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    Add a Custom
                </button>
            </div>
        {/if}
        <div class="flex items-center">
            <input
                    type="checkbox"
                    bind:checked={$isABC}
                    class="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label class="text-gray-700 text-sm font-bold">
                ABC
            </label>
        </div>
    </div>

    {#if catIndex !== null}
        <div class="h-20 py-4">
            <button
                    type="button"
                    class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 sm:ml-3 sm:mt-0 sm:w-auto"
                    on:click={prepAddLoadSpecification}
            >
                Add
            </button>
            <button
                    type="button"
                    class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 sm:ml-3 sm:mt-0 sm:w-auto"
                    on:click={resetSpecForm}
            >
                Reset
            </button>

        </div>
    {/if}
{/if}