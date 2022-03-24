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
let FILE_MAPPING = {};
const compile = function (output) {
    init(output);
    let index = readFile(`${__dirname}/template/index.html`);
    index = index.replace('{#css}', readFile(`${OUTPUT_PATH}/style.css`));
    index = index.replace('{#polyfills}', complieFile([
        `${OUTPUT_PATH}/src/polyfills.bundle.js`,
        `${OUTPUT_PATH}/src/system.bundle.js`,
    ]));
    let scripts = [], mapping = {};
    compileEngine(scripts);
    complieAssets(scripts, mapping);
    compileProject(scripts, mapping);
    index = index.replace("{#resource}", `window.resMap=${JSON.stringify(mapping)}`);
    index = index.replace("{#main}", scripts.join(''));
    fs_1.default.writeFileSync(`${OUTPUT_PATH}/index.html`, index);
    console.log('<--------- success --------->');
};
exports.compile = compile;
function init(output) {
    OUTPUT_PATH = output;
    FILE_MAPPING["\.\/application.js"] = "application";
    FILE_MAPPING["application.js"] = "application";
    FILE_MAPPING["\.\/index.js"] = "index";
    FILE_MAPPING["index.js"] = "index";
    const dirs = fs_1.default.readdirSync(`${OUTPUT_PATH}/cocos-js`);
    dirs.forEach(dir => {
        const stat = fs_1.default.statSync(`${OUTPUT_PATH}/cocos-js/${dir}`);
        if (stat.isFile()) {
            FILE_MAPPING[`\.\/${dir}`] = dir.replace(".js", "");
            FILE_MAPPING[`${dir}`] = dir.replace(".js", "");
        }
    });
}
function compileEngine(scripts) {
    const dirs = fs_1.default.readdirSync(`${OUTPUT_PATH}/cocos-js`);
    dirs.forEach(dir => {
        const stat = fs_1.default.statSync(`${OUTPUT_PATH}/cocos-js/${dir}`);
        if (stat.isFile()) {
            if (!dir.startsWith('bullet.wasm')) {
                let script = readFile(`${OUTPUT_PATH}/cocos-js/${dir}`).replace(`System.register(`, `System.register('${dir}',`);
                scripts.push(complieFile(null, resolveScript(script)));
            }
            else {
                const asset = fs_1.default.readdirSync(`${OUTPUT_PATH}/cocos-js/assets`)[0];
                const buffer = fs_1.default.readFileSync(`${OUTPUT_PATH}/cocos-js/assets/${asset}`);
                const script = `System.register('${dir}', [],(function(e,t){"use strict";return{execute:function(){var binary_string=window.atob("${buffer.toString("base64")}");var len=binary_string.length;var bytes=new Uint8Array(len);for(var i=0;i<len;i++){bytes[i]=binary_string.charCodeAt(i)}var blob=new Blob([bytes],{type:"${mime_types_1.default.lookup(`${OUTPUT_PATH}/cocos-js/assets/${asset}`)}"});e("default",URL.createObjectURL(blob))}}}));`;
                scripts.push(complieFile(null, resolveScript(script)));
            }
        }
    });
}
function complieAssets(scripts, mapping) {
    const dirs = fs_1.default.readdirSync(`${OUTPUT_PATH}/assets`);
    dirs.forEach(dir => {
        scripts.push(readFile(`${OUTPUT_PATH}/assets/${dir}/index.js`));
        compileResource(`${OUTPUT_PATH}/assets/${dir}`, mapping);
    });
}
function compileProject(scripts, mapping) {
    let index = readFile(`${OUTPUT_PATH}/index.js`).replace(`System.register(`, `System.register('index.js',`);
    let application = readFile(`${OUTPUT_PATH}/application.js`).replace(`System.register(`, `System.register('application.js',`);
    scripts.push(resolveScript(index));
    scripts.push(resolveScript(resolveApplication(application)));
    mapping["settings.json"] = readFile(`${OUTPUT_PATH}/src/settings.json`);
    mapping["chunks/bundle.js"] = readFile(`${OUTPUT_PATH}/src/chunks/bundle.js`);
}
function resolveApplication(application) {
    return application
        .replace(`return loadSettingsJson(cc);`, readFile(`${__dirname}/template/application.js`))
        .replace(`return topLevelImport(pack);`, `var name = pack.replace("./src/", "");var blob = new Blob([window.resMap[name]], { type: "text/plain" });return topLevelImport(URL.createObjectURL(blob));`);
}
function resolveScript(content) {
    Object.keys(FILE_MAPPING).forEach(key => {
        const pattern = new RegExp(`/${key}/g`);
        content = content.replace(key, FILE_MAPPING[key]);
    });
    return content;
}
function readFile(path) {
    return fs_1.default.readFileSync(path, { encoding: "utf-8" });
}
function complieFile(path, content = null) {
    let file = '';
    if (path && 'string' === typeof path) {
        file = readFile(path);
    }
    else if (Array.isArray(path)) {
        path.forEach(v => {
            file += readFile(v);
        });
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
        eval(pako.inflate(bytes, { to: 'string' }));`;
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
