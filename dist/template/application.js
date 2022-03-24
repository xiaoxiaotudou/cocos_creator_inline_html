function getAsset(url) {
    var data = window.resMap[url].split("base64,");
    var mine = data[0];
    var base64 = data[1];
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    var blob = new Blob([bytes], {
        type: mine
    });
    return {
        url: URL.createObjectURL(blob),
        mine
    };
}
function overrideLoader() {
    let ccLoadImage = cc.assetManager.downloader._downloaders[".png"];
    function loadImage(url, options, onComplete) {
        const asset = getAsset(url);
        options.xhrMimeType = asset.mine;
        ccLoadImage(asset.url, options, onComplete);
    }
    function loadBundle(url, options, onComplete) {
        let bundle = JSON.parse(window.resMap[url + "/config.json"]);
        onComplete(null, bundle);
    }
    let ccLoadJson = cc.assetManager.downloader._downloaders[".json"];
    function loadJson(url, options, onComplete) {
        const asset = getAsset(url);
        options.xhrMimeType = asset.mine;
        ccLoadJson(asset.url, options, onComplete);
    }
    function loadFont(url, options, onComplete) {
        const ttfIndex = url.lastIndexOf(".ttf");
        const slashPos = url.lastIndexOf("/");
        const fontFamily = url.substring(slashPos + 1, ttfIndex) + "_LABEL";
        let style = document.createElement("style");
        style.type = "text/css";
        style.textContent = `
      @font-face {
        font-family: "${fontFamily}";
        src: url('${window.resMap[url]}') format("truetype");
      }
    `;
        document.head.appendChild(style);
        let preloadDiv = document.createElement("div");
        let divStyle = preloadDiv.style;
        divStyle.fontFamily = fontFamily;
        preloadDiv.innerHTML = ".";
        divStyle.position = "absolute";
        divStyle.left = "-100px";
        divStyle.top = "-100px";
        document.body.appendChild(preloadDiv);
        onComplete(null, fontFamily);
    }
    let ccLoadPlist = cc.assetManager.downloader._downloaders[".plist"];
    function loadPlist(url, options, onComplete) {
        const asset = getAsset(url);
        options.xhrMimeType = asset.mine;
        ccLoadPlist(asset.url, options, onComplete);
    }
    const ccLoadcconb = cc.assetManager.downloader._downloaders[".cconb"];
    function loadAnimation(url, options, onComplete) {
        const asset = getAsset(url);
        options.xhrMimeType = asset.mine;
        ccLoadcconb(asset.url, options, onComplete);
    }
    const ccLoadAudio = cc.assetManager.downloader._downloaders[".mp3"];
    function loadAudio(url, options, onComplete) {
        const asset = getAsset(url);
        options.xhrMimeType = asset.mine;
        ccLoadAudio(asset.url, options, onComplete);
    }
    const ccLoadBin = cc.assetManager.downloader._downloaders[".bin"];
    function loadBin(url, options, onComplete) {
        const asset = getAsset(url);
        options.xhrMimeType = asset.mine;
        ccLoadBin(asset.url, options, onComplete);
    }
    const ccLoadText = cc.assetManager.downloader._downloaders[".txt"];
    function loadText(url, options, onComplete) {
        const asset = getAsset(url);
        options.xhrMimeType = asset.mine;
        ccLoadText(asset.url, options, onComplete);
    }
    cc.assetManager.downloader.register({
        "bundle": loadBundle,
        ".json": loadJson,
        ".png": loadImage,
        ".jpg": loadImage,
        ".bmp": loadImage,
        ".jpeg": loadImage,
        ".gif": loadImage,
        ".ico": loadImage,
        ".plist": loadPlist,
        ".ttf": loadFont,
        ".ccon": loadAnimation,
        ".cconb": loadAnimation,
        ".mp3": loadAudio,
        ".wav": loadAudio,
        ".binary": loadBin,
        ".bin": loadBin,
        ".dbbin": loadBin,
        ".skel": loadBin,
        ".pvr": loadBin,
        ".pkm": loadBin,
        ".astc": loadBin,
        ".txt": loadText,
        ".xml": loadText,
        ".vsh": loadText,
        ".fsh": loadText,
        ".atlas": loadText,
        ".tmx": loadText,
        ".tsx": loadText,
        ".plist": loadText,
    });
}
overrideLoader();
return new Promise(function (resolve, reject) {
    window._CCSettings = JSON.parse(window.resMap["settings.json"]);
    window._CCSettings.server = '';
    resolve();
});
