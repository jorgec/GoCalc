<script>
    import { createEventDispatcher } from 'svelte';
    import { projectData } from '../stores/derivedStore';
    import {SaveFile} from "../../wailsjs/go/main/App.js";
    import {statusMessage} from "../stores/uiStore.js";

    const dispatch = createEventDispatcher();

    function handleClose() {
        dispatch('close');
    }

    async function handleSaveFile() {
        try {
            const contentToSave = jsonData;
            const savedPath = await SaveFile(contentToSave);

            if (savedPath) {
                statusMessage.set({
                    text: "File saved successfully",
                    type: "success"
                });
            }
        } catch (err) {
            statusMessage.set({
                text: `"Failed to save file: ${err}`,
                type: "error"
            });
            console.error("Failed to save file:", err);
        }
    }

    // Use JSON.stringify to format the data
    $: jsonData = JSON.stringify($projectData, null, 2);

</script>

<div class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Project Data (JSON)
                </h3>
                <div class="mt-2">
          <pre class="overflow-auto max-h-[500px] border rounded p-2 bg-gray-100 text-sm font-mono">
<code>{jsonData}</code>
          </pre>
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {#if jsonData}
                    <button
                            type="button"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            on:click={handleSaveFile}
                    >
                        Save to File
                    </button>
                {/if}
                <button
                        type="button"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        on:click={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
</div>