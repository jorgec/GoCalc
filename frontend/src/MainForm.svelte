<!-- src/MainForm.svelte -->
<script>
    import Header from "./components/Header.svelte";
    import BasicForm from "./components/BasicForm.svelte";
    import SpecForm from "./components/SpecForm.svelte";
    import LoadSpecsTable from "./components/LoadSpecsTable.svelte";
    import SidePanel from "./components/SidePanel.svelte";

    import { showConsole } from "./stores/uiStore";

    /**
     * In your original code, you had a derived CSV store or
     * code generating CSV data. We'll place that in a derived store
     * named "csvData". If you haven't set it up, replicate your
     * original logic or just remove this debug panel.
     */
    import { csvData } from "./stores/derivedStore";
</script>

<div class="flex flex-col h-screen">
    <!-- Top header area -->
    <Header />

    <div class="flex flex-1 bg-gray-200">
        <!-- Main content area, shrinks to 2/3 if console is open -->
        <main class="{`transition-all h-full duration-500 ${$showConsole ? 'w-2/3' : 'w-full'}`}">
            <div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
                <!-- Basic Occupancy/Phase Form -->
                <BasicForm />

                <!-- Category-based specification Form -->
                <SpecForm />

                <!-- Table of load specs -->
                <LoadSpecsTable />

                <!-- For debugging: show CSV data as JSON -->
                <pre class="mt-4 bg-white p-2 rounded">
{JSON.stringify($csvData, null, 2)}
        </pre>
            </div>
        </main>

        <!-- SidePanel toggled by showConsole -->
        {#if $showConsole}
            <aside class="transition-all h-full duration-500 bg-white w-1/3">
                <SidePanel />
            </aside>
        {/if}
    </div>
</div>

<style>
    /* Minimal styling if needed. Otherwise you can rely on Tailwind. */
</style>