// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface SlashCommand {
    trigger: string;
    description: string;
    replacement: string;
}

const slashCommands: SlashCommand[] = [
    {
        trigger: '/text',
        description: 'Text',
        replacement: ''
    },
    {
        trigger: '/bullet',
        description: 'Bullet Point',
        replacement: '* '
    },
    {
        trigger: '/numbered',
        description: 'Numbered List',
        replacement: '1. '
    },
    {
        trigger: '/h1',
        description: 'Header 1',
        replacement: '# '
    },
    {
        trigger: '/h2',
        description: 'Header 2',
        replacement: '## '
    },
    {
        trigger: '/h3',
        description: 'Header 3',
        replacement: '### '
    },
    {
        trigger: '/h4',
        description: 'Header 4',
        replacement: '#### '
    },
    {
        trigger: '/h5',
        description: 'Header 5',
        replacement: '##### '
    },
    {
        trigger: '/h6',
        description: 'Header 6',
        replacement: '###### '
    },
    {
        trigger: '/bold',
        description: 'Bold text',
        replacement: '****'
    },
    {
        trigger: '/italic',
        description: 'Italic text',
        replacement: '**'
    },
    {
        trigger: '/code',
        description: 'Inline code',
        replacement: '``'
    },
    {
        trigger: '/codeblock',
        description: 'Code block',
        replacement: '```\n\n```'
    },
    {
        trigger: '/quote',
        description: 'Quote',
        replacement: '> '
    },
    {
        trigger: '/list',
        description: 'Bullet list',
        replacement: '- '
    },
    {
        trigger: '/numbered',
        description: 'Numbered list',
        replacement: '1. '
    },
    {
        trigger: '/task',
        description: 'Task list',
        replacement: '- [ ] '
    },
    {
        trigger: '/line',
        description: 'Horizontal line',
        replacement: '---\n'
    },
    {
        trigger: '/table',
        description: 'Table',
        replacement: '| Column 1 | Column 2 |\n|----------|----------|\n| | |'
    }
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Notion-in-Markdown extension is now active!');

    // Register completion provider for slash commands
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'markdown' },
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const line = document.lineAt(position);
                const linePrefix = line.text.substring(0, position.character);
                
                // Check if we're typing a slash command
                const slashMatch = linePrefix.match(/\/(\w*)$/);
                if (!slashMatch) {
                    return undefined;
                }

                const typedCommand = '/' + slashMatch[1];
                const completionItems: vscode.CompletionItem[] = [];
                
                // Get text before the slash command to check if line has content
                const beforeSlash = linePrefix.substring(0, linePrefix.length - slashMatch[0].length).trim();
                const hasContentBefore = beforeSlash.length > 0;

                for (const command of slashCommands) {
                    if (command.trigger.startsWith(typedCommand)) {
                        const item = new vscode.CompletionItem(command.trigger, vscode.CompletionItemKind.Snippet);
                        item.detail = command.description;
                        item.documentation = new vscode.MarkdownString(`Insert ${command.description.toLowerCase()}`);
                        
                        // Replace the partial command with the full replacement
                        const range = new vscode.Range(
                            new vscode.Position(position.line, position.character - slashMatch[0].length),
                            position
                        );
                        item.range = range;
                        
                        // Check if this is a header or table command and we have content before it
                        const isHeaderOrTable = command.trigger.startsWith('/h') || command.trigger === '/table';
                        
                        if (isHeaderOrTable && hasContentBefore) {
                            // For headers and tables on non-empty lines, add newline
                            if (command.trigger === '/table') {
                                item.insertText = new vscode.SnippetString(`\n${command.trigger === '/table' ? '| $1 | $2 |\n|----------|----------|\n| $3 | $4 |' : command.replacement}`);
                            } else {
                                // For headers, add newline and position cursor
                                item.insertText = new vscode.SnippetString(`\n${command.replacement}$1`);
                            }
                        } else {
                            // Regular behavior for empty lines or non-header/table commands
                            if (command.trigger === '/bold' || command.trigger === '/italic') {
                                // Position cursor between the asterisks
                                item.insertText = new vscode.SnippetString(
                                    command.trigger === '/bold' ? '**$1**' : '*$1*'
                                );
                            } else if (command.trigger === '/code') {
                                // Position cursor between the backticks
                                item.insertText = new vscode.SnippetString('`$1`');
                            } else if (command.trigger === '/codeblock') {
                                // Position cursor in the middle line
                                item.insertText = new vscode.SnippetString('```$1\n$2\n```');
                            } else if (command.trigger === '/table') {
                                // Position cursor in first cell
                                item.insertText = new vscode.SnippetString('| $1 | $2 |\n|----------|----------|\n| $3 | $4 |');
                            } else {
                                item.insertText = command.replacement;
                            }
                        }
                        
                        // Set sort priority based on how well it matches
                        if (command.trigger === typedCommand) {
                            item.sortText = '0' + command.trigger; // Exact match gets highest priority
                        } else {
                            item.sortText = '1' + command.trigger;
                        }
                        
                        completionItems.push(item);
                    }
                }

                return completionItems;
            }
        },
        '/' // Trigger completion when '/' is typed
    );

    // Listen for text document changes (keep for space trigger as well)
    const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        
        // Only process if we have an active editor and it's a markdown file
        if (!editor || !isMarkdownFile(editor.document)) {
            return;
        }

        // Check if this is the document being changed
        if (event.document !== editor.document) {
            return;
        }

        // Process each change
        for (const change of event.contentChanges) {
            if (change.text === ' ') {
                processSlashCommand(editor, change.range.start);
            }
        }
    });

    // Register command to show available slash commands
    const showCommandsDisposable = vscode.commands.registerCommand('notion-in-markdown.showCommands', () => {
        const items = slashCommands.map(cmd => ({
            label: cmd.trigger,
            description: cmd.description
        }));

        vscode.window.showQuickPick(items, {
            placeHolder: 'Select a slash command'
        }).then(selected => {
            if (selected) {
                insertSlashCommand(selected.label);
            }
        });
    });

    // Register command to toggle task completion
    const toggleTaskDisposable = vscode.commands.registerCommand('notion-in-markdown.toggleTask', () => {
        toggleTaskCompletion();
    });

    context.subscriptions.push(
        completionProvider,
        changeDisposable, 
        showCommandsDisposable, 
        toggleTaskDisposable
    );
}

