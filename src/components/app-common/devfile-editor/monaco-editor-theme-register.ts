import * as Monaco from 'monaco-editor-core/esm/vs/editor/editor.main';

export const DEFAULT_CHE_THEME = 'che';

export const registerCustomThemes = () => {

    // register the white editor theme
    Monaco.editor.defineTheme(DEFAULT_CHE_THEME, {
        base: 'vs', // can also be vs-dark or hc-black
        inherit: true, // can also be false to completely replace the builtin rules
        rules: [
            {
                token: 'string.yaml',
                foreground: '000000'
            }, {
                token: 'comment',
                foreground: '777777'
            }],
        colors: {
            'editor.lineHighlightBackground': '#f0f0f0',
            'editorLineNumber.foreground': '#aaaaaa',
            'editorGutter.background': '#f8f8f8'
        }
    });
};

