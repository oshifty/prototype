<script lang="ts">
    import "../app.css";
    import { invalidateAll } from "$app/navigation";
    import { io } from "$lib/socket";
    import { onMount } from "svelte";

    onMount(() => {
        io.on("refresh", () => {
            console.log("refresh");
            invalidateAll();
        });
        setTimeout(() => {
            invalidateAll();
        }, 1000);
    });
</script>

<div class="container prose pt-10">
    <h1>SHIFTY Desk - Node Reference Implementation</h1>
    <slot />
</div>

<style>
    .container {
        max-width: 80vw;
    }
</style>
