import * as React from 'react';
import {connect} from 'react-redux';
import {AppState} from '../../../store';
import * as DevfilesRegistry from '../../../store/DevfilesRegistry';
import {BrandingState} from '../../../store/Branding';
import * as monacoConversion from 'monaco-languageclient/lib/monaco-converter';
import * as Monaco from 'monaco-editor-core/esm/vs/editor/editor.main';
import {language, conf} from 'monaco-languages/release/esm/yaml/yaml';
import * as yamlLanguageServer from 'yaml-language-server';
import {registerCustomThemes, DEFAULT_CHE_THEME} from './monaco-editor-theme-register';
import {safeLoad, dump} from 'js-yaml';
import * as $ from 'jquery';

import './devfile-editor.styl';

const EDITOR_THEME = DEFAULT_CHE_THEME;
const LANGUAGE_ID = 'yaml';
const MONACO_CONFIG = {language: 'yaml', wordWrap: 'on', lineNumbers: 'on', matchBrackets: true, readOnly: false};

type Props = { devfilesRegistry: DevfilesRegistry.DevfilesState, branding: { branding: BrandingState } } // Redux store
    & { devfile: che.IWorkspaceDevfile, onChange?: (devfile: che.IWorkspaceDevfile) => void }; // incoming parameters
class DevfileEditor extends React.PureComponent<Props> {
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

        // TODO add loading the web worker code in main thread
        this.yamlService = yamlLanguageServer.getLanguageService(() => Promise.resolve(''), {} as any, []);
        // register Themes
        registerCustomThemes();
        // define the Theme
        Monaco.editor.setTheme(EDITOR_THEME);
        // register the YAML language with Monaco
        Monaco.languages.register({
            id: LANGUAGE_ID,
            extensions: ['.yaml', '.yml'],
            aliases: ['YAML'],
            mimetypes: ['application/json']
        });
        Monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, language);
        Monaco.languages.setLanguageConfiguration(LANGUAGE_ID, conf);
        // add the devfile schema into yaml language server configuration
        const jsonSchema = this.props.devfilesRegistry.data[0].jsonSchema;
        if (jsonSchema) {
            this.yamlService.configure({
                validate: true,
                schemas: [{
                    uri: 'inmemory:yaml',
                    fileMatch: ['*'],
                    schema: jsonSchema
                }],
                hover: true,
                completion: true,
            });
        }
    }

    // This method is called when the component is first added to the document
    public componentDidMount() {
        const element = $('.devfile-editor .monaco').get(0);
        if (element) {
            const value = dump(this.props.devfile, {'indent': 1});
            const monacoConfig = Object.assign({value}, MONACO_CONFIG);
            this.editor = monaco.editor.create(element, monacoConfig);
            this.editor.layout({height: '600', width: '1000'} as any);
            const doc = this.editor.getModel();
            doc.updateOptions({tabSize: 2});
            doc.onDidChangeContent(() => {
                this.onChange(this.editor.getValue());
            });
            this.registerLanguageServerProviders();
            this.initLanguageServerValidation();
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

        return (
            <div className='devfile-editor'>
                <div className='monaco'>&nbsp;</div>
                <a target='_blank' href={href}>Docs: Devfile Structure</a>
            </div>
        );
    }

    private onChange(newValue: string): void {
        let devfile: che.IWorkspaceDevfile;
        try {
            devfile = safeLoad(newValue);
        } catch (e) {
            console.error('DevfileEditor parse error', e);
            return;
        }
        this.setState({devfile});
        if (this.props.onChange) {
            this.props.onChange(devfile);
        }
    }

    private registerLanguageServerProviders(): void {
        const createDocument = this.createDocument;
        const yamlService = this.yamlService;
        const m2p = this.m2p as any;
        const p2m = this.p2m as any;

        monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
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
        monaco.languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
            provideDocumentSymbols(model: any) {
                return p2m.asSymbolInformations(yamlService.findDocumentSymbols(createDocument(model)));
            },
        });
        monaco.languages.registerHoverProvider(LANGUAGE_ID, {
            provideHover(model: any, position: any) {
                return yamlService
                    .doHover(createDocument(model), m2p.asPosition(position.lineNumber, position.column))
                    .then(hover => p2m.asHover(hover));
            },
        });
    }

    private initLanguageServerValidation(): void {
        const model = monaco.editor.getModels()[0];
        const pendingValidationRequests = new Map();

        model.onDidChangeContent(() => {
            const document = this.createDocument(model);
            const request = pendingValidationRequests.get(document.uri);
            if (request) {
                clearTimeout(request);
                pendingValidationRequests.delete(document.uri);
            }
            pendingValidationRequests.set(document.uri,
                setTimeout(() => {
                    pendingValidationRequests.delete(document.uri);
                    if (document.getText().length) {
                        this.yamlService.doValidation(document, false).then((diagnostics: any) => {
                            const markers = this.p2m.asDiagnostics(diagnostics);
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
