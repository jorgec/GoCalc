<!-- src/components/Header.svelte -->
<script>
    import { SaveJSON } from "../../wailsjs/go/main/App.js";
    import { projectName, loadSpecifications } from "../stores/dataStore";
    import { showConsole } from "../stores/uiStore";
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
        <!-- Save button -->
        <button
                on:click={() => SaveJSON($projectName, $loadSpecifications)}
                class="bg-green-500 hover:bg-green-700 text-white p-2 rounded inline-flex items-center"
        >
            <!-- EXACT Save icon from original code -->
            <svg
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
            >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3v18h18V9l-6-6H3zm9 13a2 2 0
             110-4 2 2 0 010 4zm-1-9V3l5 5h-5z"
                />
            </svg>
        </button>

        <!-- Blue button from original code -->
        <button class="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded inline-flex items-center">
            <svg
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
            >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 21h6V11l-3-3-3 3v10zm0
             0V11l-3 3m3-3l3 3m-6 0h6"
                />
            </svg>
        </button>

        <!-- Toggle console button -->
        <button
                id="sideToggle"
                class="bg-gray-200 hover:bg-gray-400 text-black p-2 rounded inline-flex items-center"
                on:click={() => showConsole.update(v => !v)}
        >
            <svg
                    class="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
            >
                <path
                        fill-rule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1
             0 110 2H4a1 1 0 01-1-1zM3 10a1 1
             0 011-1h12a1 1 0 110 2H4a1 1
             0 01-1-1zM3 15a1 1 0 011-1h12a1 1
             0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd"
                />
            </svg>
        </button>
    </div>
</header>