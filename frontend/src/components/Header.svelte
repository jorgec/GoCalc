<script>
    import {projectName} from "../stores/dataStore";
    import {showConsole, showCsvTable, showLoadSpecs, showMaterialsInventory, statusMessage} from "../stores/uiStore";
    import LoadProjectModal from "./LoadProjectModal.svelte";
    import SaveProjectModal from "./SaveProjectModal.svelte";


    let showLoadModal = false; // Control modal visibility
    let showSaveModal = false;

    function openLoadModal() {
        showLoadModal = true;
    }

    function closeLoadModal() {
        showLoadModal = false;
    }

    function openSaveModal() {
        if (!$projectName) {
            statusMessage.set({text: "Project Name cannot be empty!", type: 'error'});
            return;
        }
        showSaveModal = true;
    }

    function closeSaveModal() {
        showSaveModal = false;
    }

    let showInventory = false;

    function toggleInventory() {
        showMaterialsInventory.update(v => !v);
    }

</script>

<header
        id="header"
        class="flex items-center bg-gray-800 h-14 sticky top-0 z-50 px-4"
>
    <div class="flex-1">
        <h1 class="text-white">GoCalc</h1>
    </div>

    <div class="flex flex-1 justify-center">
        <input
                type="text"
                id="projectName"
                bind:value={$projectName}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter Project Name"
        />
    </div>

    <div class="flex-1 flex justify-end items-center gap-2">
        <button on:click={toggleInventory}
                class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                <path d="M14.7 6.3a3.3 3.3 0 0 0-4.7 0L4 12.3V16h3.7l6-6a3.3 3.3 0 0 0 0-4.7z"></path>
                <path d="M16 3l5 5-2 2-5-5z"></path>
            </svg>
        </button>
        {#if !$showMaterialsInventory}
            <button
                    class="bg-orange-500 hover:bg-orange-700 text-white p-2 rounded"
                    on:click={() => showLoadSpecs.update(v => !v)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 14v4h4l11-11-4-4-11 11zm3 2h-1v-1l10-10 1 1-10 10zm11.5-11.5l1.5-1.5-1-1-1.5 1.5 1 1z"/>
                </svg>
            </button>

            <button
                    class="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded"
                    on:click={() => showCsvTable.update(v => !v)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 4.5c-5 0-9 4.5-9 4.5s4 4.5 9 4.5 9-4.5 9-4.5-4-4.5-9-4.5zm0 7.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>

            </button>
        {/if}

        <button
                on:click={openSaveModal}
                class="bg-green-500 hover:bg-green-700 text-white p-2 rounded inline-flex items-center"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18v-14l-4-4h-14zm12 1.5l3.5 3.5h-3.5v-3.5zm-9 0h8v6h-8v-6zm0 9h10v6h-10v-6z"/>
            </svg>
        </button>

        <button class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded inline-flex items-center"
                on:click={openLoadModal}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2h8l6 6v12h-14v-18zm7 1v6h6m-11 8l4-4m0 0l4 4m-4-4v8"/>
            </svg>
        </button>

        <button
                id="sideToggle"
                class="bg-gray-200 hover:bg-gray-400 text-black p-2 rounded inline-flex items-center"
                on:click={() => showConsole.update(v => !v)}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>

        </button>


    </div>
</header>
{#if showLoadModal}
    <LoadProjectModal on:close={closeLoadModal}/>
{/if}

{#if showSaveModal}
    <SaveProjectModal on:close={closeSaveModal}/>
{/if}