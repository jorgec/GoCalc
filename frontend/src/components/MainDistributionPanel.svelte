<script>

    import {currentPanelBoard, panelBoardCollations, panelBoardList, volts} from "../stores/dataStore.js";
    import {get} from "svelte/store";
    import {loadSpecificationsFromPanelboard} from "../utils/mutators.js";

    const panelBoards = get(panelBoardList);
    for (let i = 0; i < panelBoards.length; i++) {
        loadSpecificationsFromPanelboard(i);
    }
    currentPanelBoard.set(0);

    console.log($panelBoardCollations);

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
                {$panelBoardCollations.va[i]}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {$volts}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {$panelBoardCollations.a[i]}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {$panelBoardCollations.wireRecommendation[i].wiresize_metric}
                ({$panelBoardCollations.wireRecommendation[i].wiresize_awg}) {$panelBoardCollations.wire[i]}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {#if $panelBoardCollations.conduit[i] === "PVC"}
                    {$panelBoardCollations.wireRecommendation[i].conduitsize_metric_pvc}
                    ({$panelBoardCollations.wireRecommendation[i].conduitsize_imperial_pvc}) Ø {$panelBoardCollations.conduit[i]} pipe
                {:else}
                    {$panelBoardCollations.wireRecommendation[i].conduitsize_metric_rmc}
                    ({$panelBoardCollations.wireRecommendation[i].conduitsize_imperial_rmc}) Ø {$panelBoardCollations.conduit[i]} pipe
                {/if}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {$panelBoardCollations.wireRecommendation[i].branch_AT}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                {$volts}
            </td>
            <td class="border border-gray-300 px-4 py-2">
                2
            </td>
            <td class="border border-gray-300 px-4 py-2">
                10
            </td>
            <td class="border border-gray-300 px-4 py-2">
                MCCB
            </td>
        </tr>
    {/each}


    </tbody>
</table>

<style>

</style>