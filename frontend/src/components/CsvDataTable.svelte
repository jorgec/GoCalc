<script>
    import { wireData } from "../utils/calculations";

    export let csvData;
    export let systemPhaseType;

    $: headers = generateHeaders(systemPhaseType);

    function generateHeaders(phase) {
        let baseHeaders = [
            "CRKTno",
            "Load",
            "Ratings",
            "Volt Ampere",
            "Volts",
            "WireSizeAndType", // Combined header
            "ConduitSize",
        ];

        if (phase === 0) {
            baseHeaders.splice(5, 0, "AmpLoadSingle");
        } else {
            baseHeaders.splice(5, 0, "AmpLoadAB", "AmpLoadBC", "AmpLoadCA", "AmpLoadABC");
        }
        return baseHeaders;
    }

    function formatHeader(header) {
        // return header.replace(/([A-Z])/g, ' $1').trim();
        return header;
    }
</script>

<div class="overflow-x-auto">
    {#if csvData && csvData.length > 0}
        <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
            <tr>
                {#each headers as header}
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        {formatHeader(header)}
                    </th>
                {/each}
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
            {#each csvData as row}
                <tr>
                    {#each headers as header}
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                            {#if header === 'Load'}
                                {@html row[header].replace(/;/g, '<br>')}
                            {:else}
                                {row[header] ?? ''}
                            {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
            </tbody>
        </table>
    {:else}
        <p>No load specifications added yet.</p>
    {/if}

</div>