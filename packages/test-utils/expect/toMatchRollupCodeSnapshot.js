"use strict";

const { toMatchSnapshot } = require("jest-snapshot");

expect.extend({
    toMatchRollupCodeSnapshot({ output }) {
        const chunks = new Map();

        output.forEach(({ isAsset, name, code }) => {
            if(isAsset) {
                return;
            }

            chunks.set(name, `\n${code}`);
        });

        const out = Object.create(null);
        
        // Ensure out object is in a consistent order
        [ ...chunks.keys() ].sort().forEach((key) => {
            out[key] = chunks.get(key);
        });

        return toMatchSnapshot.call(
            this,
            out,
        );
    },
});
