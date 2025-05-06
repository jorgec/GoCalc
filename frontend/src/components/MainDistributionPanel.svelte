<script>

    import {currentPanelBoard, panelBoardCollations, panelBoardList, volts} from "../stores/dataStore.js";
    import {get} from "svelte/store";
    import {loadSpecificationsFromPanelboard} from "../utils/mutators.js";
    import {formatWithCommas} from "../utils/misc.js";
    import {mainDistributionCalculations} from "../utils/calculations.js";

    let _current;
    let panelBoards;
    let sums;

    function init() {
        _current = get(currentPanelBoard);
        panelBoards = get(panelBoardList);
        for (let i = 0; i < panelBoards.length; i++) {
            loadSpecificationsFromPanelboard(i);
        }
        currentPanelBoard.set(_current);
        sums = mainDistributionCalculations();
        console.log("##########sums##############");
        console.log(sums);
        console.log("##########panelBoardCollations##############");
        console.log($panelBoardCollations);
    }

    init();
</script>


<h2 class="text-xl font-semibold text-gray-800">Main Distribution Panel</h2>

<table class="min-w-full table-auto border border-gray-300">
    <thead>
    <tr class="bg-gray-100">
        <th rowspan="2" class="border border-gray-300 px-4 py-2 text-left align-middle">Panelboard</th>
        <th rowspan="2" class="border border-gray-300 px-4 py-2 text-left align-middle">VA</th>
        <th rowspan="2" class="border border-gray-300 px-4 py-2 text-left align-middle">V</th>
        <th rowspan="2" class="border border-gray-300 px-4 py-2 text-left align-middle">A</th>
        <th rowspan="2" class="border border-gray-300 px-4 py-2 text-left align-middle">Wire</th>
        <th rowspan="2" class="border border-gray-300 px-4 py-2 text-left align-middle">Conduit</th>
        <th colspan="5" class="border border-gray-300 px-4 py-2 text-center">Branch Circuit Protection</th>
    </tr>
    <tr class="bg-gray-50">
        <th class="border border-gray-300 px-4 py-2 text-left">AT</th>
        <th class="border border-gray-300 px-4 py-2 text-left">V</th>
        <th class="border border-gray-300 px-4 py-2 text-left">P</th>
        <th class="border border-gray-300 px-4 py-2 text-left">KAIC</th>
        <th class="border border-gray-300 px-4 py-2 text-left">Type</th>
    </tr>
    </thead>
    <tbody>

    {#each panelBoards as panel, i}
        <tr class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-2">
                {panel}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                <code>{formatWithCommas($panelBoardCollations.va[i])}</code>
            </td>
            <td class="border border-gray-300 px-4 py-2">
                <code>{$volts}</code>
            </td>
            <td class="border border-gray-300 px-4 py-2">
                <code>{formatWithCommas($panelBoardCollations.a[i])}</code>
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {#if $panelBoardCollations.wireRecommendation.length > 0 && $panelBoardCollations.wireRecommendation[i]}
                    {$panelBoardCollations.wireRecommendation[i].wiresize_metric}
                    ({$panelBoardCollations.wireRecommendation[i].wiresize_awg}) {$panelBoardCollations.wire[i]}
                {/if}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {#if $panelBoardCollations.wireRecommendation.length > 0 && $panelBoardCollations.wireRecommendation[i]}
                    {#if $panelBoardCollations.conduit[i] === "PVC"}
                        {$panelBoardCollations.wireRecommendation[i].conduitsize_metric_pvc}
                        ({$panelBoardCollations.wireRecommendation[i].conduitsize_imperial_pvc}) Ø {$panelBoardCollations.conduit[i]} pipe
                    {:else}
                        {$panelBoardCollations.wireRecommendation[i].conduitsize_metric_rmc}
                        ({$panelBoardCollations.wireRecommendation[i].conduitsize_imperial_rmc}) Ø {$panelBoardCollations.conduit[i]} pipe
                    {/if}
                {/if}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                <code>
                {#if $panelBoardCollations.wireRecommendation.length > 0 && $panelBoardCollations.wireRecommendation[i]}
                    {$panelBoardCollations.wireRecommendation[i].branch_AT}
                {/if}
                </code>
            </td>
            <td class="border border-gray-300 px-4 py-2">
                <code>{$volts}</code>
            </td>
            <td class="border border-gray-300 px-4 py-2">
                <code>2</code>
            </td>
            <td class="border border-gray-300 px-4 py-2">
                <code>10</code>
            </td>
            <td class="border border-gray-300 px-4 py-2">
                MCCB
            </td>
        </tr>
    {/each}
    </tbody>
    <tfoot>
        <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">TOTAL</th>
            <th class="border border-gray-300 px-4 py-2 text-left">
                <code>
                    {formatWithCommas(sums.totalVA)}
                </code>
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left"></th>
            <th class="border border-gray-300 px-4 py-2 text-left">
                <code>
                    {formatWithCommas(sums.totalA)}
                </code>
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left" colspan="7"></th>
        </tr>
        <tr>
            <th class="border border-gray-300 px-4 py-2 text-left font-normal" colspan="4">
                <strong>Computation @ 80% Demand Factor</strong>
                <hr class="border-t border-gray-300" />
                <code>
                    I = [{sums.totalVA} + (25% * {sums.getMaxLoad} * 80%)]/{get(volts)} = <strong>{formatWithCommas(sums.ifl)} A</strong>
                </code>
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left font-normal" colspan="7">
                <code>
                    I = {sums.totalA} * 125% = <strong>{formatWithCommas(sums.i)} A</strong>
                </code>
                <hr class="border-t border-gray-300" />
                USE: 2 - {sums.wireRecommendation} wires and {sums.conduitRecommendation} conduits
                <hr class="border-t border-gray-300" />
                1-{sums.at} AT, 2P, 230 V, 10 KAIC for Overcurrent Protection
            </th>
        </tr>
    </tfoot>
</table>
<div class="h-20 py-4">
    <div class="my-4 p-2 px-3">
        <button
                type="button"
                class="bg-gray-600 hover:bg-gray-800 text-gray-200 hover:text-white p-2 rounded"
                on:click|preventDefault={init}
        >
            Refresh Calculations
        </button>
    </div>
</div>

<style>

</style>