<script>
    import { onDestroy, onMount } from 'svelte';
    import { writable, derived, get } from "svelte/store";
    import { SaveJSON } from "../wailsjs/go/main/App.js";

    // Constants loaded from JSON
    let constants = {
        occupancyTypes: [],
        phaseTypes: [],
        loadSpecificationCategories: [],
        lightingDemandFactors: []
    };

    let projectData = writable({});

    // UI toggles
    let showLoadSpecs = false;
    let showConsole = false;
    let showSpecForm = false;

    // Basic fields
    let projectName = "";
    let floorArea = 0;
    let totalLoad = 0;
    let selectedOccupancyValue = null;
    let selectedTypeValue = null;
    let loadByOccupancy = 0;
    let selectedOccupancyTypes = [];
    let selectedAddOns = [];
    let selectedAddOnValue = null;
    let sumOfSpecifications = {};
    let totalSumOfSpecs = 0;
    let selectedLightingDemandFactorID = null;
    let applicationDemandFactor = 0;

    // --------------------------------------------
    // Convert 'systemPhaseType' into a Svelte store
    // --------------------------------------------
    let systemPhaseType = null;
    let _systemPhaseType = writable(null);

    // --------------------------------------------
    // Convert 'volts' into a Svelte store
    // --------------------------------------------
    let volts = 220;
    let _volts = writable(volts);

    // For categories
    let hasCategoryTypes = false;
    let selectedCategoryIndex = null;
    let loadSpecifications = writable([]);

    // MULTIPLE lighting rows
    let lightingRows = writable([]);

    // For convenience outlets
    let convenienceVA = 180;

    // Shared fields for kitchen, motor, others
    let quantity = 1;
    let wattage = 0;
    let horsepower = 0;
    let selectedCategoryType = null;
    let spareName = "";

    // Additional fields
    let ratings = "";  // for categories 2,3,4,5
    let isABC = false; // check box for 3-phase loads (except lighting & convenience)
    let showLightingInput = false;

    // REACTIVE total sums for the table footer
    let totalOfAllVA = 0;
    let totalOfAllAmp = 0;

    // Keep the store values in sync with the local variables
    $: _volts.set(volts);
    $: _systemPhaseType.set(systemPhaseType);

    // Subscribe to loadSpecifications to compute table-foot sums
    $: {
        const unsubFooter = loadSpecifications.subscribe(items => {
            let vaSum = 0;
            let ampSum = 0;
            for (const spec of items) {
                const numericSubtotal = parseFloat(spec.subtotal) || 0;
                vaSum += numericSubtotal;
                ampSum += volts > 0 ? numericSubtotal / volts : 0;
            }
            totalOfAllVA = vaSum;
            totalOfAllAmp = ampSum;
        });
        onDestroy(unsubFooter);
    }

    // Load constants on mount
    const fetchConstants = async () => {
        const response = await import('./constants.json');
        constants = response.default;
    };
    onMount(fetchConstants);

    // ----------------------------------------------------------------
    // Remove a specification from the main list
    // ----------------------------------------------------------------
    function removeLoadSpecification(indexToRemove) {
        loadSpecifications.update(current =>
            current.filter((_, idx) => idx !== indexToRemove)
        );
        sumOfSpecifications = getSumOfSpecifications();
    }

    // ----------------------------------------------------------------
    // Move a specification row UP in the table
    // ----------------------------------------------------------------
    function moveSpecUp(index) {
        if (index <= 0) return;
        loadSpecifications.update(specs => {
            const newSpecs = [...specs];
            [newSpecs[index - 1], newSpecs[index]] = [newSpecs[index], newSpecs[index - 1]];
            return newSpecs;
        });
        sumOfSpecifications = getSumOfSpecifications();
    }

    // ----------------------------------------------------------------
    // Move a specification row DOWN in the table
    // ----------------------------------------------------------------
    function moveSpecDown(index) {
        loadSpecifications.update(specs => {
            if (index >= specs.length - 1) return specs;
            const newSpecs = [...specs];
            [newSpecs[index + 1], newSpecs[index]] = [newSpecs[index], newSpecs[index + 1]];
            return newSpecs;
        });
        sumOfSpecifications = getSumOfSpecifications();
    }

    // ----------------------------------------------------------------
    // Add another row for lighting
    // ----------------------------------------------------------------
    function addAnotherLightingRow() {
        showLightingInput = true;
        lightingRows.update(rows => [
            ...rows,
            { typeValue: null, wattage: 0, quantity: 1 }
        ]);
    }

    // ----------------------------------------------------------------
    // Remove one lighting row
    // ----------------------------------------------------------------
    function removeLightingRow(rowIndex) {
        lightingRows.update(rows => rows.filter((_, i) => i !== rowIndex));
    }

    // ----------------------------------------------------------------
    // Main function to add the chosen specification
    // ----------------------------------------------------------------
    function addLoadSpecification() {
        let category = constants.loadSpecificationCategories[selectedCategoryIndex];
        let details = {};

        // LIGHTING (with multiple rows)
        if (selectedCategoryIndex === 0) {
            let totalLighting = 0;
            let rowDetails = [];
            let unsub = lightingRows.subscribe(rows => {
                for (let row of rows) {
                    totalLighting += row.wattage * row.quantity;
                    let foundType = (category.types || []).find(t => t.value === +row.typeValue);
                    rowDetails.push({
                        type: foundType ? foundType.label : "Unknown",
                        wattage: row.wattage,
                        quantity: row.quantity
                    });
                }
            });
            unsub();

            details = {
                category: category.label,
                name: `Multiple Lighting Loads (${rowDetails.length} rows)`,
                lightingLoads: rowDetails,
                wattage: totalLighting,
                horsepower: (totalLighting / 746).toFixed(2),
                quantity: 1,
                subtotal: totalLighting.toFixed(2),
                ratings: "-",
                abc: false
            };

            // Reset lighting
            lightingRows.set([]);
            showLightingInput = false;
        }
        // CONVENIENCE OUTLET
        else if (selectedCategoryIndex === 1) {
            details = {
                category: category.label,
                name: "N/A",
                quantity: quantity,
                va: convenienceVA,
                wattage: convenienceVA,
                horsepower: (convenienceVA / 746).toFixed(2),
                subtotal: (quantity * convenienceVA).toFixed(2),
                ratings: "-",
                abc: false
            };
        }
        // KITCHEN
        else if (selectedCategoryIndex === 2) {
            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: 1,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage).toFixed(2),
                ratings: ratings.trim() !== "" ? ratings : "-",
                abc: (get(_systemPhaseType) == 1 && isABC) ? true : false
            };
        }
        // MOTOR
        else if (selectedCategoryIndex === 3) {
            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: 1,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage).toFixed(2),
                ratings: ratings.trim() !== "" ? ratings : "-",
                abc: (get(_systemPhaseType) == 1 && isABC) ? true : false
            };
        }
        // SPARE
        else if (selectedCategoryIndex === 4) {
            const chosenName = spareName.trim() !== "" ? spareName : "Spare";
            details = {
                category: category.label,
                name: chosenName,
                quantity: 1,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (1 * wattage).toFixed(2),
                ratings: ratings.trim() !== "" ? ratings : "-",
                abc: (get(_systemPhaseType) == 1 && isABC) ? true : false
            };
        }
        // OTHER LOADS
        else if (selectedCategoryIndex === 5) {
            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: 1,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage).toFixed(2),
                ratings: ratings.trim() !== "" ? ratings : "-",
                abc: (get(_systemPhaseType) == 1 && isABC) ? true : false
            };
        }

        loadSpecifications.update(current => [...current, { ...details }]);

        // Reset fields
        quantity = 1;
        wattage = 0;
        convenienceVA = 180;
        horsepower = 0;
        spareName = "";
        selectedCategoryIndex = null;
        selectedCategoryType = null;
        ratings = "";
        isABC = false;

        sumOfSpecifications = getSumOfSpecifications();
    }

    // ----------------------------------------------------------------
    // Summarize all specs with demand factor logic
    // ----------------------------------------------------------------
    function getSumOfSpecifications() {
        const items = get(loadSpecifications);
        let sumOfSpecs = {};
        let tempLightingDemandFactor = 0;
        let tempConvenienceDemandFactor = 0;
        let tempOtherDemandFactor = 0;
        totalSumOfSpecs = 0;

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (!sumOfSpecs[item.category]) {
                sumOfSpecs[item.category] = { sum: 0, count: 0 };
            }
            sumOfSpecs[item.category].sum += parseFloat(item.subtotal);
            sumOfSpecs[item.category].count += 1;
        }

        for (const [key, value] of Object.entries(sumOfSpecs)) {
            if (value.count === 1 && key === "Kitchen Load") {
                sumOfSpecs[key].sum = parseFloat((value.sum * 0.8).toFixed(2));
            }

            if (key === "Lighting") {
                tempLightingDemandFactor += calculateDemandFactor(parseFloat(value.sum));
            } else if (key === "Convenience outlet") {
                tempConvenienceDemandFactor += value.sum;
            } else {
                tempOtherDemandFactor += value.sum;
            }
        }

        if (tempConvenienceDemandFactor > 10000) {
            let tempExcess = tempConvenienceDemandFactor - 10000;
            tempConvenienceDemandFactor = 10000 + tempExcess * 0.5;
        }

        applicationDemandFactor = tempLightingDemandFactor + tempConvenienceDemandFactor;
        totalSumOfSpecs += applicationDemandFactor + tempOtherDemandFactor;
        return sumOfSpecs;
    }

    function calculateDemandFactor(value) {
        if (selectedLightingDemandFactorID !== null) {
            const rules = constants.lightingDemandFactors[selectedLightingDemandFactorID];
            let remainder = value;
            let total = 0;

            for (let i = 0; i < rules.length; i++) {
                const [max, percentage] = rules[i];
                let applicableValue = 0;

                if (max === null) {
                    applicableValue = remainder;
                } else if (remainder > max) {
                    applicableValue = max - (rules[i - 1] ? rules[i - 1][0] : 0);
                    remainder -= applicableValue;
                } else {
                    applicableValue = remainder;
                    remainder = 0;
                }
                total += applicableValue * (percentage / 100);
                if (remainder === 0) break;
            }
            return total;
        }
        return value;
    }

    // Reactively track occupant-based calculations
    $: {
        if (selectedOccupancyValue !== null) {
            const occupancy = constants.occupancyTypes[parseInt(selectedOccupancyValue)];
            selectedOccupancyTypes = occupancy?.types?.length ? occupancy.types : [];
            selectedAddOns = occupancy?.addons?.length ? occupancy.addons : [];
        } else {
            selectedOccupancyTypes = [];
            selectedAddOns = [];
            loadByOccupancy = 0;
            selectedAddOnValue = null;
            selectedTypeValue = null;
        }

        if (selectedTypeValue !== null && selectedOccupancyTypes.length > 0) {
            const type = selectedOccupancyTypes[selectedTypeValue];
            if (type) {
                totalLoad = type.unit_load;
                if (selectedAddOns.length > 0 && selectedAddOnValue) {
                    const addon = selectedAddOns[selectedAddOnValue];
                    if (addon) totalLoad += addon.unit_load;
                }
                loadByOccupancy = totalLoad * floorArea;
                selectedLightingDemandFactorID = type.lighting_df;
            } else {
                loadByOccupancy = 0;
                selectedLightingDemandFactorID = null;
            }
        } else {
            loadByOccupancy = 0;
            selectedLightingDemandFactorID = null;
        }

        if (selectedCategoryIndex !== null && selectedCategoryIndex !== "") {
            hasCategoryTypes = !!(
                constants.loadSpecificationCategories[selectedCategoryIndex].types &&
                constants.loadSpecificationCategories[selectedCategoryIndex].types.length > 0
            );
        } else {
            hasCategoryTypes = false;
        }

        showSpecForm = !!(selectedOccupancyValue !== null);
    }

    // ----------------------------------------------------------------
    // CSV Data with Pairing Logic for AB, BC, CA in groups of two
    // skipping increments if ABC is used
    // ----------------------------------------------------------------
    let csvData = derived(
        [loadSpecifications, _volts, _systemPhaseType],
        ([$loadSpecifications, $volts, $phase]) => {
            const result = [];
            let pairIndex = 0; // increments for each non-ABC spec, 2 specs per "group"

            for (let i = 0; i < $loadSpecifications.length; i++) {
                const spec = $loadSpecifications[i];
                const CRKTno = i + 1;

                // Build "Load" column
                let loadStr = spec.name;
                if (spec.category === "Lighting" && spec.lightingLoads) {
                    const combos = spec.lightingLoads.map(
                        (row) => `${row.type}: ${row.wattage}W x ${row.quantity}`
                    );
                    loadStr = combos.join("; ");
                }

                let rowObj = {
                    CRKTno,
                    Load: loadStr,
                    Ratings: spec.ratings || "-",
                    "Volt Ampere": spec.subtotal,
                    Volts: $volts,
                    AmpLoadSingle: "",
                    AmpLoadAB: "",
                    AmpLoadBC: "",
                    AmpLoadCA: "",
                    AmpLoadABC: "",
                    SizeOfWire: spec.sizeOfWire || "",
                    ConduitSize: spec.conduitSize || ""
                };

                // Compute numeric amp
                const numericSubtotal = parseFloat(spec.subtotal) || 0;
                const ampLoadValue = $volts > 0 ? numericSubtotal / $volts : 0;

                if ($phase === 0) {
                    // Single-phase => use AmpLoadSingle
                    rowObj.AmpLoadSingle = ampLoadValue.toFixed(2);
                } else {
                    // 3-phase logic
                    if (spec.abc) {
                        // If user checked ABC, place it in ABC column
                        rowObj.AmpLoadABC = ampLoadValue.toFixed(2);
                        // Do not increment pairIndex => next spec uses same group
                    } else {
                        // Pairing logic
                        // 2 specs per group => group = floor(pairIndex / 2) mod 3
                        const group = Math.floor(pairIndex / 2) % 3;
                        if (group === 0) {
                            rowObj.AmpLoadAB = ampLoadValue.toFixed(2);
                        } else if (group === 1) {
                            rowObj.AmpLoadBC = ampLoadValue.toFixed(2);
                        } else {
                            rowObj.AmpLoadCA = ampLoadValue.toFixed(2);
                        }
                        pairIndex++;
                    }
                }
                result.push(rowObj);
            }
            return result;
        }
    );
