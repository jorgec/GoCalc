<script>
    import {
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

    import {constants} from "../stores/constantsStore";
    import {addAnotherLightingRow, addLoadSpecification, removeLightingRow, resetSpecForm} from "../utils/mutators";

    import {showLightingInput, showSpecForm} from "../stores/uiStore";

    // For "hasCategoryTypes" logic:
    $: catIndex = $selectedCategoryIndex;
    $: chosenCategory = (catIndex != null)
        ? constants.loadSpecificationCategories[catIndex]
        : null;
    $: hasCategoryTypes = !!(chosenCategory?.types?.length && catIndex !== 0);
</script>

{#if $showSpecForm}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-b-gray-500 py-4">
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

                            <div class="flex flex-col">
                                <label class="block text-gray-700 text-sm font-bold">Wattage</label>
                                <input
                                        type="number"
                                        min="1"
                                        bind:value={row.wattage}
                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                                />
                            </div>

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

        <div class="flex items-end py-4">
            <input
                    type="checkbox"
                    bind:checked={$isABC}
                    class="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label class="block text-gray-700 text-sm font-bold">
                ABC
            </label>
        </div>

    </div>

    {#if catIndex !== null}
        <div class="h-20 py-4">
            <button
                    type="button"
                    class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 sm:ml-3 sm:mt-0 sm:w-auto"
                    on:click={addLoadSpecification}
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