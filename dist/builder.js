"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
const load = function () {
    console.debug('inline-html load');
};
exports.load = load;
const unload = function () {
    console.debug('inline-html unload');
};
exports.unload = unload;
exports.configs = {
    'web-mobile': {
        hooks: './hooks',
        options: {
            inlineHtml: {
                label: 'i18n:inline-html.options.inlineHtml',
                render: {
                    ui: 'ui-checkbox'
                }
            }
        }
    },
};
