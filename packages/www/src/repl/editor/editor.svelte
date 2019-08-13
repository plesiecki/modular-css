<CodeMirror bind:this={codemirror}/>

<script>
import fs from "fs";

import { onMount } from "svelte";

// import store from "./store.js";
// import listen from "./listen.js";

import { update } from "../stores/files.js";
import file from "../stores/file.js";

import CodeMirror from "./codemirror.svelte";

export let data = false;

let codemirror;

onMount(() => {
    file.subscribe((file) => {
        let content;

        try {
            content = fs.readFileSync(file, "utf8");
        } catch(e) {
            content = "";
        }

        codemirror.input({ content });
    });
    
    codemirror.on("change", ({ content }) => {
        update(file, content);
    });
    
    // Mark text in the editor when an error occurs
    // TODO: subscribe to error store, do stuff
    // listen(this.store, "error", ({ error }) => {
    //     const { file } = this.get();

    //     if(!error || error.file !== file) {
    //         return;
    //     }

    //     codemirror.error({ error });
    // });
});
</script>
