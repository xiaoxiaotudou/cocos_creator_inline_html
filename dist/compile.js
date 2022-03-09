"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const fs_1 = __importDefault(require("fs"));
const pako_1 = __importDefault(require("pako"));
const mime_types_1 = __importDefault(require("mime-types"));
let OUTPUT_PATH = '';
const compile = function (output) {
    OUTPUT_PATH = output;
    let index = readFile(`${__dirname}/template/index.html`);
    index = index.replace('{#css}', readFile(`${OUTPUT_PATH}/style.css`));
    index = index.replace("{#polyfills}", complieFile(`${OUTPUT_PATH}/src/polyfills.bundle.js`));
    index = index.replace("{#system}", complieFile(`${OUTPUT_PATH}/src/system.bundle.js`));
    index = index.replace("{#engine}", complieFile(null, readFile(`${OUTPUT_PATH}/cocos-js/cc.js`).replace("System.register([]", `System.register("cc", []`)));
    let mapping = {
        'settings.json': readFile(`${OUTPUT_PATH}/src/settings.json`),
        'chunks/bundle.js': readFile(`${OUTPUT_PATH}/src/chunks/bundle.js`)
    }, scripts = '';
    const dirs = fs_1.default.readdirSync(`${OUTPUT_PATH}/assets`);
    dirs.forEach(dir => {
        compileResource(`${OUTPUT_PATH}/assets/${dir}`, mapping);
        scripts += readFile(`${OUTPUT_PATH}/assets/${dir}/index.js`);
    });
    index = index.replace("{#resource}", `window.resMap=${JSON.stringify(mapping)}`);
    index = index.replace("{#main}", scripts);
    index = index.replace("{#application}", complieFile(`${__dirname}/template/application.js`));
    index = index.replace("{#index}", complieFile(`${__dirname}/template/index.js`));
    fs_1.default.writeFileSync(`${OUTPUT_PATH}/index.html`, index);
    console.log('<--------- success --------->');
};
exports.compile = compile;
function readFile(path) {
    return fs_1.default.readFileSync(path, { encoding: "utf-8" });
}
function complieFile(path, content = null) {
    let file;
    if (path) {
        file = readFile(path);
    }
    else if (content) {
        file = content;
    }
    else {
        console.log("path or content is required!!!");
        return;
    }
    const compress = pako_1.default.deflate(file, { to: 'string' });
    const base64 = Buffer.from(compress).toString("base64");
    return `
        var compress = window.atob("${base64}", "base64");
        var bytes = new Uint8Array(compress.length);
        for (let i = 0; i < compress.length; i++) {
            bytes[i] = compress.charCodeAt(i);
        }
        var file = pako.inflate(bytes, { to: 'string' });
        var script = document.createElement("script");
        script.type = "text/javascript";
        try {
            script.appendChild(document.createTextNode(file));
        } catch (error) {
            script.text = file;
        }
        document.body.appendChild(script);`;
}
function compileResource(path, mapping) {
    const files = fs_1.default.readdirSync(path);
    files.forEach(fileName => {
        const absolutePath = `${path}/${fileName}`;
        const stat = fs_1.default.statSync(absolutePath);
        if (stat.isFile() && !fileName.includes('index.js') && !fileName.includes("config.json")) {
            const data = fs_1.default.readFileSync(absolutePath);
            if (data) {
                const relativePath = absolutePath.replace(`${OUTPUT_PATH}/assets/`, "");
                mapping[relativePath] = `data:${mime_types_1.default.lookup(relativePath)};base64,${Buffer.from(data).toString("base64")}`;
            }
        }
        else if (stat.isFile()) {
            const relativePath = absolutePath.replace(`${OUTPUT_PATH}/assets/`, "");
            mapping[relativePath] = readFile(absolutePath);
        }
        if (stat.isDirectory()) {
            compileResource(absolutePath, mapping);
        }
    });
}
