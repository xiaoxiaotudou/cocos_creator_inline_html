System.register([], function (_export, _context) {
    "use strict";

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function createApplication(_ref) {
      var loadJsListFile = _ref.loadJsListFile,
          fetchWasm = _ref.fetchWasm;
      // NOTE: before here we shall not import any module!
      var promise = Promise.resolve();
      promise = promise.then(function () {
          return topLevelImport('wait-for-ammo-instantiation');
      }).then(function (_ref2) {
        var waitForAmmoInstantiation = _ref2["default"];
        return waitForAmmoInstantiation(fetchWasm(''));
      });
      return promise.then(function () {
        return _defineProperty({
          start: start
        }, 'import', topLevelImport);
      });

      function getAsset(url) {
        var data = window.resMap[url].split("base64,");
        var mine = data[0]
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
          onComplete(null, bundle)
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
          ".ttf":loadFont,
          ".ccon": loadAnimation,
          ".cconb": loadAnimation,
          ".mp3": loadAudio,
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

      function start(_ref4) {
        var findCanvas = _ref4.findCanvas;
        var settings;
        var cc;
        return Promise.resolve().then(function () {
          return topLevelImport('cc');
        }).then(function (engine) {
          cc = engine;
          overrideLoader();
          return loadSettingsJson(cc);
        }).then(function () {
          settings = window._CCSettings;
          return initializeGame(cc, settings, findCanvas).then(function () {
            if (!settings.renderPipeline) return cc.game.run();
          }).then(function () {
            if (settings.scriptPackages) {
              return loadModulePacks(settings.scriptPackages);
            }
          }).then(function () {
            return loadJsList(settings.jsList);
          }).then(function () {
            return loadAssetBundle(settings.hasResourcesBundle, settings.hasStartSceneBundle);
          }).then(function () {
            if (settings.renderPipeline) return cc.game.run();
          }).then(function () {
            cc.game.onStart = onGameStarted.bind(null, cc, settings);
            onGameStarted(cc, settings);
          });
        });
      }

      function topLevelImport(url) {
        return _context["import"]("".concat(url));
      }

      function loadAssetBundle(hasResourcesBundle, hasStartSceneBundle) {
        var promise = Promise.resolve();
        var _cc$AssetManager$Buil = cc.AssetManager.BuiltinBundleName,
            MAIN = _cc$AssetManager$Buil.MAIN,
            RESOURCES = _cc$AssetManager$Buil.RESOURCES,
            START_SCENE = _cc$AssetManager$Buil.START_SCENE;
        var bundleRoot = hasResourcesBundle ? [RESOURCES, MAIN] : [MAIN];

        if (hasStartSceneBundle) {
          bundleRoot.push(START_SCENE);
        }

        return bundleRoot.reduce(function (pre, name) {
          return pre.then(function () {
            return loadBundle(name);
          });
        }, Promise.resolve());
      }

      function loadBundle(name) {
        return new Promise(function (resolve, reject) {
          cc.assetManager.loadBundle(name, function (err, bundle) {
            if (err) {
              return reject(err);
            }

            resolve(bundle);
          });
        });
      }

      function loadModulePacks(packs) {
        return Promise.all(packs.map(function (pack) {
          var name = pack.replace("./src/", "");
          var blob = new Blob([window.resMap[name]], { type: "text/plain" });
          return topLevelImport(URL.createObjectURL(blob));
        }));
      }

      function loadJsList(jsList) {
        var promise = Promise.resolve();
        jsList.forEach(function (jsListFile) {
          promise = promise.then(function () {
            return loadJsListFile("src/".concat(jsListFile));
          });
        });
        return promise;
      }

      function loadSettingsJson(cc) {
          return new Promise(function(resolve, reject) {
              window._CCSettings = JSON.parse(window.resMap["settings.json"]);
              window._CCSettings.server = '';
              resolve();
            });
      }
    }

    function initializeGame(cc, settings, findCanvas) {
      if (settings.macros) {
        for (var key in settings.macros) {
          cc.macro[key] = settings.macros[key];
        }
      }

      var gameOptions = getGameOptions(cc, settings, findCanvas);
      var success = cc.game.init(gameOptions);

      try {
        if (settings.customLayers) {
          settings.customLayers.forEach(function (layer) {
            cc.Layers.addLayer(layer.name, layer.bit);
          });
        }
      } catch (error) {
        console.warn(error);
      }

      return success ? Promise.resolve(success) : Promise.reject();
    }

    function onGameStarted(cc, settings) {
      window._CCSettings = undefined;
      cc.view.resizeWithBrowserSize(true);
      var launchScene = settings.launchScene; // load scene

      cc.director.loadScene(launchScene, null, function () {
        cc.view.setDesignResolutionSize(750, 1334, 2);
        console.log("Success to load scene: ".concat(launchScene));
      });
    }

    function getGameOptions(cc, settings, findCanvas) {
      // asset library options
      var assetOptions = {
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server,
        subpackages: settings.subpackages
      };
      var options = {
        debugMode: settings.debug ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
        showFPS: !false && settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
        renderPipeline: settings.renderPipeline,
        adapter: findCanvas('GameCanvas'),
        assetOptions: assetOptions,
        customJointTextureLayouts: settings.customJointTextureLayouts || [],
        physics: settings.physics,
        orientation: settings.orientation,
        exactFitScreen: settings.exactFitScreen
      };
      return options;
    }

    _export("createApplication", createApplication);

    return {
      setters: [],
      execute: function () {}
    };
  });