<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<h1>Discovered Fixtures</h1>
<button on:click={() => invalidateAll()}>Refresh</button>
<table>
    <thead>
        <tr>
            <th></th>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Version</th>
            <th>Serial</th>
            <th>IP</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each data.fixtures as fixture}
            <tr>
                <td>{fixture.connected ? "✔ Connected" : ""}</td>
                <td>{fixture.manufacturer}</td>
                <td>{fixture.model}</td>
                <td>{fixture.version}</td>
                <td>{fixture.serial}</td>
                <td>{fixture.ip}</td>
                <td>
                    {#if !fixture.connected}
                        <form use:enhance action="?/connect" method="post">
                            <input type="hidden" name="ip" value={fixture.ip} />
                            <button type="submit">Connect</button>
                        </form>
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
