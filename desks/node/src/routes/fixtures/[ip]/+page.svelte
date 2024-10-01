<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    function updateAttribute(attributeId: number, value: number) {
        fetch(`/fixtures/${data.ip}/api`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ value, attributeId }),
        });
    }
</script>

<a href="/" class="btn">← Back</a>

<h2>Fixture Control</h2>

{#await Promise.all([data.definition, data.currentAttributeValues])}
    <p>Loading...</p>
{:then [definition, currentValues]}
    <ul>
        {#each definition.emitters as emitter}
            <li>
                <h3>{emitter.name}</h3>
                <ul>
                    {#each Object.entries(emitter.attributes) as [id, attribute]}
                        <li>
                            <span>
                                {attribute.name}
                            </span>
                            {#if attribute.type == "boolean"}
                                <input type="checkbox" class="toggle toggle-md" checked={!!currentValues[id]} on:change={(e) => updateAttribute(parseInt(id), e.currentTarget.checked ? 1 : 0)} />
                            {/if}
                        </li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>
{/await}

<div class="collapse collapse-arrow border-base-300 bg-base-200 border">
    <input type="checkbox" />
    <h3 class="collapse-title my-0">Debug Info</h3>
    <div class="collapse-content">
        <h4>Info:</h4>
        {#await data.info}
            <p>Loading...</p>
        {:then info}
            <pre>{JSON.stringify(info, null, 2)}</pre>
        {/await}

        <h4>Definition:</h4>
        {#await data.definition}
            <p>Loading...</p>
        {:then definition}
            <pre>{JSON.stringify(definition, null, 2)}</pre>
        {/await}

        <h4>Current Attribute Values:</h4>
        {#await data.currentAttributeValues}
            <p>Loading...</p>
        {:then currentAttributeValues}
            <pre>{JSON.stringify(currentAttributeValues, null, 2)}</pre>
        {/await}
    </div>
</div>
