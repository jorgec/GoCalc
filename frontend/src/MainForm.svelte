<script>

    import {onDestroy, onMount} from 'svelte';
    import {writable} from "svelte/store";
    import {SaveJSON} from "../wailsjs/go/main/App.js";

    let constants = {occupancyTypes: [], phaseTypes: [], loadSpecificationCategories: [], lightingDemandFactors: []};

    let projectData = writable({});

    // ui
    let showLoadSpecs = false;
    let showConsole = false;
    let showSpecForm = false;

    let projectName = "";
    let floorArea = 0;
    let totalLoad = 0;
    let selectedOccupancyValue = null;
    let selectedTypeValue = null;
    let loadByOccupancy = 0;
    let selectedOccupancyTypes = [];
    let selectedAddOns = [];
    let selectedAddOnValue = null;
    let systemPhaseType = null;
    let sumOfSpecifications = {};
    let totalSumOfSpecs = 0;
    let selectedLightingDemandFactorID = null;
    let applicationDemandFactor = 0;
    let amps = 0;

    // selectedCategory
    let hasCategoryTypes = false;
    let selectedCategoryIndex = null;
    let loadSpecifications = writable([]);
    let quantity = 1;
    let wattage = 0;
    let horsepower = 0;
    let selectedCategoryType = null;


    // Function to load constants
    const fetchConstants = async () => {
        const response = await import('./constants.json');
        constants = response.default;
    };

    // Load constants on component mount
    onMount(() => {
        fetchConstants();

    });

    function removeLoadSpecification(indexToRemove) {
        loadSpecifications.update(currentSpecifications =>
            currentSpecifications.filter((_, index) => index !== indexToRemove)
        );
        sumOfSpecifications = getSumOfSpecifications();
    }

    const addLoadSpecification = () => {
        let category = constants.loadSpecificationCategories[selectedCategoryIndex];

        let details = {}

        if (selectedCategoryIndex === 0) {
            // lighting

            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: quantity,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage * 1.05).toFixed(2)
            }

        }

        if (selectedCategoryIndex === 1) {
            // convenience outlet
            wattage = 180;
            details = {
                category: category.label,
                name: "N/A",
                quantity: quantity,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage).toFixed(2)
            }
        }

        if (selectedCategoryIndex === 2) {
            // kitchen
            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: 1,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage).toFixed(2)
            }
        }

        if (selectedCategoryIndex === 3) {
            // motor
            wattage = horsepower * 742;
            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: 1,
                wattage: wattage,
                horsepower: horsepower,
                subtotal: (quantity * wattage).toFixed(2)
            }
        }

        if (selectedCategoryIndex === 4) {
            // spare
            wattage = category.types[selectedCategoryType].unit_load;

            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: 1,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage).toFixed(2)
            }
        }

        if (selectedCategoryIndex === 5) {
            // others

            details = {
                category: category.label,
                name: category.types[selectedCategoryType].label,
                quantity: 1,
                wattage: wattage,
                horsepower: (wattage / 746).toFixed(2),
                subtotal: (quantity * wattage).toFixed(2)
            }
        }


        loadSpecifications.update(current => [
            ...current,
            {...details}
        ]);

        quantity = 1;
        wattage = 0;
        horsepower = 0;
        selectedCategoryIndex = null;
        selectedCategoryType = null;
        sumOfSpecifications = getSumOfSpecifications();
    }

    function calculateAmps() {
        // https://www.calculatorology.com/va-to-amps-calculator/

    }

    function getSumOfSpecifications() {
        let sumOfSpecs = {};
        let tempLightingDemandFactor = 0;
        let tempConvenienceDemandFactor = 0;
        let tempOtherDemandFactor = 0;
        totalSumOfSpecs = 0;


        const specs = loadSpecifications.subscribe(items => {
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (sumOfSpecs[item.category] === undefined) {
                    sumOfSpecs[item.category] = {
                        "sum": 0,
                        "count": 0
                    }
                }
                sumOfSpecs[item.category]["sum"] += parseFloat(item.subtotal);
                sumOfSpecs[item.category]["count"] += 1;
            }
        });

        for (const [key, value] of Object.entries(sumOfSpecs)) {
            if (sumOfSpecs[key]["count"] === 1 && key === "Kitchen Load") {
                sumOfSpecs[key]["sum"] = (sumOfSpecs[key]["sum"] * .8).toFixed(2);
            }

            if (key === "Lighting") {
                tempLightingDemandFactor += calculateDemandFactor(parseFloat(value["sum"]))
            } else if (key === "Convenience outlet") {
                tempConvenienceDemandFactor += parseFloat(value["sum"])
            } else {
                tempOtherDemandFactor += parseFloat(value["sum"]);
            }

            // totalSumOfSpecs += parseFloat(sumOfSpecs[key]["sum"]);
        }

        if (tempConvenienceDemandFactor > 10000) {
            let tempExcess = tempConvenienceDemandFactor - 10000;
            tempConvenienceDemandFactor = 10000 + (tempExcess * .5);
        }
        applicationDemandFactor = tempLightingDemandFactor + tempConvenienceDemandFactor;
        totalSumOfSpecs += applicationDemandFactor + tempOtherDemandFactor;

        onDestroy(specs);
        return sumOfSpecs;
    }

    function calculateDemandFactor(value) {
        // Check if a specific set of rules (identified by `selectedLightingDemandFactorID`) is selected.
        if (selectedLightingDemandFactorID !== null) {
            // Retrieve the applicable set of rules based on the selected ID.
            const rules = constants.lightingDemandFactors[selectedLightingDemandFactorID];

            // Initialize `remainder` with the input value. `remainder` will be reduced as rules are applied.
            let remainder = value;
            // Initialize `total` which will accumulate the calculated demand based on applicable percentages.
            let total = 0;

            // Iterate through each rule in the selected set of rules.
            for (let i = 0; i < rules.length; i++) {
                // Destructure the current rule into `max` (maximum value for this tier) and `percentage` (applicable percentage).
                const [max, percentage] = rules[i];
                // Initialize `applicableValue` which will hold the value from `remainder` that this rule applies to.
                let applicableValue = 0;

                // If `max` is null, this rule applies to all remaining value.
                if (max === null) {
                    applicableValue = remainder;
                }
                    // If `remainder` exceeds the current `max`, calculate `applicableValue` as the difference up to this `max`,
                // subtracting any value covered by the previous rule, if any.
                else if (remainder > max) {
                    applicableValue = max - (rules[i - 1] ? rules[i - 1][0] : 0);
                    remainder -= applicableValue; // Reduce `remainder` by `applicableValue`.
                }
                // If `remainder` does not exceed `max`, this rule applies to the entire remaining value.
                else {
                    applicableValue = remainder;
                    remainder = 0; // Set `remainder` to 0 as the entire remaining value is accounted for.
                }

                // Accumulate into `total` the `applicableValue` multiplied by the `percentage` factor (converted from percentage to decimal).
                total += applicableValue * (percentage / 100);

                // If there's no remainder left after applying this rule, exit the loop early as all value has been accounted for.
                if (remainder === 0) break;
            }
            // Return the calculated `total` after applying all applicable rules.
            return total;
        }
        // If no rules set is selected, return the original input value unmodified.
        return value;
    }


    // Reactively update the available types and calculate load based on selections
    $: {
        if (selectedOccupancyValue !== null) {
            const occupancy = constants.occupancyTypes[parseInt(selectedOccupancyValue)];
            selectedOccupancyTypes = [];
            selectedAddOns = [];
            selectedOccupancyTypes = occupancy.types.length > 0 ? occupancy.types : [];
            selectedAddOns = occupancy.addons.length > 0 ? occupancy.addons : [];

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
                if (selectedAddOns.length > 0) {
                    if (selectedAddOnValue !== null && selectedAddOnValue !== "") {
                        const addon = selectedAddOns[selectedAddOnValue];
                        totalLoad += addon.unit_load;
                    }
                }
                loadByOccupancy = type ? totalLoad * floorArea : 0;
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
            hasCategoryTypes = !!(constants.loadSpecificationCategories[selectedCategoryIndex].types && constants.loadSpecificationCategories[selectedCategoryIndex].types.length > 0);
        } else {
            hasCategoryTypes = false;
        }

        showSpecForm = !!(selectedOccupancyValue !== null && floorArea > 0);
    }

