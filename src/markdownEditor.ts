import * as vscode from 'vscode';
import { slashCommands } from './extension';

export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new MarkdownEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(
			MarkdownEditorProvider.viewType,
			provider,
			{
				webviewOptions: { retainContextWhenHidden: true },
			}
		);
		return providerRegistration;
	}

	static readonly viewType = 'markdownEditor.customEditor';

	constructor(private readonly context: vscode.ExtensionContext) {}

	// Called when our custom editor is opened.
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial webview HTML and settings
		webviewPanel.webview.options = { enableScripts: true };
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		// Initial scroll sync
		webviewPanel.webview.postMessage({
			type: 'scrollChanged',
			scrollTop: document.lineAt(0).range.start.line,
		});

		////////////////////////////////////////////////////////////////////////////////////////
		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync changes in the document to our
		// editor and sync changes in the editor back to the document.
		//
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		function updateWebview() {
			let text = document.getText();

			// Change EOL to \n because that's what CKEditor5 uses internally
			text = text.replace(/(?:\r\n|\r|\n)/g, '\n');

			console.log('updateWebview', [JSON.stringify(text)]);
			webviewPanel.webview.postMessage({ type: 'documentChanged', text: text });
		}

		const saveDocumentSubscription = vscode.workspace.onDidSaveTextDocument((e) => {
			console.log('Saved Document');
			updateWebview();
		});

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
			console.log('Changed Document: ', [JSON.stringify(e.document.getText())]);
		});

		const onDidChangeTextEditorVisibleRanges = vscode.window.onDidChangeTextEditorVisibleRanges(
			(e) => {
				console.log('onDidChangeTextEditorVisibleRanges: ', [JSON.stringify(e)]);
				if (e.textEditor.document === document) {
					//  Sync scroll from editor to webview
					webviewPanel.webview.postMessage({
						type: 'scrollChanged',
						scrollTop: e.textEditor.visibleRanges[0].start.line,
					});
				}
			}
		);

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			console.log('Disposed');
			changeDocumentSubscription.dispose();
			saveDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage((e) => {
			console.log('onDidReceiveMessage: ', [JSON.stringify(e)]);
			switch (e.type) {
				case 'webviewChanged':
					this.updateTextDocument(document, e.text);
					return;
				case 'initialized':
					updateWebview();
                    webviewPanel.webview.postMessage({ type: 'setSlashCommands', commands: slashCommands });
					return;
				case 'plainPaste':
					vscode.commands.executeCommand('editor.action.clipboardPasteAction');
					return;
                case 'editorInitializationError':
                    vscode.window.showErrorMessage(`Error initializing Narkdown editor: ${e.error}`);
                    console.error("Narkdown editor initialization error:", e.error);
                    return;
			}
		});
	}

	// Get the static html used for the editor webviews.
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const initScriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'markdownEditorInitScript.js')
		);
		const ckeditorUri = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this.context.extensionUri,
				...'dist/ckeditor5-build-markdown/build/ckeditor.js'.split('/')
			)
		);
        const slashMenuCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'slash-menu.css')
        );

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		const html = String.raw; // https://prettier.io/docs/en/options.html#embedded-language-formatting
		return html/* html */ `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}; img-src ${webview.cspSource} https: data:;" />

					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<title>Markdown WYSIWYG Editor</title>
                    <link href="${slashMenuCssUri}" rel="stylesheet">
				</head>
				<body style="margin: 0; padding: 0; height: 100vh; overflow: hidden;">
					<div id="editor" style="height: 100vh;"></div>
                    <div id="slash-menu" class="slash-menu"></div>

					<script nonce="${nonce}" src="${ckeditorUri}"></script>
					<script nonce="${nonce}" src="${initScriptUri}"></script>
					<script nonce="${nonce}">
						const vscode = acquireVsCodeApi();
						window.vscode = vscode;
						MarkdownEditor.create(document.querySelector('#editor'))
							.then((editor) => {
								initializeNarkdown(editor);
								console.log('CKEditor instance:', editor);
							})
							.catch((error) => {
								console.error('CKEditor Initialization Error:', error);
								vscode.postMessage({
									type: 'editorInitializationError',
									error: error.toString()
								});
							});
					</script>
				</body>
			</html> `;
	}

	// Save new content to the text document
	private updateTextDocument(document: vscode.TextDocument, text: any) {
		console.log('VS Code started updateTextDocument', [JSON.stringify(text)]);

		// Standardize text EOL character to match document
		// https://code.visualstudio.com/api/references/vscode-api#EndOfLine
		const eol_chars = document?.eol == 2 ? '\r\n' : '\n';
		text = text.replace(/(?:\r\n|\r|\n)/g, eol_chars);

		let finalText = text;
		let fileText = document?.getText();

		if (text != fileText) {
			// TODO - Apply edits to the document instead of replacing the whole thing
			const newEdit = new vscode.WorkspaceEdit();
			newEdit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), text);
			vscode.workspace.applyEdit(newEdit);

			// console.debug('Updating Document because content changed');
			// console.debug('rawText', JSON.stringify(rawText));
			// console.debug('prettierText', JSON.stringify(prettierText));
			// console.debug('finalText', JSON.stringify(finalText));
			// console.debug('fileText', JSON.stringify(fileText));
		}
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
