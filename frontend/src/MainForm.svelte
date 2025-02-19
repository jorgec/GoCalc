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

    function handleGoBack() {
        showMaterialsInventory.set(false);
    }
</script>

<div class="flex flex-col h-screen">
    <Header/>
    {#if $showMaterialsInventory}
        <MaterialsInventory on:goBack={handleGoBack}/>
    {:else}
        <div class="flex flex-1 bg-gray-200 overflow-auto">
            <main class="{`transition-all h-full duration-500 ${$showConsole ? 'w-2/3' : 'w-full'}`}">
                <div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
                    <BasicForm/>

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
            </main>

            {#if $showConsole}
                <aside class="transition-all h-full duration-500 bg-white w-1/3">
                    <SidePanel/>
                </aside>
            {/if}
        </div>
    {/if}
    {#if $statusMessage.text}
        <footer class="sticky bottom-0 p-4 {getStatusClass($statusMessage.type)} border-t">
            <p>{$statusMessage.text}</p>
        </footer>
    {/if}
</div>