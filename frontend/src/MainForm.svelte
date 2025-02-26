<script>
    import Header from "./components/Header.svelte";
    import BasicForm from "./components/BasicForm.svelte";
    import SpecForm from "./components/SpecForm.svelte";
    import LoadSpecsTable from "./components/LoadSpecsTable.svelte"; // This can now be removed
    import SidePanel from "./components/SidePanel.svelte";
    import CsvDataTable from "./components/CsvDataTable.svelte";
    import MaterialsInventory from './components/MaterialsInventory.svelte';


    import {
        showConsole,
        showCsvTable,
        showLoadSpecs,
        showMaterialsInventory,
        showSpecForm,
        statusMessage
    } from "./stores/uiStore"; // Import statusMessage and showLoadSpecs/showSpecForm
    import {systemPhaseType} from "./stores/dataStore";
    import {csvData} from "./stores/derivedStore";

    // Function to get the appropriate CSS class based on message type
    function getStatusClass(type) {
        switch (type) {
            case 'info':
                return 'bg-blue-100 border-blue-500 text-blue-700';
            case 'warning':
                return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case 'error':
                return 'bg-red-100 border-red-500 text-red-700';
            default:
                return ''; // No specific styling
        }
    }


    function closeErrorModal() {
        statusMessage.set({text: null, type: null});
    }
    function handleGoBack() {
        showMaterialsInventory.set(false);
    }
</script>

<div class="flex flex-col h-screen">
    <Header/>

    <div class="flex flex-1 bg-gray-200 overflow-auto">
        <main class="{`transition-all h-full duration-500 ${$showConsole ? 'w-2/3' : 'w-full'}`}">
            {#if $showMaterialsInventory}
                <MaterialsInventory on:goBack={handleGoBack}/>
            {:else}

                <BasicForm/>
                <div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
                    {#if $showSpecForm}
                        <SpecForm/>
                    {/if}

                    {#if $showLoadSpecs}
                        <LoadSpecsTable/>
                    {/if}

                    {#if $showCsvTable}
                        <CsvDataTable csvData={$csvData} systemPhaseType={$systemPhaseType}/>
                    {/if}
                </div>
            {/if}
        </main>

        {#if $showConsole}
            <aside class="transition-all h-full duration-500 bg-white w-1/3">
                <SidePanel/>
            </aside>
        {/if}
    </div>

    <!--{#if $statusMessage.text}-->
    <!--    <footer class="sticky bottom-0 p-4 {getStatusClass($statusMessage.type)} border-t">-->
    <!--        <p>{$statusMessage.text}</p>-->
    <!--    </footer>-->
    <!--{/if}-->
    {#if $statusMessage.text}
        {#if $statusMessage.type === 'error'}
            <!-- Locking Modal for Errors -->
            <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div class="bg-white p-6 rounded shadow-lg max-w-lg">
                    <h2 class="text-red-600 text-lg font-bold">Error</h2>
                    <p>{$statusMessage.text}</p>
                    <button on:click={closeErrorModal} class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Close
                    </button>
                </div>
            </div>
        {:else}
            <!-- Normal Sticky Footer for Other Statuses -->
            <footer class="sticky bottom-0 p-4 {getStatusClass($statusMessage.type)} border-t">
                <p>{$statusMessage.text}</p>
            </footer>
        {/if}
    {/if}
</div>