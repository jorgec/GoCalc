<script>
    import {onMount} from 'svelte';
    import {brands, inventory, materialDictionary, totalInventoryCost,  laborPercentage, logisticsCost, materialsCost, laborCost, totalProjectCost } from '../stores/materialInventoryStore';
    import {writable} from 'svelte/store';

    // Form state
    const selectedCategory = writable('');
    const selectedItem = writable('');
    const selectedBrand = writable('');
    const quantity = writable(1);

    // Extract category names from materialDictionary
    let categories = [];
    let items = [];

    onMount(() => {
        categories = Object.keys(materialDictionary);
    });

    // Update items dropdown based on selected category
    $: if ($selectedCategory) {
        items = materialDictionary[$selectedCategory] || [];
    }

    // Function to format numbers with commas
    function formatNumber(value) {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    }

    // Computed Unit Price from store
    let unitPrice = 0;
    $: if ($selectedCategory && $selectedItem) {
        const selectedItemDetails = items.find(item => item.slug === $selectedItem);
        unitPrice = selectedItemDetails ? Number(selectedItemDetails["Unit Price"]) : 0;
    }

    // Function to remove an item from inventory
    function removeItem(category, itemIndex) {
        inventory.update(inv => {
            inv[category].splice(itemIndex, 1); // Remove item at index

            // If category is empty after removal, delete it
            if (inv[category].length === 0) {
                delete inv[category];
            }

            return { ...inv };
        });
    }

    // Function to add item to inventory
    function addItem() {
        if ($selectedCategory === '' || $selectedItem === '' || $selectedBrand === '' || $quantity <= 0){
            alert("Please fill in all fields.");
            return;
        }

        let selectedItemDetails = items.find(item => item.slug === $selectedItem);
        if (!selectedItemDetails) return;

        const subtotal = unitPrice * Number($quantity); // Compute Subtotal

        const newItem = {
            slug: selectedItemDetails.slug,
            Unit: selectedItemDetails.Unit,
            Description: selectedItemDetails.Description,
            "Unit Price": unitPrice.toFixed(2), // Use stored price
            Brand: $selectedBrand,
            Quantity: Number($quantity),
            Subtotal: subtotal.toFixed(2)
        };

        inventory.update(inv => {
            const category = $selectedCategory;
            if (!inv[category]) {
                inv[category] = [];
            }
            inv[category].push(newItem);
            return {...inv};
        });

        selectedItem.set('');
        selectedBrand.set('');
        quantity.set(1);
    }
</script>

<style>

</style>
<!-- Inventory Form -->
<div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">Add New Inventory Item</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Category Dropdown -->
        <div class="h-20 py-4">
            <label for="category" class="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select id="category" bind:value={$selectedCategory}
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="" disabled selected>Select Category</option>
                {#each categories as category}
                    <option value="{category}">{category}</option>
                {/each}
            </select>
        </div>

        <!-- Items Dropdown (Depends on Category) -->
        <div class="h-20 py-4">
            <label for="item" class="block text-gray-700 text-sm font-bold mb-2">Item</label>
            <select id="item" bind:value={$selectedItem}
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-gray-100"
                    disabled={!$selectedCategory}>
                <option value="" disabled selected>Select Item</option>
                {#each items as item}
                    <option value="{item.slug}">{item.Description}</option>
                {/each}
            </select>
        </div>

        <!-- Brand Dropdown -->
        <div class="h-20 py-4">
            <label for="brand" class="block text-gray-700 text-sm font-bold mb-2">Brand</label>
            <select id="brand" bind:value={$selectedBrand}
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="" disabled selected>Select Brand</option>
                {#each brands as brand}
                    <option value="{brand}">{brand}</option>
                {/each}
            </select>
        </div>

        <!-- Quantity Input -->
        <div class="h-20 py-4">
            <label for="quantity" class="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
            <input id="quantity" type="number" bind:value={$quantity} min="1"
                   on:input={(e) => quantity.set(Number(e.target.value))}
                   class="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md px-3 py-2 text-gray-700">
        </div>
        <div class="h-20 py-4 flex">
            <button on:click={addItem}
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all">
                Add Item
            </button>
        </div>
    </div>

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

    <!-- Inventory Table -->
    <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-200 mt-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Inventory Summary</h2>

        <!-- Check if inventory has items -->
        {#if Object.keys($inventory).length > 0}
            <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-300">
                    <thead class="bg-gray-100">
                    <tr>
                        <th class="border border-gray-300 px-4 py-2">Item</th>
                        <th class="border border-gray-300 px-4 py-2">Brand</th>
                        <th class="border border-gray-300 px-4 py-2">Unit</th>
                        <th class="border border-gray-300 px-4 py-2">Unit Price</th>
                        <th class="border border-gray-300 px-4 py-2">Quantity</th>
                        <th class="border border-gray-300 px-4 py-2">Subtotal</th>
                        <th class="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each Object.entries($inventory) as [category, items]}
                        <!-- Category Row (Full-Width) -->
                        <tr class="bg-gray-200 text-gray-900 font-semibold">
                            <td colspan="7" class="px-4 py-2 border border-gray-300">{category}</td>
                        </tr>

                        <!-- Item Rows -->
                        {#each items as item, index}
                            <tr class="text-gray-700">
                            <tr class="text-gray-700">
                                <td class="border border-gray-300 px-4 py-2">{item.Description}</td>
                                <td class="border border-gray-300 px-4 py-2">{item.Brand}</td>
                                <td class="border border-gray-300 px-4 py-2">{item.Unit}</td>
                                <td class="border border-gray-300 px-4 py-2">₱{formatNumber(item["Unit Price"])}</td>
                                <td class="border border-gray-300 px-4 py-2">{item.Quantity}</td>
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
                <p class="text-lg font-semibold">Materials Cost: <span class="font-normal">₱{formatNumber($materialsCost)}</span></p>
                <p class="text-lg font-semibold">Labor Cost: <span class="font-normal">₱{formatNumber($laborCost)}</span></p>
                <p class="text-lg font-semibold">Logistics Cost: <span class="font-normal">₱{formatNumber($logisticsCost)}</span></p>
                <p class="text-xl font-bold mt-2">Total Project Cost: <span class="text-blue-600">₱{formatNumber($totalProjectCost)}</span></p>
            </div>
        {:else}
            <p class="text-gray-600">No inventory items added.</p>
        {/if}
    </div>

</div>