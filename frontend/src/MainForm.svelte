<script>
    import Header from "./components/Header.svelte";
    import BasicForm from "./components/BasicForm.svelte";
    import SpecForm from "./components/SpecForm.svelte";
    import LoadSpecsTable from "./components/LoadSpecsTable.svelte"; // This can now be removed
    import SidePanel from "./components/SidePanel.svelte";
    import CsvDataTable from "./components/CsvDataTable.svelte";
    import MaterialsInventory from './components/MaterialsInventory.svelte';
    import ImageModal from "./components/ImageModal.svelte";
    import {GetStoredHash} from "../wailsjs/go/main/App.js";

    import {
        intentionToClose,
        modalImage,
        showConsole,
        showCsvTable,
        showImageModal,
        showLoadSpecs,
        showMaterialsInventory,
        showSpecForm,
        statusMessage
    } from "./stores/uiStore"; // Import statusMessage and showLoadSpecs/showSpecForm
    import {isUnlocked, systemPhaseType} from "./stores/dataStore";
    import {csvData} from "./stores/derivedStore";
    import {sumCsvData} from "./utils/calculations";
    import {recalcHP} from "./utils/mutators.js";
    import {onMount} from "svelte";
    import {AllowClose} from "../wailsjs/go/main/App.js";

    $: if ($csvData) {
        sums = sumCsvData($csvData);
    }

    $: sums = sumCsvData($csvData);

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

    $: if ($systemPhaseType !== undefined && $systemPhaseType !== null) {
        recalcHP($systemPhaseType);
        sums = sumCsvData($csvData);
    }

    let authError = null;
    let password = '';

    async function authCheck() {
        const pwCheck = await compareHash(password);
        if(! pwCheck){
            authError = "Invalid password";
        }else{
            authError = null;
            isUnlocked.set(true);
        }
    }

    async function compareHash(submittedPassword) {
        if (!storedHash) {
            authError = "No stored hash available for comparison!";
            return false;
        }

        // Encode and hash the submitted password using Web Crypto
        const encoder = new TextEncoder();
        const data = encoder.encode(submittedPassword);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Compare to the stored hash from the server
        return hashHex === storedHash;
    }

    let storedHash = "";

    onMount(async () => {
        try {
            storedHash = await GetStoredHash();
            console.log("Retrieved stored hash: ", storedHash);
        } catch (err) {
            authError = "Error retrieving stored hash:" +  err;
        }
    });

    $: if ($modalImage !== null) {
        showImageModal.set(true);
    }

    function closeModal(){
        showImageModal.set(false);
        modalImage.set(null);
    }

</script>

<div class="flex flex-col h-screen">
    {#if $isUnlocked}
        {#if $showImageModal && $modalImage}
            <ImageModal on:close={closeModal}>
                <img src={$modalImage} alt="{$modalImage}" style="max-width: 100%;"/>
            </ImageModal>
        {/if}
        <Header/>

        <div class="flex flex-1 bg-gray-200 overflow-auto">
            <main class="{`transition-all h-full duration-500 ${$showConsole ? 'w-2/3' : 'w-full'}`}">
                {#if $showMaterialsInventory}
                    <MaterialsInventory on:goBack={handleGoBack}/>
                {:else}

                    <BasicForm/>
                    <div class="container-fluid mx-auto px-4 mb-2 bg-gray-200">
                        {#if $showSpecForm}
                            <div class="bg-gray-100 border border-gray-300  py-0 px-4 shadow-sm">
                                <SpecForm/>
                            </div>
                        {/if}

                        {#if $showLoadSpecs}
                            <LoadSpecsTable/>
                        {/if}

                        {#if $showCsvTable}
                            <CsvDataTable csvData={$csvData} systemPhaseType={$systemPhaseType} sums={sums}/>
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
                <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                     style="z-index: 99999">
                    <div class="bg-white p-6 rounded shadow-lg max-w-lg">
                        <h2 class="text-red-600 text-lg font-bold">Error</h2>
                        <p>{$statusMessage.text}</p>
                        <button on:click={closeErrorModal}
                                class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
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
    {:else}
        <div class="h-screen w-screen bg-gray-100 flex items-center justify-center">

            <form class="bg-white p-8 rounded shadow-md w-full max-w-sm flex flex-col items-center space-y-6">
                <h1 class="text-2xl font-medium text-gray-900">Enter Password</h1>

                {#if authError}
                    <p class="w-full text-sm text-red-600 min-h-[1.25rem]">
                        {authError}
                    </p>
                {/if}

                <!-- Floating label container -->
                <div class="relative w-full">
                    <input
                            type="password"
                            bind:value={password}
                            id="password"
                            placeholder=" "
                            required
                            class="rounded peer w-full px-4 pt-5 pb-2 text-base border border-gray-300  placeholder-transparent focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    <label for="password" class="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600">
                        Password
                    </label>
                </div>

                <div class="grid grid-cols-2 gap-4 w-full">
                    <button
                            type="button"
                            on:click={authCheck}
                            class="rounded py-2 px-4 bg-blue-400 hover:bg-blue-700 text-white font-medium  shadow-md hover:shadow-lg transition duration-200"
                    >
                        Submit
                    </button>

                    <button
                            type="button"
                            on:click={() => {
                AllowClose();
                window.close();
            }}
                            class="rounded py-2 px-4 bg-red-400 hover:bg-red-700 text-white font-medium  shadow-md hover:shadow-lg transition duration-200"
                    >
                        Exit
                    </button>
                </div>
            </form>

        </div>
    {/if}
</div>