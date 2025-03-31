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
        wattage,
        panelboardName,
        demandFactor
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
        console.log(spec);

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
        let _wattage = spec.wattage;

        wattage.set(_wattage ?? 0);
        demandFactor.set(spec.demandFactor ?? 100.0);
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
            if(spec.originalWattage){
                wattage.set(spec.originalWattage);
            }

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

    let applyDF = false;

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

{#if $showSpecForm}
    <!-- Panelboard Name -->
    <div class="relative flex-1 min-w-[240px] my-4">
        <input
                type="text"
                id="panelboardName"
                bind:value="{$panelboardName}"
                required
                min="0"
                placeholder=" "
                class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <label for="panelboardName" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
            Panelboard Name
        </label>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-b-gray-500 p-0">


        <div class="h-20 py-4">
            <!-- Floating label select for Load Specification Category -->
            <div class="relative w-full">
                <select
                        id="category"
                        bind:value={$selectedCategoryIndex}
                        class="peer w-full appearance-none px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                    <option value={null} disabled>Select a Category</option>
                    {#each constants.loadSpecificationCategories as category, i}
                        <option value={i}>{category.label}</option>
                    {/each}
                </select>

                <label
                        for="category"
                        class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
                >
                    Load Specification Category
                </label>

                <!-- Optional chevron icon for visual hint -->
                <svg
                        class="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        {#if hasCategoryTypes}
            <div class="h-20 py-4">
                <div class="relative w-full">
                    <select
                            id="selectedCategoryType"
                            bind:value={$selectedCategoryType}
                            required
                            class="peer w-full appearance-none px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    >
                        <option value={null} disabled>Select Type</option>
                        {#each chosenCategory.types as t, i}
                            <option value={i}>{t.label}</option>
                        {/each}
                    </select>

                    <label
                            for="selectedCategoryType"
                            class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
                    >
                        Type
                    </label>

                    <!-- Optional chevron icon -->
                    <svg
                            class="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
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
                <!-- Floating label for Quantity input -->
                <div class="relative w-full">
                    <input
                            type="number"
                            id="quantity"
                            min="1"
                            max="8"
                            bind:value={$quantity}
                            placeholder=" "
                            class="peer w-full px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg placeholder-transparent text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    <label
                            for="quantity"
                            class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                        Quantity
                    </label>
                </div>
            </div>
            <div class="h-20 py-4">
                <!-- Floating label for VA input -->
                <div class="relative w-full">
                    <input
                            type="number"
                            id="va"
                            min="1"
                            bind:value={$convenienceVA}
                            placeholder=" "
                            class="peer w-full px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg placeholder-transparent text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    <label
                            for="va"
                            class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                        VA
                    </label>
                </div>
            </div>

        {/if}

        {#if catIndex === 4}
            <div class="h-20 py-4">
                <div class="relative w-full">
                    <input
                            type="text"
                            id="spareName"
                            bind:value={$spareName}
                            placeholder=" "
                            class="peer w-full px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg placeholder-transparent text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    <label
                            for="spareName"
                            class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                        Spare Name (optional)
                    </label>
                </div>
            </div>
        {/if}

        {#if catIndex >= 2}
            <div class="h-20 py-4">
                <div class="relative w-full">
                    <input
                            type="number"
                            id="wattage"
                            min="1"
                            bind:value={$wattage}
                            placeholder=" "
                            class="peer w-full px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg placeholder-transparent text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    <label
                            for="wattage"
                            class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                        Wattage
                    </label>

                    {#if catIndex === 2}
                        <div class="flex items-center space-x-2 mt-4">
                            <input
                                    type="checkbox"
                                    id="applyDF"
                                    bind:checked={applyDF}
                                    class="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded transition duration-200"
                            />
                            <label for="applyDF" class="text-gray-700 text-sm">
                                Apply Demand Factor (DF)
                            </label>
                        </div>
                    {/if}
                </div>
            </div>
            {#if catIndex ===2 && applyDF}
                <div class="h-20 py-4">
                    <div class="relative w-full">
                        <input
                                type="number"
                                id="demandFactor"
                                min="1"
                                bind:value={$demandFactor}
                                placeholder=" "
                                class="peer w-full px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg placeholder-transparent text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                        <label
                                for="demandFactor"
                                class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
                        >
                            Demand Factor (%)
                        </label>


                    </div>
                </div>
            {/if}
        {/if}

        {#if catIndex !== null && catIndex != 0 && catIndex != 1 && catIndex != 3}
            <div class="h-20 py-4">
                <div class="relative w-full">
                    <input
                            type="text"
                            id="ratings"
                            bind:value={$ratings}
                            placeholder=" "
                            class="peer w-full px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg placeholder-transparent text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    <label
                            for="ratings"
                            class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                        Description
                    </label>
                </div>
            </div>
        {/if}
        {#if catIndex === 3}
            <div class="h-20 py-4">
                <div class="relative w-full">
                    <select
                            id="category"
                            bind:value={$horsepower}
                            class="peer w-full appearance-none px-4 pt-5 pb-2 text-base border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    >
                        <option value="0" disabled>Select HP</option>
                        {#each hpKeys as hp}
                            <option value={hp}>{hp}</option>
                        {/each}
                    </select>

                    <label
                            for="category"
                            class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
                    >
                        HP
                        (<a
                            href="#!"
                            on:click|preventDefault={() => modalImage.set(motor_table)}
                            class="underline hover:text-blue-600 transition"
                    >
                        reference
                    </a>)
                    </label>

                    <!-- Chevron icon to mimic native select (optional) -->
                    <svg class="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
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