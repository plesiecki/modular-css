<link href="./tabs.css" />

<div class="{css.tabs}">
    <button
        class="{css.add}"
        title="Add a new file"
        on:click={() => $store.add()}
    >
        ➕
    </button>
    
    <div class="{css.tabs}">
        {#each [ ...$store.files.values() ] as file (file)}
        <div class="{$store.file === file ? css.tabon : css.tab}">
            <button
                class="{css.file}"
                on:click={() => $store.set({ file })}
            >
                {file}
            </button>

            {#if $store.files.size > 1}
                <button
                    class="{css.remove}"
                    title="Remove {file}"
                    on:click={() => $store.remove(file)}
                >
                    ❌
                </button>
            {/if}
        </div>
        {/each}
    </div>

    <button
        class="{css.clear}"
        title="Remove all files & content"
        on:click={() => $store.reset({ content : `` })}
    >
        🗑️
    </button>
</div>

<script>
import store from "./store.js";

</script>
