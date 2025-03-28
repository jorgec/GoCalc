<script>
    import {onMount} from 'svelte';
    import {
        addBrand,
        addItemToCategory,
        inventory,
        laborCost,
        laborPercentage,
        logisticsCost,
        materialDictionary,
        materialsCost,
        materialsInventory,
        totalInventoryCost,
        totalProjectCost,
        wireTypes, brands
    } from '../stores/materialInventoryStore';
    import {derived, writable} from 'svelte/store';
    import {slugify} from '../utils/misc.js';
    import {statusMessage} from "../stores/uiStore.js";

    // Form state
    const selectedCategory = writable('');
    const selectedItem = writable('');
    const selectedBrand = writable('');
    const unit = writable('');
    const quantity = writable(1);

    // Extract category names from materialDictionary
    let categories = [];
    let items;

    deriveCategories();

    function deriveCategories(){
        items = derived([inventory, selectedCategory], ([$inventory, $selectedCategory]) => {
            if ($selectedCategory && $inventory[$selectedCategory]) {
                return $inventory[$selectedCategory];
            } else {
                return [];
            }
        });
    }

    onMount(() => {
        categories = Object.keys(materialDictionary);
        return inventory.subscribe($inventory => {
            console.log('Inventory Store Changed:', $inventory);
        }); // Return the unsubscribe function for cleanup
    });

    // Update items dropdown based on selected category
    // $: if ($selectedCategory) {
    //     items = materialDictionary[$selectedCategory] || [];
    // }

    // Function to format numbers with commas
    function formatNumber(value) {
        return new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value);
    }

    // Computed Unit Price from store
    let unitPrice = 0;
    // $: if ($selectedCategory && $selectedItem) {
    //     try{
    //         const selectedItemDetails = items.find(item => item.slug === $selectedItem);
    //         unitPrice = selectedItemDetails ? Number(selectedItemDetails["Unit Price"]) : 0;
    //     }catch (error){
    //         unitPrice = 0;
    //     }
    //
    // }

    // Function to remove an item from inventory
    function removeItem(category, itemIndex) {
        materialsInventory.update(inv => {
            inv[category].splice(itemIndex, 1); // Remove item at index

            // If category is empty after removal, delete it
            if (inv[category].length === 0) {
                delete inv[category];
            }

            return {...inv};
        });
    }

    // Function to add item to inventory
    function addItem() {
        if ($selectedCategory === '' || $selectedItem === '' || $selectedBrand === '' || $quantity <= 0) {
            alert("Please fill in all fields.");
            return;
        }
        let selectedItemDetails = $items.find(item => item.slug === $selectedItem);
        if (!selectedItemDetails) return;

        const subtotal = unitPrice * Number($quantity); // Compute Subtotal
        let slug = selectedItemDetails.slug;
        let description = selectedItemDetails.Description;
        if ($selectedCategory === 'Wire and Cable') {
            slug = slugify(description, selectedWireType);
            description = `${description} ${selectedWireType}`;
        }

        const newItem = {
            slug: slug,
            // Unit: selectedItemDetails.Unit,
            Unit: $unit,
            Description: description,
            "Unit Price": unitPrice.toFixed(2), // Use stored price
            Brand: $selectedBrand,
            Quantity: Number($quantity),
            Subtotal: subtotal.toFixed(2)
        };

        materialsInventory.update(inv => {
            const category = $selectedCategory;
            if (!inv[category]) {
                inv[category] = [];
            }
            inv[category].push(newItem);
            return {...inv};
        });

        selectedItem.set('');
        selectedBrand.set('');
        unit.set('');
        unitPrice = 0;
        quantity.set(1);
    }

    let selectedWireType = '';

    // brands
    let showAddBrand = false;
    let newBrand = '';

    function addNewBrand() {
        if (newBrand === '') {
            statusMessage.set({text: "Name can't be empty", type: 'error'});
        } else {
            addBrand(newBrand);
            showAddBrand = false;
            newBrand = '';
        }
    }

    $: if ($inventory) {
        deriveCategories();
    }

    // items
    let showAddItem = false;
    let newItemDescription = '';
    let newItemUnit = '';

    function addNewItemToList() {
        if (newItemDescription === '') {
            statusMessage.set({text: "Name can't be empty", type: 'error'});
        } else {
            const slug = slugify(newItemDescription, newItemUnit).join("-");
            const newAddedItem = {
                "slug": slug,
                "Unit": newItemUnit,
                "Description": newItemDescription,
                "Unit Price": 0
            }
            addItemToCategory($selectedCategory, newAddedItem);
            showAddItem = false;
            newItemDescription = '';
            newItemUnit = '';
        }
    }

</script>

