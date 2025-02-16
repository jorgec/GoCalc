<!-- src/components/SpecForm.svelte -->
<script>
    import { get } from 'svelte/store';
    import {
        selectedCategoryIndex,
        selectedCategoryType,
        convenienceVA,
        quantity,
        wattage,
        spareName,
        ratings,
        isABC,
        systemPhaseType,
        lightingRows
    } from "../stores/dataStore";

    import { constants } from "../stores/constantsStore";
    import {
        addAnotherLightingRow,
        removeLightingRow,
        addLoadSpecification
    } from "../utils/mutators";

    import { showSpecForm, showLightingInput } from "../stores/uiStore";

    // For "hasCategoryTypes" logic:
    $: catIndex = $selectedCategoryIndex;
    $: chosenCategory = (catIndex != null)
        ? constants.loadSpecificationCategories[catIndex]
        : null;
    $: hasCategoryTypes = !!(chosenCategory?.types?.length && catIndex !== 0);
</script>

{#if $showSpecForm}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-b-gray-500 py-4">
        <!-- Category select -->
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
            <!-- If the chosenCategory has "types" and it's not "Lighting" (index=0) -->
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

        <!-- LIGHTING category (index === 0) -->
        {#if catIndex === 0}
            <div class="col-span-4 py-4 border rounded bg-white px-2">
                <h3 class="font-bold text-gray-700 mb-2">
                    Lighting
                </h3>

                <!-- Show the lighting rows if user toggled or they exist -->
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

        <!-- Convenience (index === 1) -->
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

        <!-- Kitchen (index === 2) -->
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

        <!-- Motor (index === 3) -->
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

        <!-- Spare (index === 4) -->
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

        <!-- Other (index === 5) -->
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

        <!-- "Ratings" field for categories 2,3,4,5 -->
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

        <!-- "ABC" checkbox for 3-phase (excluding lighting & convenience) -->
        {#if $systemPhaseType == 1 && catIndex != null && catIndex != 0 && catIndex != 1}
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
        {/if}
    </div>

    {#if catIndex !== null}
        <div class="h-20 py-4">
            <button
                    type="button"
                    class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 sm:ml-3 sm:mt-0 sm:w-auto"
                    on:click={addLoadSpecification}
            >
                <!-- EXACT "Add" icon from your original code -->
                <svg
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                    />
                </svg>
                Add
            </button>
        </div>
    {/if}
{/if}