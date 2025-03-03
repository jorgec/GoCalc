<script>
    import {formatWithCommas} from "../utils/misc.js";

    export let sums;
    export let csvData;
    export let systemPhaseType;

    $: headers = generateHeaders(systemPhaseType);
    $: ampLoadTotals = generateLoadTotals(systemPhaseType);

    function generateHeaders(phase) {
        let baseHeaders = [
            "CRKTno",
            "Load",
            "Convenience Outlet",
            "Volt Ampere",
            "Volts",
            "Sa",
            "Sab",
            "Sabc",
            "Three Gang",
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
    function generateLoadTotals(phase){
        if(phase === 0){
            return [sums.ampLoadSingle];
        }else{
            return [
                sums.ampLoadAB,
                sums.ampLoadBC,
                sums.ampLoadCA,
                sums.ampLoadABC,
            ];
        }
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
            <tfoot>
                <tr>
                    {#each headers as header}
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                            {formatHeader(header)}
                        </th>
                    {/each}
                </tr>
                <tr>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm bold text-gray-900" colspan="3">Totals</td>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900">{formatWithCommas(sums.voltAmpere)}</td>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900"></td>
                    {#each ampLoadTotals as ampLoadTotal}
                        <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900">{formatWithCommas(ampLoadTotal)}</td>
                    {/each}
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900">{sums.sa}</td>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900">{sums.sab}</td>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900">{sums.sabc}</td>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900">{sums.threeGang}</td>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900"></td>
                    <td class="py-3.5 pl-4 pr-3 text-left text-sm  font-mono text-gray-900"></td>
                </tr>
            </tfoot>
        </table>
    {:else}
        <p>No load specifications added yet.</p>
    {/if}

</div>