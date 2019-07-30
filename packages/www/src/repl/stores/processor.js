import path from "path";

import Processor from "@modular-css/processor";

const processor = new Processor({
    cwd : "/",

    // Custom file resolver to work around gaps in fake node environment
    resolvers : [
        (src, file) => path.resolve(`/${file}`),
    ],
});

export default processor;
