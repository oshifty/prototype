<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<h2>Discovered Fixtures</h2>

<button on:click={() => invalidateAll()} class="btn">Refresh 🔄</button>
<table>
    <thead>
        <tr>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Version</th>
            <th>Serial</th>
            <th>IP</th>
            <th></th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each data.fixtures as fixture}
            <tr>
                <td>{fixture.manufacturer}</td>
                <td>{fixture.model}</td>
                <td>{fixture.version}</td>
                <td>{fixture.serial}</td>
                <td>{fixture.ip}</td>
                <td>{fixture.connected ? "✅ Connected" : "🕓 Pending"}</td>
                <td>
                    {#if !fixture.connected}
                        <form use:enhance action="?/connect" method="post">
                            <input type="hidden" name="ip" value={fixture.ip} />
                            <button type="submit" class="btn">Connect 🔌</button>
                        </form>
                    {:else}
                        <a class="btn" href="/fixtures/{fixture.ip}">Control 💡</a>
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
