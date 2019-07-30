import fs from "fs";

import { writable } from "svelte/store";

import processor from "./processor.js";

const set = new Set();

const files = writable(set);

const add = (name, data = "") => {
    let idx = set.size;

    if(!name) {
        do {
            idx++;
            name = `/file${idx}.css`;
        } while(set.has(name));
    }

    set.add(name);

    fs.writeFileSync(name, data, "utf8");

    processor.file(name);

    // Trigger downstream updates
    files.set(set);
};

const remove = (name) => {
    set.delete(name);

    processor.remove(name);

    fs.unlinkSync(name);

    files.set(set);
};

export default files;

export { add, remove };
