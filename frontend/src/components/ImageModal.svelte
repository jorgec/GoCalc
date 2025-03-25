<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<div class="overlay" on:click={() => dispatch('close')}>
    <div class="modal" on:click|stopPropagation>
        <slot />
        <button on:click={() => dispatch('close')}>Close</button>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    }

    .modal {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
    }

    button {
        margin-top: 1rem;
    }
</style>