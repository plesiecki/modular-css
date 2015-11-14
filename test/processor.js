"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    Processor = require("../src/processor");

describe("postcss-modular-css", function() {
    describe("processor", function() {
        describe("Basic functionality", function() {
            it("should be a function", function() {
                assert.equal(typeof Processor, "function");
            });
            
            it("should auto-instantiate if called without new", function() {
                /* eslint new-cap:0 */
                assert(Processor() instanceof Processor);
            });
        });

        describe("Functionality", function() {
            beforeEach(function() {
                this.processor = new Processor();
            });

            describe(".string", function() {
                it("should process a string", function() {
                    var result = this.processor.string("./test/specimens/simple.css", ".wooga { }"),
                        file   = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        wooga : [ "361c6a593917072a0083c6531865077d_wooga" ]
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        wooga : [ "361c6a593917072a0083c6531865077d_wooga" ]
                    });

                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.parsed.root.toResult().css, ".361c6a593917072a0083c6531865077d_wooga { }");
                });
            });

            describe(".file", function() {
                it("should process a file", function() {
                    var result = this.processor.file("./test/specimens/simple.css"),
                        file   = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        wooga : [ "1bc1718879cff9694b0f5cc8ad7b7537_wooga" ]
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        wooga : [ "1bc1718879cff9694b0f5cc8ad7b7537_wooga" ]
                    });

                    assert.equal(file.text, ".wooga { color: red; }\n");
                    assert.equal(file.parsed.root.toResult().css, ".1bc1718879cff9694b0f5cc8ad7b7537_wooga { color: red; }\n");
                });
            });
            
            describe("Naming", function() {
                it("should pass prefix through to the plugins", function() {
                    var processor = new Processor({ prefix : "googa" }),
                        result    = processor.string("./test/specimens/simple.css", ".wooga { }"),
                        file      = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        wooga : [ "googa_wooga" ]
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        wooga : [ "googa_wooga" ]
                    });

                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.parsed.root.toResult().css, ".googa_wooga { }");
                });

                it("should pass a namer function through to the plugins", function() {
                    var processor = new Processor({
                            namer : function(filename, selector) {
                                return filename + selector;
                            }
                        }),
                        result = processor.string("./test/specimens/simple.css", ".wooga { }"),
                        file      = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        wooga : [ "test/specimens/simple.csswooga" ]
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        wooga : [ "test/specimens/simple.csswooga" ]
                    });

                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.parsed.root.toResult().css, ".test/specimens/simple.csswooga { }");
                });
            });

            describe("dependencies", function() {
                it("should return the dependencies of the specified file", function() {
                    this.processor.file("./test/specimens/start.css");
                    
                    assert.deepEqual(this.processor.dependencies("test/specimens/start.css"), [
                        "test/specimens/folder/folder.css",
                        "test/specimens/local.css"
                    ]);
                });
                
                it("should return the overall order of dependencies if no file is specified", function() {
                    this.processor.file("./test/specimens/start.css");
                    
                    assert.deepEqual(this.processor.dependencies(), [
                        "test/specimens/folder/folder.css",
                        "test/specimens/local.css",
                        "test/specimens/start.css"
                    ]);
                });
            });
            
            it("should scope classes, ids, and keyframes", function() {
                    var result = this.processor.string("./test/specimens/simple.css", "@keyframes kooga { } #fooga { } .wooga { }"),
                        file   = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        fooga : [ "433a1e5568b4a09c50491d8f1ff70725_fooga" ],
                        kooga : [ "433a1e5568b4a09c50491d8f1ff70725_kooga" ],
                        wooga : [ "433a1e5568b4a09c50491d8f1ff70725_wooga" ]
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        fooga : [ "433a1e5568b4a09c50491d8f1ff70725_fooga" ],
                        kooga : [ "433a1e5568b4a09c50491d8f1ff70725_kooga" ],
                        wooga : [ "433a1e5568b4a09c50491d8f1ff70725_wooga" ]
                    });

                    assert.equal(file.text, "@keyframes kooga { } #fooga { } .wooga { }");
                    assert.equal(
                        file.parsed.root.toResult().css,
                        "@keyframes 433a1e5568b4a09c50491d8f1ff70725_kooga { } " +
                        "#433a1e5568b4a09c50491d8f1ff70725_fooga { } " +
                        ".433a1e5568b4a09c50491d8f1ff70725_wooga { }"
                    );
                });

            it("should walk dependencies into node_modules", function() {
                var result = this.processor.file("./test/specimens/node_modules.css"),
                    file;
                
                assert.deepEqual(result.exports, {
                    booga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ],
                    wooga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ]
                });

                file = result.files["test/specimens/node_modules.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/node_modules.css", "utf8"));
                assert.equal(file.parsed.root.toResult().css, "\n");

                assert.deepEqual(file.compositions, {
                    booga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ],
                    wooga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ]
                });

                file = result.files["test/specimens/node_modules/styles/styles.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/node_modules/styles/styles.css", "utf8"));
                assert.equal(file.parsed.root.toResult().css, ".669ffa9d9ce988eb34ed75f927156773_wooga { color: white; }\n");

                assert.deepEqual(file.compositions, {
                    wooga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ]
                });
            });

            it("should export identifiers and their classes", function() {
                var result = this.processor.file("./test/specimens/start.css"),
                    file;
                
                assert.deepEqual(result.exports, {
                    wooga : [ "f5507abd3eea0987714c5d92c3230347_booga" ],
                    booga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_booga" ],
                    tooga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_tooga" ]
                });

                file = result.files["test/specimens/start.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/start.css", "utf8"));
                assert.equal(
                    file.parsed.root.toResult().css,
                    ".aeacf0c6fbb2445f549ddc0fcfc1747b_booga { color: red; background: blue; }\n" +
                    ".aeacf0c6fbb2445f549ddc0fcfc1747b_tooga { border: 1px solid white; }\n"
                );

                assert.deepEqual(file.values, {
                    folder : "white",
                    one    : "red",
                    two    : "blue"
                });

                assert.deepEqual(file.compositions, {
                    wooga : [ "f5507abd3eea0987714c5d92c3230347_booga" ],
                    booga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_booga" ],
                    tooga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_tooga" ]
                });

                file = result.files["test/specimens/local.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/local.css", "utf8"));
                assert.equal(file.parsed.root.toResult().css, ".f5507abd3eea0987714c5d92c3230347_booga { background: green; }\n");

                assert.deepEqual(file.values, {
                    folder : "white",
                    one    : "red",
                    two    : "blue"
                });

                assert.deepEqual(file.compositions, {
                    booga : [ "f5507abd3eea0987714c5d92c3230347_booga" ],
                    looga : [ "f5507abd3eea0987714c5d92c3230347_booga" ]
                });

                file = result.files["test/specimens/folder/folder.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/folder/folder.css", "utf8"));
                assert.equal(file.parsed.root.toResult().css, ".dafdfcc7dc876084d352519086f9e6e9_folder { margin: 2px; }\n");

                assert.deepEqual(file.values, {
                    folder : "white"
                });
                
                assert.deepEqual(file.compositions, {
                    folder : [ "dafdfcc7dc876084d352519086f9e6e9_folder" ]
                });
            });

            describe(".css()", function() {
                it("should generate css representing the output from all added files", function() {
                    this.processor.file("./test/specimens/start.css");
                    this.processor.file("./test/specimens/node_modules.css");
                    
                    assert.equal(
                        this.processor.css() + "\n",
                        fs.readFileSync("./test/results/processor-output-all.css", "utf8")
                    );
                });

                it("should avoid duplicating files in the output", function() {
                    this.processor.file("./test/specimens/start.css");
                    this.processor.file("./test/specimens/local.css");
                    
                    assert.equal(
                        this.processor.css() + "\n",
                        fs.readFileSync("./test/results/processor-avoid-duplicates.css", "utf8")
                    );
                });

                it("should have rewritten relative URLs based on the `to` option", function() {
                    this.processor.file("./test/specimens/relative.css");
                    
                    assert.equal(
                        this.processor.css({ to : "./test/output/relative.css" }) + "\n",
                        fs.readFileSync("./test/results/processor-relative.css", "utf8")
                    );
                });
            });
            
            describe("bad imports", function() {
                it("should fail if a value imports a non-existant reference", function() {
                    var processor = this.processor;
                    
                    assert.throws(function() {
                        processor.string("./invalid/value.css", "@value not-real from \"../local.css\";");
                    });
                });
                
                it("should fail if a composition imports a non-existant reference", function() {
                    var processor = this.processor;
                    
                    assert.throws(function() {
                        processor.string("./invalid/composition.css", ".wooga { composes: fake from \"../local.css\"; }");
                    });
                });
            });
        });
    });
});