import * as React from 'react';
import {connect} from 'react-redux';
import {AppState} from '../../../store';
import * as DevfilesRegistry from '../../../store/DevfilesRegistry';
import {BrandingState} from '../../../store/Branding';
import * as monacoConversion from 'monaco-languageclient/lib/monaco-converter';
import * as Monaco from 'monaco-editor-core/esm/vs/editor/editor.main';
import {language, conf} from 'monaco-languages/release/esm/yaml/yaml';
import * as yamlLanguageServer from 'yaml-language-server';
import {registerCustomThemes, DEFAULT_CHE_THEME} from './monaco-theme-register';
import {load, dump} from 'js-yaml';
import * as $ from 'jquery';

import './devfile-editor.styl';

const EDITOR_THEME = DEFAULT_CHE_THEME;
const LANGUAGE_ID = 'yaml';
const YAML_SERVICE = 'yamlService';
const MONACO_CONFIG = {language: 'yaml', wordWrap: 'on', lineNumbers: 'on', matchBrackets: true, readOnly: false};

type Props = { devfilesRegistry: DevfilesRegistry.DevfilesState, branding: { branding: BrandingState } } // Redux store
    & {
    devfile: che.IWorkspaceDevfile,
    onChange?: (devfile: che.IWorkspaceDevfile, isValid: boolean) => void,
    setUpdateEditorCallback?: (Function) => void
};

class DevfileEditor extends React.PureComponent<Props, { errorMessage: string }> {
    private editor: any;
    private yamlService: any;
    private m2p = new monacoConversion.MonacoToProtocolConverter();
    private p2m = new monacoConversion.ProtocolToMonacoConverter();
    private createDocument = model => yamlLanguageServer.TextDocument.create(
        'inmemory://model.yaml',
        model.getModeId(),
        model.getVersionId(),
        model.getValue()
    );

    constructor(props: Props) {
        super(props);

        this.state = {errorMessage: ''};
        if (this.props.setUpdateEditorCallback) {
            this.props.setUpdateEditorCallback(() => {
                if (this.editor) {
                    const doc = this.editor.getModel();
                    doc.setValue(dump(this.props.devfile, {'indent': 1}));
                }
            });
        }
        // lazy initialization
        if (!window[YAML_SERVICE]) {
            // TODO add loading the web worker code in main thread
            this.yamlService = yamlLanguageServer.getLanguageService(() => Promise.resolve(''), {} as any, []);
            window[YAML_SERVICE] = this.yamlService;
        } else {
            this.yamlService = window[YAML_SERVICE];
            return;
        }
        // register the YAML language with Monaco
        Monaco.languages.register({
            id: LANGUAGE_ID,
            extensions: ['.yaml', '.yml'],
            aliases: ['YAML'],
            mimetypes: ['application/json']
        });
        Monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, language);
        Monaco.languages.setLanguageConfiguration(LANGUAGE_ID, conf);
        // register language server providers
        this.registerLanguageServerProviders(Monaco.languages);
        // add the devfile schema into yaml language server configuration
        this.yamlService.configure({
            validate: true,
            schemas: [{
                uri: 'inmemory:yaml',
                fileMatch: ['*'],
                schema: this.props.devfilesRegistry.data[0].jsonSchema || {}
            }],
            hover: true,
            completion: true,
        });
        // register custom themes
        registerCustomThemes();
        // define the default
        Monaco.editor.setTheme(EDITOR_THEME);
    }

    // This method is called when the component is first added to the document
    public componentDidMount() {
        const element = $('.devfile-editor .monaco').get(0);
        if (element) {
            const value = dump(this.props.devfile, {'indent': 1});
            this.editor = monaco.editor.create(element, Object.assign({value}, MONACO_CONFIG));
            this.editor.layout({height: '600', width: '1000'});
            const doc = this.editor.getModel();
            doc.updateOptions({tabSize: 2});
            doc.onDidChangeContent(() => {
                this.onChange(this.editor.getValue(), true);
            });
            // init language server validation
            this.initLanguageServerValidation(this.editor);
        }
    }

    // This method is called when the component is removed from the document
    public componentWillUnmount() {
        if (!this.editor) {
            this.editor.getModel().dispose();
            this.editor.dispose();
        }
    }

    public render() {
        const href = (this.props.branding.branding.branding.docs as any).devfile;
        const {errorMessage} = this.state;

        return (
            <div className='devfile-editor'>
                <div className='monaco'>&nbsp;</div>
                <div className='error'>{errorMessage}</div>
                <a target='_blank' href={href}>Docs: Devfile Structure</a>
            </div>
        );
    }

    private onChange(newValue: string, isValid: boolean): void {
        let devfile: che.IWorkspaceDevfile;
        try {
            devfile = load(newValue);
        } catch (e) {
            console.error('DevfileEditor parse error', e);
            return;
        }
        if (this.props.onChange) {
            this.props.onChange(devfile, isValid);
        }
    }

    private registerLanguageServerProviders(languages: any): void {
        const createDocument = this.createDocument;
        const yamlService = this.yamlService;
        const m2p = this.m2p as any;
        const p2m = this.p2m as any;

        languages.registerCompletionItemProvider(LANGUAGE_ID, {
            provideCompletionItems(model: any, position: any) {
                const document = createDocument(model);
                return yamlService
                    .doComplete(document, m2p.asPosition(position.lineNumber, position.column), true)
                    .then(list => p2m.asCompletionResult(list));
            },
            resolveCompletionItem(item: any) {
                return yamlService
                    .doResolve(m2p.asCompletionItem(item))
                    .then(result => p2m.asCompletionItem(result));
            },
        });
        languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
            provideDocumentSymbols(model: any) {
                return p2m.asSymbolInformations(yamlService.findDocumentSymbols(createDocument(model)));
            },
        });
        languages.registerHoverProvider(LANGUAGE_ID, {
            provideHover(model: any, position: any) {
                return yamlService
                    .doHover(createDocument(model), m2p.asPosition(position.lineNumber, position.column))
                    .then(hover => p2m.asHover(hover));
            },
        });
    }

    private initLanguageServerValidation(editor: any): void {
        const model = editor.getModel();
        const pendingValidationRequests = new Map();

        model.onDidChangeContent(() => {
            const document = this.createDocument(model);
            const request = pendingValidationRequests.get(document.uri);
            if (request) {
                clearTimeout(request);
                pendingValidationRequests.delete(document.uri);
            }
            this.setState({errorMessage: ''});
            pendingValidationRequests.set(document.uri,
                setTimeout(() => {
                    pendingValidationRequests.delete(document.uri);
                    if (document.getText().length) {
                        this.yamlService.doValidation(document, false).then((diagnostics: any) => {
                            const markers = this.p2m.asDiagnostics(diagnostics);
                            const errorMessage = markers && markers[0] ? (markers[0] as any).message : '';
                            if (errorMessage) {
                                this.setState({errorMessage: `Error. ${errorMessage}`});
                                this.onChange(editor.getValue(), false);
                            }
                            monaco.editor.setModelMarkers(model, 'default', markers as any);
                        });
                    } else {
                        monaco.editor.setModelMarkers(monaco.editor.getModel({
                            scheme: 'inmemory',
                            authority: 'model.yaml'
                        } as any), 'default', []);
                    }
                })
            );
        });
    }
}

export default connect(
    (state: AppState) => {
        const {devfilesRegistry, branding} = state;
        return {devfilesRegistry, branding}; // Selects which state properties are merged into the component's props
    }
)(DevfileEditor);