<style>

</style>
<!-- Inventory Form -->
<div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
    {#if showAddItem}
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style="z-index: 9999">
            <!-- Modal Container -->
            <div class="bg-white rounded-lg shadow-lg w-96">
                <!-- Modal Header -->
                <div class="px-4 py-3 border-b flex justify-between items-center">
                    <h2 class="text-lg font-semibold">Add Item</h2>
                    <button class="text-gray-500 hover:text-gray-700" on:click={() => showAddItem = false}>
                        ✖
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-4">
                    <div class="h-20 py-4">
                        <label for="newItemDescription" class="block text-gray-700 text-sm font-bold mb-2">Name/Description</label>
                        <input
                                required
                                id="newItemDescription"
                                type="text"
                                bind:value={newItemDescription}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-4 py-3 border-t flex justify-end">
                    <button class="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2"
                            on:click={addNewItemToList}>
                        Add
                    </button>
                    <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            on:click={() => showAddItem = false}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    {/if}
    {#if showAddBrand}
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style="z-index: 9999">
            <!-- Modal Container -->
            <div class="bg-white rounded-lg shadow-lg w-96">
                <!-- Modal Header -->
                <div class="px-4 py-3 border-b flex justify-between items-center">
                    <h2 class="text-lg font-semibold">Add Brand</h2>
                    <button class="text-gray-500 hover:text-gray-700" on:click={() => showAddBrand = false}>
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
                                bind:value={newBrand}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-4 py-3 border-t flex justify-end">
                    <button class="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2"
                            on:click={addNewBrand}>
                        Add
                    </button>
                    <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            on:click={() => showAddBrand = false}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    {/if}
    <h2 class="text-xl font-semibold text-gray-800 my-2">
        Project Cost Estimate</h2>
    <div>
        <div class="flex flex-wrap items-start gap-4">

            <!-- Category -->
            <div class="relative flex-1 min-w-[160px]">
                <select
                        id="category"
                        bind:value={$selectedCategory}
                        class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled selected hidden></option>
                    {#each categories as category}
                        <option value="{category}">{category}</option>
                    {/each}
                </select>
                <label for="category"
                       class="absolute left-3 top-2 text-gray-500 text-sm transition-all
                    peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500
                    peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400">
                    Category
                </label>
            </div>

            <!-- Quantity -->
            <div class="relative flex-1 min-w-[160px]">
                <input
                        id="quantity"
                        type="number"
                        min="1"
                        bind:value={$quantity}
                        on:input={(e) => quantity.set(Number(e.target.value))}
                        placeholder=" "
                        class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label for="quantity" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                    Quantity
                </label>
            </div>

            <!-- Unit -->
            <div class="relative flex-1 min-w-[160px]">
                <input
                        id="unit"
                        type="text"
                        bind:value={$unit}
                        placeholder=" "
                        class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label for="unit" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                    Unit
                </label>
            </div>

            <!-- Item -->
            <div class="relative flex-1 min-w-[160px]">
                <select
                        id="item"
                        bind:value={$selectedItem}
                        disabled={!$selectedCategory}
                        class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                    <option value="" disabled selected hidden></option>
                    {#each $items as item}
                        <option value="{item.slug}">{item.Description}</option>
                    {/each}
                </select>
                <label for="item"
                       class="absolute left-3 top-2 text-gray-500 text-sm flex items-center gap-2 transition-all
                    peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500
                    peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400">
                    Item
                    {#if $selectedCategory !== ''}
                        <button
                                type="button"
                                class="ml-2 font-bold text-xs bg-green-700 text-green-200 px-2 py-1 rounded"
                                on:click={() => showAddItem = true}>
                            Add
                        </button>
                    {/if}
                </label>
            </div>

            <!-- Wire Type (conditional) -->
            {#if $selectedCategory === "Wire and Cable"}
                <div class="relative flex-1 min-w-[160px]">
                    <select
                            id="wireType"
                            bind:value={selectedWireType}
                            class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                        <option value="" disabled selected hidden></option>
                        {#each wireTypes as item}
                            <option value="{item}">{item}</option>
                        {/each}
                    </select>
                    <label for="wireType"
                           class="absolute left-3 top-2 text-gray-500 text-sm transition-all
                      peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500
                      peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400">
                        Wire Type
                    </label>
                </div>
            {/if}

            <!-- Brand -->
            <div class="relative flex-1 min-w-[160px]">
                <select
                        id="brand"
                        bind:value={$selectedBrand}
                        class="peer w-full bg-white border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled selected hidden></option>
                    {#each $brands as brand}
                        <option value="{brand}">{brand}</option>
                    {/each}
                </select>
                <label for="brand"
                       class="absolute left-3 top-2 text-gray-500 text-sm flex items-center gap-2 transition-all
                    peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500
                    peer-[value='']:top-4 peer-[value='']:text-base peer-[value='']:text-gray-400">
                    Brand
                    <button
                            type="button"
                            class="ml-2 font-bold text-xs bg-green-700 text-green-200 px-2 py-1 rounded"
                            on:click={() => showAddBrand = true}>
                        Add
                    </button>
                </label>
            </div>

            <!-- Unit Price -->
            <div class="relative flex-1 min-w-[160px]">
                <input
                        id="unitPrice"
                        type="number"
                        min="1"
                        bind:value={unitPrice}
                        placeholder=" "
                        class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label for="unitPrice" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                    Unit Price
                </label>
            </div>
        </div>

        <!-- Add Item Button -->
        <div class="my-3">
            <button
                    type="button"
                    on:click={addItem}
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all">
                Add Item
            </button>
        </div>
    </div>

    <!-- Inventory Table -->
    <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-200 mt-6">

        <!-- Adjustments -->
        <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-200 mt-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Project Cost Adjustments</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Labor Input -->
                <div class="flex flex-col">
                    <label for="labor" class="text-sm font-medium text-gray-700 mb-1">Labor (%)</label>
                    <input id="labor" type="number" step="0.01" min="0" max="100" bind:value={$laborPercentage}

                           class="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md px-3 py-2 text-gray-700">
                </div>

                <!-- Logistics Input -->
                <div class="flex flex-col">
                    <label for="logistics" class="text-sm font-medium text-gray-700 mb-1">Logistics Cost (₱)</label>
                    <input id="logistics" type="number" step="0.01" min="0" bind:value={$logisticsCost}
                           on:input={(e) => logisticsCost.set(Number(e.target.value))}
                           class="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md px-3 py-2 text-gray-700">
                </div>
            </div>
        </div>

        <h2 class="text-lg font-semibold text-gray-800 mb-3">Inventory Summary</h2>

        <!-- Check if inventory has items -->
        {#if Object.keys($materialsInventory).length > 0}
            <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-300">
                    <thead class="bg-gray-100">
                    <tr>
                        <th class="border border-gray-300 px-4 py-2">Quantity</th>
                        <th class="border border-gray-300 px-4 py-2">Unit</th>
                        <th class="border border-gray-300 px-4 py-2">Description</th>
                        <th class="border border-gray-300 px-4 py-2">Unit Price</th>
                        <th class="border border-gray-300 px-4 py-2">Subtotal</th>
                        <th class="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each Object.entries($materialsInventory) as [category, items]}
                        <!-- Category Row (Full-Width) -->
                        <tr class="bg-gray-200 text-gray-900 font-semibold">
                            <td colspan="7" class="px-4 py-2 border border-gray-300">{category}</td>
                        </tr>

                        <!-- Item Rows -->
                        {#each items as item, index}
                            <tr class="text-gray-700">
                            <tr class="text-gray-700">
                                <td class="border border-gray-300 px-4 py-2">{item.Quantity}</td>
                                <td class="border border-gray-300 px-4 py-2">{item.Unit}</td>
                                <td class="border border-gray-300 px-4 py-2">{item.Description} {item.Brand}</td>
                                <td class="border border-gray-300 px-4 py-2">₱{formatNumber(item["Unit Price"])}</td>
                                <td class="border border-gray-300 px-4 py-2">₱{formatNumber(item.Subtotal)}</td>
                                <td class="border border-gray-300 px-4 py-2 text-center">
                                    <button
                                            on:click={() => removeItem(category, index)}
                                            class="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1 rounded-md transition-all">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    {/each}
                    </tbody>
                </table>
            </div>

            <!-- Cost Breakdown -->
            <div class="mt-4 text-gray-800">
                <p class="text-lg font-semibold">Inventory Base Cost: <span
                        class="font-normal">₱{formatNumber($totalInventoryCost)}</span></p>
                <p class="text-lg font-semibold">Materials Cost: <span
                        class="font-normal">₱{formatNumber($materialsCost)}</span></p>
                <p class="text-lg font-semibold">Labor Cost: <span
                        class="font-normal">₱{formatNumber($laborCost)}</span></p>
                <p class="text-lg font-semibold">Logistics Cost: <span
                        class="font-normal">₱{formatNumber($logisticsCost)}</span></p>
                <p class="text-xl font-bold mt-2">Total Project Cost: <span
                        class="text-blue-600">₱{formatNumber($totalProjectCost)}</span></p>
            </div>
        {:else}
            <p class="text-gray-600">No inventory items added.</p>
        {/if}
    </div>


</div>