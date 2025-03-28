<script>
    import {projectDate, projectInCharge, projectLocation, projectName, projectOwner, panelboardName} from "../stores/dataStore";
    import {showConsole, showCsvTable, showLoadSpecs, showMaterialsInventory, statusMessage} from "../stores/uiStore";
    import LoadProjectModal from "./LoadProjectModal.svelte";
    import SaveProjectModal from "./SaveProjectModal.svelte";
    import {intentionToClose} from "../stores/uiStore.js";
    import icon_calculations from "../assets/images/icon_calculations.svg";
    import icon_inventory from "../assets/images/icon_inventory.svg";
    import icon_load_definitions from "../assets/images/icon_load_definitions.svg";
    import icon_load_table from "../assets/images/icon_load_table.svg";
    import icon_settings from "../assets/images/icon_settings.svg";
    import icon_open from "../assets/images/icon_open.svg";
    import icon_save from "../assets/images/icon_save.svg";
    import icon_app from "../assets/images/appicon.png";


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
        if (intentionToClose) {
            showSaveModal = true;
        } else {
            if ($projectName.trim() === '' || !$projectDate || $projectLocation.trim() === '' || $projectOwner.trim() === '' || $projectInCharge.trim() === '' || $panelboardName.trim() === '') {
                statusMessage.set({text: "Fill up all project details at the top", type: 'error'});
                return;
            }
            showSaveModal = true;
        }
    }

    function closeSaveModal() {
        showSaveModal = false;
    }

    function showScheduleOfLoads() {
        showMaterialsInventory.set(false);
    }
    function showInventory(){
        showMaterialsInventory.set(true);
    }

    function toggleInventory() {
        showMaterialsInventory.update(v => !v);
    }

</script>

<header
        id="header"
        class="flex items-center bg-gray-800 h-14 sticky top-0 z-50 px-4"
>
    <div class="flex-[1]">
        <h1 class="text-white text-3xl">Electrical Wiring Simulator</h1>
    </div>
    <div class="flex-[1] flex justify-end items-center gap-2">
        <button
                on:click={showScheduleOfLoads}
                class="flex items-center gap-2 px-4 py-1 rounded shadow-md bg-orange-500 text-white hover:bg-orange-600 transition-colors">
            <img src="{icon_app}" alt="Schedule of Loads" class="w-8 h-8" />
            <span class="text-sm font-medium">Schedule of Loads</span>
        </button>

        <!-- Inventory Button -->
        <button
                on:click={showInventory}
                class="flex items-center gap-2 px-4 py-1 rounded shadow-md bg-teal-500 text-white hover:bg-teal-600 transition-colors">
            <img src="{icon_inventory}" alt="Inventory Icon" class="w-8 h-8" />
            <span class="text-sm font-medium">Inventory</span>
        </button>
    </div>

    <div class="flex-[1] flex justify-end items-center gap-2">

        {#if !$showMaterialsInventory}
            <a
                    href="#!"
                    title="Electrical Load Table"
                    class="w-10 h-10 hover:bg-gray-800"
                    on:click={() => showCsvTable.update(v => !v)}
                    on:mouseenter={() => showStatus('Electrical Load Table')}
                    on:mouseleave={clearStatus}
            >
                <img src="{icon_load_table}" alt="Electrical Load Table">

            </a>
            <a
                    href="#!"
                    on:click={() => showLoadSpecs.update(v => !v)}
                    on:mouseenter={() => showStatus('Electrical Load Definitions')}
                    on:mouseleave={clearStatus}
                    title="Electrical Load Definitions"
                    class="w-10 h-10 hover:bg-gray-800"
            >
                <img src="{icon_load_definitions}" alt="Electrical Load Definitions">

            </a>
            <a
                    id="sideToggle"
                    href="#!"
                    title="Calculations"
                    class="w-10 h-10 hover:bg-gray-800"
                    on:click={() => showConsole.update(v => !v)}
                    on:mouseenter={() => showStatus('Calculations')}
                    on:mouseleave={clearStatus}
            >
                <img src="{icon_calculations}" alt="Calculations"/>

            </a>
            {:else}
            <a
                    id="sideToggle"
                    href="#!"
                    title="Inventory Settings"
                    class="w-10 h-10 hover:bg-gray-800"
                    on:click={() => showConsole.update(v => !v)}
                    on:mouseenter={() => showStatus('Inventory Settings')}
                    on:mouseleave={clearStatus}
            >
                <img src="{icon_settings}" alt="Inventory Settings"/>

            </a>
        {/if}

        <a
                on:click={openSaveModal}
                on:mouseenter={() => showStatus('Save Project')}
                on:mouseleave={clearStatus}
                href="#!"
                title="Save Project"
                class="w-10 h-10 hover:bg-gray-800 ml-6"
        >
            <img src="{icon_save}" alt="Save Project">
        </a>

        <a href="#!"
           title="Load Project"
           class="w-10 h-10 hover:bg-gray-800"
                on:click={openLoadModal}
                on:mouseenter={() => showStatus('Load Project')}
                on:mouseleave={clearStatus}
        >
            <img src="{icon_open}" alt="Load Project">
        </a>


        <button
                id="closeApp"
                class="bg-red-600 hover:bg-red-400 text-white py-2 px-4 rounded-3xl inline-flex items-center"
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
<div class="w-full p-2 bg-gray-800 shadow-lg">
    <form class="flex flex-wrap md:flex-nowrap gap-4">

        <!-- Project Name -->
        <div class="relative flex-1 min-w-[200px]">
            <input
                    type="text"
                    id="projectName"
                    bind:value={$projectName}
                    required
                    placeholder=" "
                    class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <label for="projectName" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                Project Name
            </label>
        </div>

        <!-- Project Date -->
        <div class="relative flex-1 min-w-[200px]">
            <input
                    type="date"
                    id="projectDate"
                    bind:value={$projectDate}
                    required
                    placeholder=" "
                    class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <label for="projectDate" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                Project Date
            </label>
        </div>

        <!-- Location -->
        <div class="relative flex-1 min-w-[200px]">
            <input
                    type="text"
                    id="projectLocation"
                    bind:value={$projectLocation}
                    required
                    placeholder=" "
                    class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <label for="projectLocation" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                Location
            </label>
        </div>

        <!-- Owner -->
        <div class="relative flex-1 min-w-[200px]">
            <input
                    type="text"
                    id="projectOwner"
                    bind:value={$projectOwner}
                    required
                    placeholder=" "
                    class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <label for="projectOwner" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                Owner
            </label>
        </div>

        <!-- In-Charge -->
        <div class="relative flex-1 min-w-[200px]">
            <input
                    type="text"
                    id="projectInCharge"
                    bind:value={$projectInCharge}
                    required
                    placeholder=" "
                    class="peer w-full border border-gray-300 rounded-md px-3 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <label for="projectInCharge" class="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
                In-Charge
            </label>
        </div>

    </form>
</div>
{#if showLoadModal}
    <LoadProjectModal on:close={closeLoadModal}/>
{/if}

{#if showSaveModal}
    <SaveProjectModal on:close={closeSaveModal}/>
{/if}