<CodeMirror bind:this={codemirror}/>

<script>
import fs from "fs";

import { onMount } from "svelte";

import store from "./store.js";
import listen from "./listen.js";

import CodeMirror from "./codemirror.svelte";

export let data = false;

let codemirror;

onMount(() => {
    listen(this.store, "file", ({ file }) => {
        let content;

        try {
            content = fs.readFileSync(file, "utf8");
        } catch(e) {
            content = "";
        }

        codemirror.input({ content });
    });
    
    codemirror.on("change", ({ content }) => {
        const { file } = this.store.get();

        this.store.update(file, content);
    });
    
    // Mark text in the editor when an error occurs
    listen(this.store, "error", ({ error }) => {
        const { file } = this.get();

        if(!error || error.file !== file) {
            return;
        }

        codemirror.error({ error });
    });
});
</script>
