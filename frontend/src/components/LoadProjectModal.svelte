<script>
    import {createEventDispatcher} from 'svelte';
    import {loadProjectData} from '../utils/mutators'; // Import
    import {LoadJSONFile} from '../../wailsjs/go/main/App.js';


    const dispatch = createEventDispatcher();

    let projectDataJson = ''; // Store the JSON input
    let errorMessage = '';

    function handleLoad() {
        errorMessage = ''; // Clear any previous errors
        try {
            const parsedData = JSON.parse(projectDataJson); // Parse the JSON
            loadProjectData(parsedData); // Call loadProjectData (in mutators.js)
            dispatch('close'); // Close the modal
        } catch (error) {
            errorMessage = `Invalid JSON: ${error.message}`; // Display error
        }
    }

    function handleCancel() {
        dispatch('close');
    }
    async function handleOpenFile() {
        try {
            projectDataJson = await LoadJSONFile();
        } catch (err) {
            console.error("Failed to read file:", err);
        }
    }
</script>

<div class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Load Project from JSON
                        </h3>
                        <div class="mt-2">
              <textarea
                      bind:value={projectDataJson}
                      placeholder="Paste project JSON here"
                      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
                      rows="10"
              ></textarea>
                            {#if errorMessage}
                                <p class="text-red-500 text-sm mt-2">{errorMessage}</p>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                        type="button"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={handleOpenFile}
                >
                    Load from File
                </button>
                {#if projectDataJson !== ""}
                <button
                        type="button"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={handleLoad}
                >
                    Parse
                </button>
                {/if }
                <button
                        type="button"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>