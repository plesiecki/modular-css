import { writable, derived } from "svelte/store";

import files from "./files.js";

const file = writable(false);

const selected = derived([ file, files ], ([ $file, $files ]) => {
    if(!$files.has($file)) {
        return $files.values().next().value;
    }

    return $file;
});

const select = (name) => file.set(name);

export default selected;

export {
    select,
};