</script>
<div class="flex flex-col h-screen">
    <header id="header" class="flex items-center bg-gray-800 h-14 sticky top-0 z-50 px-4">
        <div class="flex-1">
            <h1 class="text-white">GoCalc</h1>
        </div>
        <div class="flex flex-1 justify-center">
            <input type="text" id="projectName" bind:value={projectName} required
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   placeholder="Enter Project Name">
        </div>
        <div class="flex-1 flex justify-end items-center gap-2">
            <button
                    on:click={() => SaveJSON(projectName, $loadSpecifications)}
                    class="bg-green-500 hover:bg-green-700 text-white p-2 rounded inline-flex items-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 3v18h18V9l-6-6H3zm9 13a2 2 0 110-4 2 2 0 010 4zm-1-9V3l5 5h-5z"/>
                </svg>
            </button>
            <button class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded inline-flex items-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 21h6V11l-3-3-3 3v10zm0 0V11l-3 3m3-3l3 3m-6 0h6"/>
                </svg>

            </button>
            <button id="sideToggle"
                    class="bg-gray-200 hover:bg-gray-400 text-black p-2 rounded inline-flex items-center"
                    on:click={() => showConsole = !showConsole}>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clip-rule="evenodd"/>
                </svg>
            </button>
        </div>
    </header>

    <div class="flex flex-1 bg-gray-200">
        <main class="transition-all h-full duration-500 {showConsole ? 'w-2/3' : 'w-full'}">
            <div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">

                <!-- begin main form -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div class="h-20 py-4">
                        <label for="floorArea" class="block text-gray-700 text-sm font-bold mb-2">Floor Area:</label>
                        <input type="number" id="floorArea" bind:value={floorArea} required
                               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                               min="0" placeholder="Enter floor area">
                    </div>
                    <div class="h-20 py-4">
                        <label for="typeOfOccupancy" class="block text-gray-700 text-sm font-bold mb-2">Type of
                            Occupancy:</label>
                        <select bind:value={selectedOccupancyValue} required
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">

                            {#each constants.occupancyTypes as {label, value}}
                                <option value={value}>{label}</option>
                            {/each}
                        </select>
                    </div>

                    {#if selectedOccupancyTypes.length > 0}
                        <div class="h-20 py-4">
                            <label for="occupancyType" class="block text-gray-700 text-sm font-bold mb-2">Occupancy
                                Type:</label>
                            <select bind:value={selectedTypeValue} required
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">

                                {#each selectedOccupancyTypes as {label, value}}
                                    <option value={value}>{label}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}

                    {#if selectedAddOns.length > 0}
                        <div class="h-20 py-4">
                            <label for="occupancyType" class="block text-gray-700 text-sm font-bold mb-2">AddOn:</label>
                            <select bind:value={selectedAddOnValue} required
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                <option value="">Optional</option>
                                {#each selectedAddOns as {label, value}}
                                    <option value={value}>{label}</option>
                                {/each}
                            </select>
                        </div>
                    {/if}


                    <div class="h-20 py-4">
                        <label for="systemPhaseType" class="block text-gray-700 text-sm font-bold mb-2">System
                            Phase:</label>
                        <select bind:value={systemPhaseType} required
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">

                            {#each constants.phaseTypes as {label, value}}
                                <option value={value}>{label}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                {#if showSpecForm}
                    <!-- begin spec form -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-b-gray-500 py-4">
                        <div class="h-20 py-4">
                            <label for="category" class="block text-gray-700 text-sm font-bold mb-2">
                                Load Specification Category:
                            </label>
                            <select id="category" bind:value={selectedCategoryIndex}
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                <option value="">Select a Category</option>
                                {#each constants.loadSpecificationCategories as category, index}
                                    <option value={index}>{category.label}</option>
                                {/each}
                            </select>
                        </div>
                        {#if hasCategoryTypes }
                            <div class="h-20 py-4">
                                <label for="selectedCategoryType" class="block text-gray-700 text-sm font-bold mb-2">Type:</label>
                                <select bind:value={selectedCategoryType} required
                                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">

                                    {#each constants.loadSpecificationCategories[selectedCategoryIndex].types as {
                                        label,
                                        value
                                    }}
                                        <option value={value}>{label}</option>
                                    {/each}
                                </select>
                            </div>
                        {/if}

                        {#if selectedCategoryIndex === 0}
                            <!-- Lighting Form -->
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="wattage">
                                    Wattage:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input type="number" min="1" bind:value={wattage} id="wattage"
                                               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    </div>
                                </div>

                            </div>
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Quantity:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input type="number" min="1" max="8" bind:value={quantity} id="quantity"
                                               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    </div>
                                </div>

                            </div>
                        {/if}

                        {#if selectedCategoryIndex === 1}
                            <!-- Convenience Outlet Form -->
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Quantity:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input type="number" min="1" max="8" bind:value={quantity} id="quantity"
                                               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    </div>
                                </div>


                            </div>
                        {/if}

                        {#if selectedCategoryIndex === 2}
                            <!-- Kitchen Load Form -->
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Wattage:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input type="number" min="1" bind:value={wattage}
                                               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                    </div>
                                </div>

                            </div>
                        {/if}

                        {#if selectedCategoryIndex === 3}
                            <!-- Motor Form -->
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Horsepower
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">

                                        <select bind:value={horsepower} required
                                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">

                                            <option value="0.5">0.5W</option>
                                            <option value="0.75">0.75W</option>
                                            <option value="1.0">1.0W</option>
                                            <option value="1.5">1.5W</option>
                                            <option value="2.0">2.0W</option>
                                            <option value="2.5">2.5W</option>
                                            <option value="3.0">3.0W</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        {/if}

                        {#if selectedCategoryIndex === 4}
                            <!-- Spare Form -->
                            <!-- ... similar pattern -->
                        {/if}

                        {#if selectedCategoryIndex === 5}
                            <!-- Other Loads Form -->
                            <div class="h-20 py-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="quantity">
                                    Wattage:
                                </label>
                                <div class="sm:flex sm:items-center">
                                    <div class="w-full sm:max-w-xs">
                                        <input type="number" min="1" bind:value={wattage}
                                               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                    </div>
                                </div>

                            </div>
                        {/if}
                    </div>
                    {#if selectedCategoryIndex !== null}
                        <div class="h-20 py-4">
                            <button type="submit"
                                    class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:ml-3 sm:mt-0 sm:w-auto"
                                    on:click={() => addLoadSpecification()}>
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M12 4v16m8-8H4"></path>
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
                                            class="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 sm:ml-3 sm:mt-0 sm:w-auto"
                                            href="#!" on:click={() => showLoadSpecs = !showLoadSpecs}>
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
                                                        <th scope="col"
                                                            class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                            Category
                                                        </th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Name
                                                        </th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Unit Load (W/HP)
                                                        </th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Quantity
                                                        </th>
                                                        <th scope="col"
                                                            class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Subtotal
                                                        </th>
                                                        <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                            Actions

                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody class="divide-y divide-gray-200 bg-white">
                                                    {#each $loadSpecifications as spec, idx}
                                                        <tr>
                                                            <td class="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                                {spec.category}
                                                            </td>
                                                            <td class="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
                                                                {spec.name}
                                                            </td>
                                                            <td class="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
                                                                <code>{spec.wattage}W | {spec.horsepower}HP</code>
                                                            </td>
                                                            <td class="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
                                                                <code>{spec.quantity}</code>
                                                            </td>
                                                            <td class="whitespace-nowrap px-3 py-1 text-sm text-gray-500">
                                                                <code>{spec.subtotal}W</code>
                                                            </td>

                                                            <td class="relative whitespace-nowrap py-1 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                                <button on:click={() => removeLoadSpecification(idx)}
                                                                        style="background-color: transparent; border: none; cursor: pointer; padding: 10px;">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18"
                                                                         height="18"
                                                                         fill="red"
                                                                         viewBox="0 0 24 24">
                                                                        <path d="M3 6v16c0 1.104.896 2 2 2h14c1.104 0 2-.896 2-2V6H3zm16 2h-3v12h3V8zm-5 0H9v12h5V8zm-6 0H5v12h3V8zm4-6l-1-2h-4l-1 2H2v2h20V2h-5z"/>
                                                                    </svg>
                                                                </button>

                                                            </td>
                                                        </tr>
                                                    {/each}

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>

                    </div>
                {/if} <!-- /showSpecForm -->
            </div>
        </main>
        <aside class="transition-all h-full duration-500 bg-white {showConsole ? 'w-1/3' : 'hidden'}">
            <div class="container-fluid m-2 pl-4">
                <div class="h-20 py-4">
                    <h3 class="block text-gray-700 font-bold mb-2">Lighting Load at {totalLoad}VA per m<sup>2</sup>:
                        <code>{loadByOccupancy} VA</code></h3>

                    <h3 class="block text-gray-700 font-bold mb-2">Sum of Specifications</h3>
                    <!--{JSON.stringify(sumOfSpecifications, null, 2)}-->
                    {#each Object.entries(sumOfSpecifications) as [category, data]}
                        <div class="max-w-md mx-auto grid grid-cols-2 gap-4 text-sm p-0 m-0">
                            <div class="font-semibold  p-0 m-0">{category} ({data.count})</div>
                            <div class="p-0 m-0"><code>{data.sum}</code></div>
                        </div>
                    {/each}

                    <div class="my-4 p-2 px-3 bg-teal-300 text-teal-950">
                        <p><span class="font-semibold">Application Demand Factor:</span> <code>{applicationDemandFactor}
                            VA</code></p>
                        <p><span class="font-bold">Total:</span> <code>{totalSumOfSpecs} VA</code></p>
                    </div>


                </div>
            </div>
        </aside>
    </div>
</div>


<style></style>