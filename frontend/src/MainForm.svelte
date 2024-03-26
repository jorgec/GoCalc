<script>

    import {onMount} from 'svelte';
    import {writable} from "svelte/store";
    import {SaveJSON} from "../wailsjs/go/main/App.js";

    let constants = {occupancyTypes: [], phaseTypes: [], loadSpecificationCategories: []};
    let projectName = "";
    let floorArea = 0;
    let selectedOccupancyValue = 0;
    let selectedTypeValue = 0;
    let loadByOccupancy = 0;
    let selectedOccupancyTypes = [];
    let systemPhaseType = 0;

    // selectedCategory
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

        if(selectedCategoryIndex === 1){
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

        if(selectedCategoryIndex === 2){
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

        if(selectedCategoryIndex === 3){
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

        if(selectedCategoryIndex === 4){
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

        if(selectedCategoryIndex === 5){
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
    }

    // Reactively update the available types and calculate load based on selections
    $: {
        if (selectedOccupancyValue) {
            const occupancy = constants.occupancyTypes.find(ot => ot.value === parseInt(selectedOccupancyValue));
            selectedOccupancyTypes = occupancy ? occupancy.types : [];
        } else {
            selectedOccupancyTypes = [];
        }

        if (selectedTypeValue && selectedOccupancyTypes.length > 0) {
            const type = selectedOccupancyTypes.find(t => t.value === parseInt(selectedTypeValue));
            loadByOccupancy = type ? type.unit_load * floorArea : 0;
        } else {
            loadByOccupancy = 0;
        }

    }

</script>
<div class="container mx-auto px-4 mb-2">

    <!-- begin main form -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="h-20 py-4">
            <label for="floorArea" class="block text-gray-700 text-sm font-bold mb-2">Project Name:</label>
            <input type="text" id="projectName" bind:value={projectName} required
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   placeholder="Enter Project Name">
        </div>
        <div class="h-20 py-4">
            <label for="floorArea" class="block text-gray-700 text-sm font-bold mb-2">Floor Area:</label>
            <input type="number" id="floorArea" bind:value={floorArea} required
                   class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                   min="0" placeholder="Enter floor area">
        </div>
        <div class="h-20 py-4">
            <label for="typeOfOccupancy" class="block text-gray-700 text-sm font-bold mb-2">Type of Occupancy:</label>
            <select bind:value={selectedOccupancyValue} required
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="">Select one</option>
                {#each constants.occupancyTypes as {label, value}}
                    <option value={value}>{label}</option>
                {/each}
            </select>
        </div>

        {#if selectedOccupancyTypes.length > 0}
            <div class="h-20 py-4">
                <label for="occupancyType" class="block text-gray-700 text-sm font-bold mb-2">Occupancy Type:</label>
                <select bind:value={selectedTypeValue} required
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <option value="">Select one</option>
                    {#each selectedOccupancyTypes as {label, value}}
                        <option value={value}>{label}</option>
                    {/each}
                </select>
            </div>
        {/if}

        <div class="h-20 py-4">
            <label for="systemPhaseType" class="block text-gray-700 text-sm font-bold mb-2">System Phase:</label>
            <select bind:value={systemPhaseType} required
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="">Select one</option>
                {#each constants.phaseTypes as {label, value}}
                    <option value={value}>{label}</option>
                {/each}
            </select>
        </div>
    </div>

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
        {#if selectedCategoryIndex !== null && constants.loadSpecificationCategories[selectedCategoryIndex].types && constants.loadSpecificationCategories[selectedCategoryIndex].types.length > 0}
            <div class="h-20 py-4">
                <label for="selectedCategoryType" class="block text-gray-700 text-sm font-bold mb-2">Type:</label>
                <select bind:value={selectedCategoryType} required
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <option value="">Select one</option>
                    {#each constants.loadSpecificationCategories[selectedCategoryIndex].types as {label, value}}
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
                            <option value="">Select one</option>
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

</div>
<div class="mx-auto px-4 container">
    <div class="flex flex-col p-4 justify-center">
        <div class="h-20 py-4">
            <p class="text-gray-700 text-sm font-bold">Load by Occupancy:</p>
            <p class="text-gray-600">{loadByOccupancy}</p>
        </div>
    </div>

    <div class="my-4">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-base font-semibold leading-6 text-gray-900">Load Specifications</h1>
                <p class="mt-2 text-sm text-gray-700">A list currently active loads</p>
            </div>
        </div>
        <div class="mt-8 flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Category
                                </th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Name
                                </th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Unit Load (W/HP)
                                </th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Quantity
                                </th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
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
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="red"
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
    </div>

    <div class="flex flex-col flex-grow">
        <button
                on:click={() => SaveJSON(projectName, $loadSpecifications)}
                class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:ml-3 sm:mt-0 sm:w-auto">
            Save
        </button>
    </div>

</div>


<style></style>