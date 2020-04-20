import * as React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import * as DevfilesRegistry from '../../../store/DevfilesRegistry';
import { BrandingState } from '../../../store/Branding';
import { DisposableCollection } from '../../../services/disposable';
import * as monacoConversion from 'monaco-languageclient/lib/monaco-converter';
import * as Monaco from 'monaco-editor-core/esm/vs/editor/editor.main';
import { language, conf } from 'monaco-languages/release/esm/yaml/yaml';
import * as yamlLanguageServer from 'yaml-language-server';
import { registerCustomThemes, DEFAULT_CHE_THEME } from './monaco-theme-register';
import { load, dump } from 'js-yaml';
import * as $ from 'jquery';

import './devfile-editor.styl';

interface IEditor {
  getValue(): string;
  getModel(): any;
}

const EDITOR_THEME = DEFAULT_CHE_THEME;
const LANGUAGE_ID = 'yaml';
const YAML_SERVICE = 'yamlService';
const MONACO_CONFIG = { language: 'yaml', wordWrap: 'on', lineNumbers: 'on', matchBrackets: true, readOnly: false };

type Props = { devfilesRegistry: DevfilesRegistry.DevfilesState, branding: { branding: BrandingState } } // Redux store
  & {
    devfile: che.IWorkspaceDevfile,
    decorationPattern?: string,
    onChange?: (devfile: che.IWorkspaceDevfile, isValid: boolean) => void,
    setUpdateEditorCallback?: (Function) => void
  };

class DevfileEditor extends React.PureComponent<Props, { errorMessage: string }> {
  private readonly toDispose = new DisposableCollection();
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

    this.state = { errorMessage: '' };
    if (this.props.setUpdateEditorCallback) {
      this.props.setUpdateEditorCallback(() => {
        if (this.editor) {
          const doc = this.editor.getModel();
          doc.setValue(dump(this.props.devfile, { 'indent': 1 }));
        }
      });
    }
    // lazy initialization
    if (!window[YAML_SERVICE]) {
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
      const value = dump(this.props.devfile, { 'indent': 1 });
      this.editor = monaco.editor.create(element, Object.assign(
        { value },
        MONACO_CONFIG
      ));

      const doc = this.editor.getModel();
      doc.updateOptions({ tabSize: 2 });

      const handleResize = () => {
        const layout = { height: element.offsetHeight, width: element.offsetWidth };
        this.editor.layout(layout);
      };
      window.addEventListener('resize', handleResize);
      this.toDispose.push({
        dispose: () => {
          if (doc) {
            doc.dispose();
          }
          if (this.editor) {
            this.editor.dispose();
          }
          window.removeEventListener('resize', handleResize);
        }
      });

      let oldDecorationIds: string[] = []; // Array containing previous decorations identifiers.
      const updateDecorations = () => {
        if (this.props.decorationPattern) {
          oldDecorationIds = this.editor.deltaDecorations(oldDecorationIds, this.getDecorations());
        }
      };
      updateDecorations();
      doc.onDidChangeContent(() => {
        updateDecorations();
        this.onChange(this.editor.getValue(), true);
      });
      // init language server validation
      this.initLanguageServerValidation(this.editor);
    }
  }

  // This method is called when the component is removed from the document
  public componentWillUnmount() {
    this.toDispose.dispose();
  }

  public render() {
    const href = (this.props.branding.branding.branding.docs as any).devfile;
    const { errorMessage } = this.state;

    return (
      <div className='devfile-editor'>
        <div className='monaco'>&nbsp;</div>
        <div className='error'>{errorMessage}</div>
        <a target='_blank' href={href}>Docs: Devfile Structure</a>
      </div>
    );
  }

  private getDecorations(): monaco.editor.IModelDecoration[] {
    const decorations: monaco.editor.IModelDecoration[] = [];
    if (this.props.decorationPattern) {
      const decorationRegExp = new RegExp(this.props.decorationPattern, 'img');
      const model = this.editor.getModel();
      const value = this.editor.getValue();
      let match = decorationRegExp.exec(value);
      while (match) {
        const startPosition = model.getPositionAt(match.index);
        const endPosition = model.getPositionAt(match.index + match[0].length);
        decorations.push({
          range: {
            startLineNumber: startPosition.lineNumber,
            startColumn: startPosition.column,
            endLineNumber: endPosition.lineNumber,
            endColumn: endPosition.column,
          },
          options: {
            inlineClassName: 'devfile-editor-decoration'
          }
        } as monaco.editor.IModelDecoration);
        match = decorationRegExp.exec(value);
      }
    }
    return decorations;
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
    const m2p = this.m2p;
    const p2m = this.p2m;

    languages.registerCompletionItemProvider(LANGUAGE_ID, {
      provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position) {
        const document = createDocument(model);
        return yamlService.doComplete(document, m2p.asPosition(position.lineNumber, position.column), true)
          .then(list => p2m.asCompletionResult(list, {} as any));
      },
      resolveCompletionItem(item: monaco.languages.CompletionItem) {
        return yamlService.doResolve(m2p.asCompletionItem(item))
          .then(result => p2m.asCompletionItem(result, {} as any));
      },
    } as monaco.languages.CompletionItemProvider);
    languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
      provideDocumentSymbols(model: any) {
        return p2m.asSymbolInformations(yamlService.findDocumentSymbols(createDocument(model)));
      },
    });
    languages.registerHoverProvider(LANGUAGE_ID, {
      provideHover(model: any, position: any) {
        return yamlService.doHover(createDocument(model), m2p.asPosition(position.lineNumber, position.column))
          .then(hover => p2m.asHover(hover));
      },
    });
  }

  private initLanguageServerValidation(editor: IEditor): void {
    const model = editor.getModel();
    let validationTimer: any;

    model.onDidChangeContent(() => {
      const document = this.createDocument(model);
      this.setState({ errorMessage: '' });
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
      validationTimer = setTimeout(() => {
        this.yamlService.doValidation(document, false).then(diagnostics => {
          const markers = this.p2m.asDiagnostics(diagnostics);
          const errorMessage = markers && markers[0] ? (markers[0] as any).message : '';
          if (errorMessage) {
            this.setState({ errorMessage: `Error. ${errorMessage}` });
            this.onChange(editor.getValue(), false);
          }
          monaco.editor.setModelMarkers(model, 'default', markers as any);
        });
      })
    });
  }
}

export default connect(
  (state: AppState) => {
    const { devfilesRegistry, branding } = state;
    return { devfilesRegistry, branding }; // Properties are merged into the component's props
  }
)(DevfileEditor);
