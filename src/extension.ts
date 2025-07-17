// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MarkdownEditorProvider } from './markdownEditor';

export interface SlashCommand {
    trigger: string;
    description: string;
    replacement: string;
    action?: string; // CKEditor command to execute
}

export const slashCommands: SlashCommand[] = [
    {
        trigger: '/h1',
        description: 'Heading 1',
        replacement: '# ',
        action: 'heading1'
    },
    {
        trigger: '/h2',
        description: 'Heading 2',
        replacement: '## ',
        action: 'heading2'
    },
    {
        trigger: '/h3',
        description: 'Heading 3',
        replacement: '### ',
        action: 'heading3'
    },
    {
        trigger: '/h4',
        description: 'Heading 4',
        replacement: '#### ',
        action: 'heading4'
    },
    {
        trigger: '/bold',
        description: 'Bold text',
        replacement: '****',
        action: 'bold'
    },
    {
        trigger: '/italic',
        description: 'Italic text',
        replacement: '**',
        action: 'italic'
    },
    {
        trigger: '/code',
        description: 'Inline code',
        replacement: '``',
        action: 'code'
    },
    {
        trigger: '/codeblock',
        description: 'Code block',
        replacement: '```\ncode\n```',
        action: 'codeBlock'
    },
    {
        trigger: '/bullet',
        description: 'Bullet list',
        replacement: '- ',
        action: 'bulletedList'
    },
    {
        trigger: '/numbered',
        description: 'Numbered list',
        replacement: '1. ',
        action: 'numberedList'
    },
    {
        trigger: '/quote',
        description: 'Block quote',
        replacement: '> ',
        action: 'blockQuote'
    },
    {
        trigger: '/table',
        description: 'Table',
        replacement: '| Column 1 | Column 2 |\n|----------|----------|\n| | |',
        action: 'insertTable'
    },
    {
        trigger: '/link',
        description: 'Link',
        replacement: '[text](url)',
        action: 'link'
    },
    {
        trigger: '/line',
        description: 'Horizontal line',
        replacement: '',
        action: 'horizontalLine'
    }
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Narkdown extension is now active!');

	// Register our custom editor provider
	context.subscriptions.push(MarkdownEditorProvider.register(context));

    // Helper method to register commands and push subscription
    function registerCommand(command: string, callback: (...args: any[]) => any) {
        context.subscriptions.push(vscode.commands.registerCommand(command, callback));
    }

    registerCommand('markdownEditor.openCustomEditor', async (uri: vscode.Uri) => {
        uri = uri ?? vscode.window.activeTextEditor?.document.uri;

        if (!uri) {
            vscode.window.showErrorMessage('No file to open.');
            return;
        }

        vscode.commands.executeCommand('vscode.openWith', uri, MarkdownEditorProvider.viewType);
    });

    registerCommand('markdownEditor.openDefaultEditor', async (uri: vscode.Uri) => {
        uri = uri ?? vscode.window.activeTextEditor?.document.uri;

        if (!uri) {
            vscode.window.showErrorMessage('No file to open.');
            return;
        }
        
        vscode.commands.executeCommand('vscode.openWith', uri, 'default');
    });
}

export function deactivate() {}
