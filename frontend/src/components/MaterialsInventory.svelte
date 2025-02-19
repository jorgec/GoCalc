<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    function goBack() {
        dispatch('goBack');
    }
</script>

<div class="container mx-auto p-4">
    <button on:click={goBack} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back
    </button>

    <h2 class="text-2xl font-bold mb-4">Materials Inventory</h2>

    <p>This is where you'll display and manage your materials inventory.</p>
</div>