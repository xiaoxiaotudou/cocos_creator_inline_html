import { IBuildTaskOption, BuildHook, IBuildResult } from '../@types';
import { compile } from './compile';

interface IOptions {
    commonTest1: number;
    commonTest2: 'opt1' | 'opt2';
    webTestOption: boolean;
}

const PACKAGE_NAME = 'cocos-build-template';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'cocos-plugin-template': IOptions;
    };
}

let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
};

export const onAfterBuild: BuildHook.onAfterBuild = async function(options, result) {
    const { inlineHtml } = options['packages']['inline-html'];
    if (inlineHtml) {
        const { dest } = result;
        compile(dest);
    }
};

export const unload: BuildHook.unload = async function() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};
