/*
 * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../store';
import * as DevfileRegistriesStore from '../../../store/DevfileRegistries';
import * as BrandingStore from '../../../store/Branding';
import { DisposableCollection } from '../../../services/disposable';
import * as monacoConversion from 'monaco-languageclient/lib/monaco-converter';
import * as Monaco from 'monaco-editor-core/esm/vs/editor/editor.main';
import { language, conf } from 'monaco-languages/release/esm/yaml/yaml';
import * as yamlLanguageServer from 'yaml-language-server';
import { registerCustomThemes, DEFAULT_CHE_THEME } from './monaco-theme-register';
import { load, dump } from 'js-yaml';
import $ from 'jquery';

import './devfile-editor.styl';

interface Editor {
  getValue(): string;
  getModel(): any;
}

const EDITOR_THEME = DEFAULT_CHE_THEME;
const LANGUAGE_ID = 'yaml';
const YAML_SERVICE = 'yamlService';
const MONACO_CONFIG: Monaco.IEditorConstructionOptions = {
  language: 'yaml',
  wordWrap: 'on',
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
};

type Props = {
  devfileRegistries: DevfileRegistriesStore.State;
  branding: BrandingStore.State;
} // Redux store
  & {
    devfile: che.WorkspaceDevfile;
    decorationPattern?: string;
    onChange: (devfile: che.WorkspaceDevfile, isValid: boolean) => void;
  };
type State = {
  errorMessage: string;
};

export class DevfileEditor extends React.PureComponent<Props, State> {
  private readonly toDispose = new DisposableCollection();
  private editor: any;
  private yamlService: any;
  private m2p = new monacoConversion.MonacoToProtocolConverter();
  private p2m = new monacoConversion.ProtocolToMonacoConverter();
  private createDocument = (model): yamlLanguageServer.TextDocument => yamlLanguageServer.TextDocument.create(
    'inmemory://model.yaml',
    model.getModeId(),
    model.getVersionId(),
    model.getValue()
  );

  private skipNextOnChange: boolean;

  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: '',
    };

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
        schema: this.props.devfileRegistries.schema || {}
      }],
      hover: true,
      completion: true,
    });
    // register custom themes
    registerCustomThemes();
    // define the default
    Monaco.editor.setTheme(EDITOR_THEME);
  }

  public updateContent(devfile: che.WorkspaceDevfile): void {
    if (!this.editor) {
      return;
    }
    this.skipNextOnChange = true;
    const doc = this.editor.getModel();
    doc.setValue(this.stringify(devfile));
  }

  private stringify(devfile: che.WorkspaceDevfile): string {
    return dump(devfile, { 'indent': 1 });
  }

  // This method is called when the component is first added to the document
  public componentDidMount(): void {
    const element = $('.devfile-editor .monaco').get(0);
    if (element) {
      const value = this.stringify(this.props.devfile);
      this.editor = monaco.editor.create(element, Object.assign(
        { value },
        MONACO_CONFIG
      ));

      const doc = this.editor.getModel();
      doc.updateOptions({ tabSize: 2 });

      const handleResize = (): void => {
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
      const updateDecorations = (): void => {
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
  public componentWillUnmount(): void {
    this.toDispose.dispose();
  }

  public render(): React.ReactElement {
    const href = this.props.branding.data.docs.devfile;
    const { errorMessage } = this.state;

    return (
      <div className='devfile-editor'>
        <div className='monaco'>&nbsp;</div>
        <div className='error'>{errorMessage}</div>
        <a target='_blank' rel='noopener noreferrer' href={href}>Docs: Devfile Structure</a>
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
    if (this.skipNextOnChange) {
      this.skipNextOnChange = false;
      return;
    }

    let devfile: che.WorkspaceDevfile;
    try {
      devfile = load(newValue);
    } catch (e) {
      console.error('DevfileEditor parse error', e);
      return;
    }
    this.props.onChange(devfile, isValid);
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
          .then(list => {
            const completionResult: any = p2m.asCompletionResult(list, {} as any);
            if (!completionResult || !completionResult.items) {
              return completionResult;
            }
            // convert completionResult into suggestions
            const defaultInsertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
            const suggestions = completionResult.items.map(item => {
              return {
                label: item.label,
                kind: item.kind,
                documentation: item.documentation,
                insertText: item.insertText && item.insertText.value ? item.insertText.value : item.insertText,
                insertTextRules: item.insertTextRules ? item.insertTextRules : defaultInsertTextRules
              };
            });
            return { suggestions };
          });
      },
      resolveCompletionItem(item: monaco.languages.CompletionItem) {
        return yamlService.doResolve(m2p.asCompletionItem(item))
          .then(result => p2m.asCompletionItem(result, {} as any));
      },
    } as any);
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

  private initLanguageServerValidation(editor: Editor): void {
    const model = editor.getModel();
    let validationTimer: number;

    model.onDidChangeContent(() => {
      const document = this.createDocument(model);
      this.setState({ errorMessage: '' });
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
      validationTimer = setTimeout(() => {
        this.yamlService.doValidation(document, false).then(diagnostics => {
          const markers = this.p2m.asDiagnostics(diagnostics);
          let errorMessage = '';
          if (markers && markers[0]) {
            const { message, startLineNumber, startColumn } = markers[0];
            if (startLineNumber && startColumn) {
              errorMessage += `line[${startLineNumber}] column[${startColumn}]: `;
            }
            errorMessage += `Error. ${message}`;
          }
          if (errorMessage) {
            this.setState({ errorMessage: `Error. ${errorMessage}` });
            this.onChange(editor.getValue(), false);
          }
          monaco.editor.setModelMarkers(model, 'default', markers || []);
        });
      });
    });
  }
}

export default connect(
  (state: AppState) => {
    const { devfileRegistries, branding } = state;
    return { devfileRegistries, branding }; // Properties are merged into the component's props
  },
  null,
  null,
  { forwardRef: true }
)(DevfileEditor);
