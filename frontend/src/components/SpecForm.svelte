<script>
    import {
        convenienceVA,
        horsepower,
        isABC,
        lightingRows,
        loadSpecifications,
        quantity,
        ratings,
        sa,
        sab,
        sabc,
        selectedCategoryIndex,
        selectedCategoryType,
        spareName,
        threeGang,
        wattage
    } from "../stores/dataStore";

    import {constants, hp_lookup, updateConstant} from "../stores/constantsStore";
    import {addAnotherLightingRow, addLoadSpecification, removeLightingRow, resetSpecForm} from "../utils/mutators";

    import {modalImage, showLightingInput, showSpecForm, statusMessage, isEditingLoadSpec, loadSpecEditId} from "../stores/uiStore";
    import motor_table from "../assets/images/motor_table.jpg";
    import {get} from "svelte/store";
    import {categoryIndexLookup, categoryTypeLookup} from "../utils/lookups.js";

    const hpKeys = [...hp_lookup.keys()];

    $: catIndex = $selectedCategoryIndex;
    $: chosenCategory = (catIndex != null)
        ? constants.loadSpecificationCategories[catIndex]
        : null;
    $: hasCategoryTypes = !!(chosenCategory?.types?.length && catIndex !== 0);

    let addCustomMotorFlag = false;

    let newMotorName = '';
    let customCat = null;
    let customCatTitle = 'Motor';

    function addCustomModal(cat) {
        addCustomMotorFlag = true;
        customCat = cat;
        if (cat !== 3) {
            customCatTitle = 'Load';
        }
    }

    function prepAddLoadSpecification() {
        addLoadSpecification();
    }

    function addCustom() {

        if (newMotorName === '' || !customCat) {
            statusMessage.set({text: "Name can't be empty", type: 'error'});
        } else {
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

    // Editing

    let editIndex = null;
    $: editIndex = $loadSpecEditId;

    $: if (editIndex !== undefined) {
        loadSpecForEdit(editIndex);
    }


    export function loadSpecForEdit(i) {
        editIndex = i;

        // Get the existing spec from loadSpecifications
        const spec = get(loadSpecifications)[i];

        if (!spec) return;
        catIndex = categoryIndexLookup(spec.category);
        chosenCategory = constants.loadSpecificationCategories[catIndex];

        selectedCategoryIndex.set(catIndex ?? null);
        hasCategoryTypes = !!(chosenCategory?.types?.length && catIndex !== 0);
        if(hasCategoryTypes){
            selectedCategoryType.set(categoryTypeLookup(catIndex, spec.name));
        }

        quantity.set(spec.quantity);
        // For wattage, horsepower, ratings, etc.:
        wattage.set(spec.wattage ?? 0);
        horsepower.set(spec.horsepower ?? 0);
        ratings.set(spec.ratings ?? '');
        isABC.set(spec.abc ?? false);

        // If this is a Lighting spec (category index 0), you have multiple lighting sub-rows.
        // You can load them into lightingRows so the form can display them:
        if (catIndex === 0) {
            if (Array.isArray(spec.lightingLoads)) {
                showLightingInput.set(true);
                let rows = [];
                for(let i = 0; i < spec.lightingLoads.length; i ++){
                    const _load = spec.lightingLoads[i];
                    const typeId = categoryTypeLookup(catIndex, _load.type);
                    rows.push({
                        typeValue: typeId,
                        type: _load.type,
                        wattage: _load.wattage,
                        quantity: _load.quantity
                    });
                }
                lightingRows.set(rows);
            }else{
                lightingRows.set([]);
            }

            // Switches
            sa.set(spec.sa || 0);
            sab.set(spec.sab || 0);
            sabc.set(spec.sabc || 0);
            threeGang.set(spec.threeGang || 0);

        } else if (catIndex === 1) {
            // CONVENIENCE OUTLET
            quantity.set(spec.quantity ?? 1);
            // You might store VA in `spec.va` or in `spec.wattage`
            convenienceVA.set(spec.va ?? spec.wattage ?? 180);

        } else if (catIndex === 2) {
            // KITCHEN LOAD
            wattage.set(spec.wattage ?? 0);

        } else if (catIndex === 3) {
            // MOTOR
            // Motor might store wattage or rely on HP
            wattage.set(spec.wattage ?? 0);
            horsepower.set(spec.horsepower ?? 0);

        } else if (catIndex === 4) {
            // SPARE
            spareName.set(spec.name ?? '');
            wattage.set(spec.wattage ?? 0);

        } else if (catIndex === 5) {
            // OTHER LOAD
            wattage.set(spec.wattage ?? 0);
        }

        // If this is a Spare:
        spareName.set(spec.name ?? '');

        // Finally, show the SpecForm
        showSpecForm.set(true);
    }

    function onSubmitForm() {
        if (editIndex !== null) {
            // We’re in “edit mode”
            // updateLoadSpecification(editIndex);
            addLoadSpecification();
            statusMessage.set({text: 'Load spec updated!', type: 'info'});
        } else {
            // We’re in “add mode”
            addLoadSpecification();
            statusMessage.set({text: 'Load spec added!', type: 'info'});
        }

        // Reset the form state
        resetSpecForm();
    }

</script>

{#if addCustomMotorFlag}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-lg w-96">
            <!-- Modal Header -->
            <div class="px-4 py-3 border-b flex justify-between items-center">
                <h2 class="text-lg font-semibold">Add Custom {customCatTitle}</h2>
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
Edit: {$loadSpecEditId}
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

                {#if ($showLightingInput || $lightingRows.length > 0) && $lightingRows}
                    {#each $lightingRows ?? [] as row, rowIndex}
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
                        <label class="text-gray-700 text-xs font-medium">3 Way</label>
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
                <label class="block text-gray-700 text-sm font-bold mb-2">Quantity:</label>
                <input
                        type="number"
                        min="1"
                        max="8"
                        bind:value={$quantity}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
            </div>
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">VA:</label>
                <input
                        type="number"
                        min="1"
                        bind:value={$convenienceVA}
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

        {#if catIndex !== null && catIndex != 0 && catIndex != 1 && catIndex != 3}
            <div class="h-20 py-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="ratings">
                    Description:
                </label>
                <input
                        type="text"
                        bind:value={$ratings}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="e.g. 1/2 HP, 220V..."
                />
            </div>
        {/if}
        {#if catIndex === 3}
            <div class="h-20 py-4">
                <label for="category" class="block text-gray-700 text-sm font-bold mb-2">
                    HP
                    (<a href="#!" on:click|preventDefault={() => modalImage.set(motor_table)} class="underline">reference</a>)
                </label>
                <select
                        id="category"
                        bind:value={$horsepower}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value=0>Select HP</option>
                    {#each hpKeys as hp}
                        <option value={hp}>{hp}</option>
                    {/each}
                </select>
            </div>
        {/if  }
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
                    on:click={onSubmitForm}
            >
                {#if editIndex !== null}
                    Update
                {:else}
                    Add
                {/if}
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