</script>

<div class="flex flex-col h-screen">
    <header id="header" class="flex items-center bg-gray-800 h-14 sticky top-0 z-50 px-4">
        <div class="flex-1">
            <h1 class="text-white">GoCalc</h1>
        </div>
        <div class="flex flex-1 justify-center">
            <input
                    type="text"
                    id="projectName"
                    bind:value={projectName}
                    required
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Project Name"
            />
        </div>
        <div class="flex-1 flex justify-end items-center gap-2">
            <button
                    on:click={() => SaveJSON(projectName, $loadSpecifications)}
                    class="bg-green-500 hover:bg-green-700 text-white p-2 rounded inline-flex items-center"
            >
                <svg
                        class="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                >
                    <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 3v18h18V9l-6-6H3zm9 13a2 2 0 110-4 2 2 0 010 4zm-1-9V3l5 5h-5z"
                    />
                </svg>
            </button>
            <button class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded inline-flex items-center">
                <svg
                        class="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                >
                    <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 21h6V11l-3-3-3 3v10zm0 0V11l-3 3m3-3l3 3m-6 0h6"
                    />
                </svg>
            </button>
            <button
                    id="sideToggle"
                    class="bg-gray-200 hover:bg-gray-400 text-black p-2 rounded inline-flex items-center"
                    on:click={() => (showConsole = !showConsole)}
            >
                <svg
                        class="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                >
                    <path
                            fill-rule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clip-rule="evenodd"
                    />
                </svg>
            </button>
        </div>
    </header>

    <div class="flex flex-1 bg-gray-200">
        <main class="transition-all h-full duration-500 {showConsole ? 'w-2/3' : 'w-full'}">
            <div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
                <!-- Main form -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div class="h-20 py-4">
                        <label for="floorArea" class="block text-gray-700 text-sm font-bold mb-2">
                            Floor Area:
                        </label>
                        <input
                                type="number"
                                id="floorArea"
                                bind:value={floorArea}
                                required
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                min="0"
                                placeholder="Enter floor area"
                        />
                    </div>
                    <div class="h-20 py-4">
                        <label for="typeOfOccupancy" class="block text-gray-700 text-sm font-bold mb-2">
                            Type of Occupancy:
                        </label>
                        <select
                                bind:value={selectedOccupancyValue}
                                required
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            {#each constants.occupancyTypes as { label, value }}
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
                                    bind:value={selectedTypeValue}
                                    required
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                {#each selectedOccupancyTypes as { label, value }}
                                    <option value={value}>{label}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}

                    {#if selectedAddOns.length > 0}
                        <div class="h-20 py-4">
                            <label for="occupancyType" class="block text-gray-700 text-sm font-bold mb-2">
                                AddOn:
                            </label>
                            <select
                                    bind:value={selectedAddOnValue}
                                    required
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="">Optional</option>
                                {#each selectedAddOns as { label, value }}
                                    <option value={value}>{label}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}

                    <div class="h-20 py-4">
                        <label for="systemPhaseType" class="block text-gray-700 text-sm font-bold mb-2">
                            System Phase:
                        </label>
                        <select
                                bind:value={systemPhaseType}
                                required
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            {#each constants.phaseTypes as { label, value }}
                                <option value={value}>{label}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="h-20 py-4">
                        <label for="volts" class="block text-gray-700 text-sm font-bold mb-2">
                            Volts:
                        </label>
                        <input
                                type="number"
                                id="volts"
                                bind:value={volts}
                                required
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                min="1"
                                placeholder="Enter Volts"
                        />
                    </div>
                </div>

                {#if showSpecForm}
                    <!-- Spec form -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-b-gray-500 py-4">
                        <div class="h-20 py-4">
                            <label for="category" class="block text-gray-700 text-sm font-bold mb-2">
                                Load Specification Category:
                            </label>
                            <select
                                    id="category"
                                    bind:value={selectedCategoryIndex}
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="">Select a Category</option>
                                {#each constants.loadSpecificationCategories as category, index}
                                    <option value={index}>{category.label}</option>
                                {/each}
                            </select>
                        </div>

                        {#if hasCategoryTypes && selectedCategoryIndex !== 0}
                            <div class="h-20 py-4">
                                <label for="selectedCategoryType" class="block text-gray-700 text-sm font-bold mb-2">
                                    Type:
                                </label>
                                <select
                                        bind:value={selectedCategoryType}
                                        required
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {#each constants.loadSpecificationCategories[selectedCategoryIndex].types as { label, value }}
                                        <option value={value}>{label}</option>
                                    {/each}
                                </select>
                            </div>
                        {/if}

                        <!-- LIGHTING category (index === 0) -->
                        {#if selectedCategoryIndex === 0}
                            <div class="col-span-4 py-4 border rounded bg-white px-2">
                                <h3 class="font-bold text-gray-700 mb-2">
                                    Lighting
                                </h3>
                                {#if $lightingRows.length > 0}
                                    {#each $lightingRows as row, rowIndex}
                                        <div class="flex flex-wrap gap-2 mb-2 items-end">
                                            <div class="flex flex-col">
                                                <label class="block text-gray-700 text-sm font-bold">
                                                    Type:
                                                </label>
                                                <select
                                                        bind:value={row.typeValue}
                                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700 focus:outline-none focus:shadow-outline"
                                                >
                                                    <option value={null}>Select Type</option>
                                                    {#each constants.loadSpecificationCategories[0].types as { label, value }}
                                                        <option value={value}>{label}</option>
                                                    {/each}
                                                </select>
                                            </div>

                                            <div class="flex flex-col">
                                                <label class="block text-gray-700 text-sm font-bold" for="wattage">
                                                    Wattage
                                                </label>
                                                <input
                                                        type="number"
                                                        min="1"
                                                        bind:value={row.wattage}
                                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                />
                                            </div>

                                            <div class="flex flex-col">
                                                <label class="block text-gray-700 text-sm font-bold" for="quantity">
                                                    Quantity
                                                </label>
                                                <input
                                                        type="number"
                                                        min="1"
                                                        max="999"
                                                        bind:value={row.quantity}
                                                        class="shadow appearance-none border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

                        <!-- Convenience Outlet (index === 1) -->
                        {#if selectedCategoryIndex === 1}
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="convenienceVA">
                                    VA:
                                </label>
                                <input
                                        type="number"
                                        min="1"
                                        bind:value={convenienceVA}
                                        id="convenienceVA"
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Quantity:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input
                                                type="number"
                                                min="1"
                                                max="8"
                                                bind:value={quantity}
                                                id="quantity"
                                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <!-- Kitchen (index === 2) -->
                        {#if selectedCategoryIndex === 2}
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Wattage:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input
                                                type="number"
                                                min="1"
                                                bind:value={wattage}
                                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <!-- Motor (index === 3) -->
                        {#if selectedCategoryIndex === 3}
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="motorWattage">
                                    Wattage:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input
                                                type="number"
                                                min="1"
                                                bind:value={wattage}
                                                id="motorWattage"
                                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <!-- Spare (index === 4) -->
                        {#if selectedCategoryIndex === 4}
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="spareName">
                                    Spare Name (optional)
                                </label>
                                <input
                                        type="text"
                                        bind:value={spareName}
                                        id="spareName"
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="e.g. Spare Heater, Spare Light..."
                                />
                            </div>
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="spareWattage">
                                    Wattage:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input
                                                type="number"
                                                min="1"
                                                bind:value={wattage}
                                                id="spareWattage"
                                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <!-- Other (index === 5) -->
                        {#if selectedCategoryIndex === 5}
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Wattage:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input
                                                type="number"
                                                min="1"
                                                bind:value={wattage}
                                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        />
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <!-- "Ratings" field for categories 2,3,4,5 -->
                        {#if selectedCategoryIndex !== null && selectedCategoryIndex != 0 && selectedCategoryIndex != 1}
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="ratings">
                                    Ratings:
                                </label>
                                <input
                                        type="text"
                                        bind:value={ratings}
                                        id="ratings"
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="e.g. 1/2 HP, 220V..."
                                />
                            </div>
                        {/if}

                        <!-- "ABC" checkbox for 3-phase (excl. lighting/convenience) -->
                        {#if get(_systemPhaseType) == 1 && selectedCategoryIndex != null && selectedCategoryIndex != 0 && selectedCategoryIndex != 1}
                            <div class="flex items-end py-4">
                                <input
                                        type="checkbox"
                                        bind:checked={isABC}
                                        id="abc"
                                        class="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                />
                                <label for="abc" class="block text-gray-700 text-sm font-bold">
                                    ABC
                                </label>
                            </div>
                        {/if}
                    </div>

                    {#if selectedCategoryIndex !== null}
                        <div class="h-20 py-4">
                            <button
                                    type="submit"
                                    class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:ml-3 sm:mt-0 sm:w-auto"
                                    on:click={addLoadSpecification}
                            >
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

                    <div class="mx-auto container-fluid">
                        <div class="my-4">
                            <div class="sm:flex sm:items-center">
                                <div class="sm:flex-auto">
                                    <a
                                            class="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                                            href="#!"
                                            on:click={() => (showLoadSpecs = !showLoadSpecs)}
                                    >
                                        Show Load Specifications
                                    </a>
                                </div>
                            </div>
                            {#if showLoadSpecs}
                                <div class="m-2 flow-root">
                                    <div class="my-2 overflow-y-auto">
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
                                                            Unit Load (W/HP or VA)
                                                        </th>
                                                        <th
                                                                scope="col"
                                                                class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                        >
                                                            Quantity
                                                        </th>
                                                        <!-- (1) Subtotal => "VA" -->
                                                        <th
                                                                scope="col"
                                                                class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                        >
                                                            VA
                                                        </th>
                                                        <!-- (2) Phase column -->
                                                        <th
                                                                scope="col"
                                                                class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                        >
                                                            Phase
                                                        </th>
                                                        <!-- (3) Volts column -->
                                                        <th
                                                                scope="col"
                                                                class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                        >
                                                            Volts
                                                        </th>
                                                        <!-- (4) Amp Load column -->
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
                                                    {#each $loadSpecifications as spec, idx}
                                                        <tr>
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
                                                                        {spec.wattage}W | {spec.horsepower}HP
                                                                    </code>
                                                                {/if}
                                                            </td>
                                                            <td
                                                                    class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                                            >
                                                                <code>{spec.quantity}</code>
                                                            </td>
                                                            <!-- (1) VA -->
                                                            <td
                                                                    class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                                            >
                                                                <code>{spec.subtotal}</code>
                                                            </td>
                                                            <!-- (2) Phase: single-phase => '1'; else '3' -->
                                                            <td
                                                                    class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                                            >
                                                                {#if systemPhaseType == 0}
                                                                    1
                                                                {:else}
                                                                    3
                                                                {/if}
                                                            </td>
                                                            <!-- (3) Volts -->
                                                            <td
                                                                    class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                                            >
                                                                <code>{volts}</code>
                                                            </td>
                                                            <!-- (4) Amp Load => VA / volts -->
                                                            <td
                                                                    class="whitespace-nowrap px-3 py-1 text-sm text-gray-500"
                                                            >
                                                                {#if volts > 0}
                                                                    <code>
                                                                        {(parseFloat(spec.subtotal) / volts).toFixed(2)}
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
                                                                                d="M3 6v16c0 1.104.896 2 2 2h14c1.104 0 2-.896 2-2V6H3zm16 2h-3v12h3V8zm-5 0H9v12h5V8zm-6 0H5v12h3V8zm4-6l-1-2h-4l-1 2H2v2h20V2h-5z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    {/each}
                                                    </tbody>
                                                    <tfoot class="bg-gray-100">
                                                    <tr>
                                                        <!-- 9 columns total -->
                                                        <td colspan="4" class="text-right font-semibold py-2 px-3">
                                                            Totals:
                                                        </td>
                                                        <td class="py-2 px-3 text-sm text-gray-800">
                                                            <code>{totalOfAllVA.toFixed(2)}</code>
                                                        </td>
                                                        <td></td>
                                                        <td class="py-2 px-3 text-sm text-gray-800">
                                                            <code>{volts}</code>
                                                        </td>
                                                        <td class="py-2 px-3 text-sm text-gray-800">
                                                            <code>{totalOfAllAmp.toFixed(2)}</code>
                                                        </td>
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
                    </div>
                {/if}

                <!-- For quick debugging: show CSV data as JSON -->
                <pre class="mt-4 bg-white p-2 rounded">
{JSON.stringify($csvData, null, 2)}
                </pre>
            </div>
        </main>

        <aside class="transition-all h-full duration-500 bg-white {showConsole ? 'w-1/3' : 'hidden'}">
            <div class="container-fluid m-2 pl-4">
                <div class="h-20 py-4">
                    <h3 class="block text-gray-700 font-bold mb-2">
                        Lighting Load at {totalLoad}VA per m<sup>2</sup>:
                        <code>{loadByOccupancy} VA</code>
                    </h3>

                    <h3 class="block text-gray-700 font-bold mb-2">Sum of Specifications</h3>
                    {#each Object.entries(sumOfSpecifications) as [category, data]}
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
                            <code>{applicationDemandFactor} VA</code>
                        </p>
                        <p>
                            <span class="font-bold">Total:</span>
                            <code>{totalSumOfSpecs} VA</code>
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</div>

<style>
    /* Minimal custom styling */
</style>