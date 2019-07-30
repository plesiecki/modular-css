<link href="./output.css" />

<div class="{css.output}">
    <CodeMirror config={cmconfig} bind:this={codemirror} />
</div>

<script>
import { onMount } from "svelte";

import store from "./store.js";
import listen from "./listen.js";
import CodeMirror from "./codemirror.svelte";

const header = "/* CSS OUTPUT */";

const cmconfig = {
    readOnly : true,
};

let codemirror;

onMount(() => {
    // Default to just the header
    codemirror.input({ content : header });

    // Then update whenever the store values change
    listen(this.store, [ "css", "compositions" ], ({ css, compositions }) => {
        codemirror.input({
            content : [
                header,
                css,
                "",
                "/* CLASS COMPOSITIONS */",
                "/**",
                JSON.stringify(compositions, null, 4),
                "**/",
            ].join("\n")
        });
    });
});
</script>
