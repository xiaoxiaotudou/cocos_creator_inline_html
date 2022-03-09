
import { BuildPlugin } from '../@types';

export const load: BuildPlugin.load = function() {
    console.debug('inline-html load');
};

export const unload: BuildPlugin.load = function() {
    console.debug('inline-html unload');
};

export const configs: BuildPlugin.Configs = {
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