function isMarkdownFile(document: vscode.TextDocument): boolean {
    return document.languageId === 'markdown' || 
           document.fileName.endsWith('.md') || 
           document.fileName.endsWith('.markdown');
}

function processSlashCommand(editor: vscode.TextEditor, position: vscode.Position) {
    const line = editor.document.lineAt(position.line);
    const lineText = line.text.substring(0, position.character);
    
    // Look for slash commands at the end of the line
    for (const command of slashCommands) {
        if (lineText.endsWith(command.trigger)) {
            const startPos = new vscode.Position(position.line, position.character - command.trigger.length);
            const endPos = position;
            
            // Get the text before the slash command
            const beforeCommand = lineText.substring(0, lineText.length - command.trigger.length).trim();
            
            // Check if this is a header or table command and we have content before it
            const isHeaderOrTable = command.trigger.startsWith('/h') || command.trigger === '/table';
            const hasContentBefore = beforeCommand.length > 0;
            
            if (isHeaderOrTable && hasContentBefore) {
                // For headers and tables on non-empty lines, create a new line structure
                let replacement: string;
                
                if (command.trigger === '/table') {
                    replacement = `\n${command.replacement}`;
                } else {
                    // For headers, move the content to the header format on a new line
                    replacement = `\n${command.replacement}`;
                }
                
                editor.edit(editBuilder => {
                    const range = new vscode.Range(startPos, endPos);
                    editBuilder.replace(range, replacement);
                }).then(() => {
                    // Position cursor appropriately
                    let newPosition: vscode.Position;
                    
                    if (command.trigger === '/table') {
                        // Position cursor in the first cell of the table
                        newPosition = new vscode.Position(position.line + 1, 2);
                    } else {
                        // For headers, position cursor at the end of the header line
                        newPosition = new vscode.Position(position.line + 1, command.replacement.length);
                    }
                    
                    editor.selection = new vscode.Selection(newPosition, newPosition);
                });
            } else {
                // Regular replacement for empty lines or non-header/table commands
                editor.edit(editBuilder => {
                    const range = new vscode.Range(startPos, endPos);
                    editBuilder.replace(range, command.replacement);
                }).then(() => {
                    // Position cursor appropriately based on the replacement
                    let newPosition: vscode.Position;
                    
                    if (command.trigger === '/bold' || command.trigger === '/italic') {
                        // Position cursor between the asterisks
                        const offset = command.replacement.length / 2;
                        newPosition = new vscode.Position(position.line, startPos.character + offset);
                    } else if (command.trigger === '/code') {
                        // Position cursor between the backticks
                        newPosition = new vscode.Position(position.line, startPos.character + 1);
                    } else if (command.trigger === '/codeblock') {
                        // Position cursor in the middle line of the code block
                        newPosition = new vscode.Position(position.line + 1, 0);
                    } else if (command.trigger === '/table') {
                        // Position cursor in the first cell
                        newPosition = new vscode.Position(position.line, startPos.character + 2);
                    } else {
                        // Position cursor at the end for other commands
                        newPosition = new vscode.Position(position.line, startPos.character + command.replacement.length);
                    }
                    
                    editor.selection = new vscode.Selection(newPosition, newPosition);
                });
            }
            
            break;
        }
    }
}

function insertSlashCommand(command: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isMarkdownFile(editor.document)) {
        return;
    }

    editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, command);
    });
}

function toggleTaskCompletion() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isMarkdownFile(editor.document)) {
        return;
    }

    const position = editor.selection.active;
    const line = editor.document.lineAt(position.line);
    const lineText = line.text;

    // Check if this is a task list item
    const taskRegex = /^(\s*)(- \[[ x]\])\s*(.*)/;
    const match = lineText.match(taskRegex);

    if (match) {
        const indent = match[1];
        const currentBox = match[2];
        const content = match[3];
        
        // Toggle between [ ] and [x]
        const newBox = currentBox.includes('x') ? '- [ ]' : '- [x]';
        const newLine = `${indent}${newBox} ${content}`;

        editor.edit(editBuilder => {
            const lineRange = line.range;
            editBuilder.replace(lineRange, newLine);
        });
    }
}

export function deactivate() {}
