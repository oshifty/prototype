<script lang="ts">
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

<slot />
