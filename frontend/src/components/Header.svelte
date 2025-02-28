<script>
    import {projectDate, projectInCharge, projectLocation, projectName, projectOwner} from "../stores/dataStore";
    import {showConsole, showCsvTable, showLoadSpecs, showMaterialsInventory, statusMessage} from "../stores/uiStore";
    import LoadProjectModal from "./LoadProjectModal.svelte";
    import SaveProjectModal from "./SaveProjectModal.svelte";
    import {intentionToClose} from "../stores/uiStore.js";


    let showLoadModal = false; // Control modal visibility
    let showSaveModal = false;

    function clearStatus() {
        if ($statusMessage.type === 'info') {
            statusMessage.set({text: '', type: ''})
        }
        return false;
    }

    function showStatus(msg) {
        statusMessage.set({text: msg, type: 'info'});
    }

    function openLoadModal() {
        showLoadModal = true;
    }

    function closeLoadModal() {
        showLoadModal = false;
    }

    function openSaveModal() {
        if(intentionToClose){
            showSaveModal = true;
        }else{
            if (!$projectName || !$projectDate || !$projectLocation || !$projectOwner || !$projectInCharge) {
                statusMessage.set({text: "Fill up all project details at the top", type: 'error'});
                return;
            }
            showSaveModal = true;
        }
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
    <div class="flex-[1]">
        <h1 class="text-white">LoadCalc</h1>
    </div>

    <div class="flex flex-[3] justify-center">
        <input
                type="text"
                id="projectName"
                bind:value={$projectName}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                placeholder="Name"
        />
        <input
                type="date"
                id="projectDate"
                bind:value={$projectDate}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
        />
        <input
                type="text"
                id="projectLocation"
                bind:value={$projectLocation}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                placeholder="Location"
        />
        <input
                type="text"
                id="projectOwner"
                bind:value={$projectOwner}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                placeholder="Owner"
        />
        <input
                type="text"
                id="projectInCharge"
                bind:value={$projectInCharge}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                placeholder="In-Charge"
        />
    </div>

    <div class="flex-[1] flex justify-end items-center gap-2">
        <a on:click={toggleInventory}
           href="#!"
           title="Inventory Management"
           on:mouseenter={() => showStatus('Inventory Management')}
           on:mouseleave={clearStatus}
           class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-5 9 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z M9 22V12h6v10"/>
            </svg>
        </a>
        {#if !$showMaterialsInventory}
            <button
                    class="bg-orange-500 hover:bg-orange-700 text-white p-2 rounded"
                    on:click={() => showLoadSpecs.update(v => !v)}
                    on:mouseenter={() => showStatus('Load Definitions')}
                    on:mouseleave={clearStatus}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <!-- Outline of the spreadsheet -->
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <!-- Horizontal grid lines -->
                    <line x1="3" y1="8" x2="21" y2="8"/>
                    <line x1="3" y1="13" x2="21" y2="13"/>
                    <!-- Vertical grid lines -->
                    <line x1="8" y1="3" x2="8" y2="21"/>
                    <line x1="13" y1="3" x2="13" y2="21"/>
                </svg>
            </button>

            <button
                    class="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded"
                    on:click={() => showCsvTable.update(v => !v)}
                    on:mouseenter={() => showStatus('Load Table')}
                    on:mouseleave={clearStatus}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 4.5c-5 0-9 4.5-9 4.5s4 4.5 9 4.5 9-4.5 9-4.5-4-4.5-9-4.5zm0 7.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>

            </button>
        {/if}

        <button
                on:click={openSaveModal}
                on:mouseenter={() => showStatus('Save Project')}
                on:mouseleave={clearStatus}
                class="bg-green-500 hover:bg-green-700 text-white p-2 rounded inline-flex items-center"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18v-14l-4-4h-14zm12 1.5l3.5 3.5h-3.5v-3.5zm-9 0h8v6h-8v-6zm0 9h10v6h-10v-6z"/>
            </svg>
        </button>

        <button class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded inline-flex items-center"
                on:click={openLoadModal}
                on:mouseenter={() => showStatus('Load Project')}
                on:mouseleave={clearStatus}
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
                on:mouseenter={() => showStatus('Calculations')}
                on:mouseleave={clearStatus}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>

        </button>
        <button
                id="closeApp"
                class="bg-red-600 hover:bg-red-400 text-white py-2 px-4 rounded inline-flex items-center"
                on:mouseenter={() => showStatus('Exit Project')}
                on:click={() => {
                        $intentionToClose = true;
                        openSaveModal();
                    }
                }
        >
            X

        </button>

    </div>
</header>
{#if showLoadModal}
    <LoadProjectModal on:close={closeLoadModal}/>
{/if}

{#if showSaveModal}
    <SaveProjectModal on:close={closeSaveModal}/>
{/if}