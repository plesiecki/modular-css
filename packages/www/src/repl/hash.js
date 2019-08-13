import fs from "fs";

import lz from "lznext";

import files from "./stores/files.js";

// Grab initial state from location.hash, or create it from nothing
const setup = async () => {
    const hash = location.hash.substring(1);

    try {
        const data = JSON.parse(
            lz.decompressFromEncodedURIComponent(hash)
        );

        data.forEach(([ file, css ]) => {
            files.add(file, css);
        });
    } catch(e) {
        if(hash.length) {
            // eslint-disable-next-line no-console
            console.warn("Unable to parse hash:", e);
        }

        const initial = "/main.css";

        const { prompt } = import("./data/prompt.js");

        files.add(initial, prompt);
    }
};

// Update location.hash with fs state
files.subscribe((names) => {
    const hash = [ ...names.values() ].map((value) => ([
        value,
        fs.readFileSync(value, "utf8"),
    ]));

    location.hash = lz.compressToEncodedURIComponent(JSON.stringify(hash));
});


setup();
