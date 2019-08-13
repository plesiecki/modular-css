import fs from "fs";

import { writable } from "svelte/store";

import processor from "../processor.js";

const set = new Set();

const files = writable(set);

const add = async (name, data = "") => {
    let idx = set.size;

    if(!name) {
        do {
            idx++;
            name = `/file${idx}.css`;
        } while(set.has(name));
    }

    set.add(name);

    fs.writeFileSync(name, data, "utf8");

    await processor.file(name);

    // Trigger downstream updates
    files.set(set);
};

const remove = (name) => {
    set.delete(name);

    processor.remove(name);

    fs.unlinkSync(name);

    files.set(set);
};

const clear = () => {
    set.forEach(remove);

    set.clear();

    files.set(set);
};

const update = async (name, data = "") => {
    fs.writeFileSync(name, data, "utf8");

    if(processor.has(name)) {
        processor.invalidate(name);
    }

    try {
        await processor.file(name);
    } catch(error) {
        // eslint-disable-next-line no-console
        console.warn(`Error parsing "${error.file}"`, error);

        // TODO: how do I report errors?
        // this.set({ error });
    }

    files.set(set);
};

export default files;

export { add, remove, clear, update };
