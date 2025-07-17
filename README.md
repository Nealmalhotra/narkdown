# Narkdown for VSCode

A VSCode extension that brings Notion-like editing experience to Markdown files with intuitive slash commands and a powerful WYSIWYG editor.

## Features

Transform your markdown editing with Notion-inspired slash commands! Simply type a slash command followed by a space to instantly format your text.

### Available Slash Commands

| Command | Description | Result |
|---------|-------------|--------|
| `/h1` | Header 1 | `# Your text` (new line if content before) |
| `/h2` | Header 2 | `## Your text` (new line if content before) |
| `/h3` | Header 3 | `### Your text` (new line if content before) |
| `/h4` | Header 4 | `#### Your text` (new line if content before) |
| `/bold` | Bold text | `**Your text**` |
| `/italic` | Italic text | `*Your text*` |
| `/code` | Inline code | `` `Your text` `` |
| `/codeblock` | Code block | ``` ```\nYour text\n``` ``` |
| `/quote` | Quote | `> Your text` |
| `/list` | Bullet list | `- Your text` |
| `/numbered` | Numbered list | `1. Your text` |
| `/task` | Task list | `- [ ] Your text` |
| `/line` | Horizontal line | `---` |
| `/table` | Table | Creates a 2-column table (new line if content before) |

## ✨ Smart Cursor Positioning

The extension intelligently positions your cursor after inserting commands:
- **Bold/Italic**: Between the formatting markers for immediate typing
- **Code**: Inside the backticks
- **Code blocks**: In the content area with language selector tab stop
- **Tables**: In the first cell with tab navigation between cells
- **Headers/Lists**: At the end, ready for content

## 🆕 Smart Line Handling

**Headers and tables automatically create new lines when used on non-empty lines:**

**Example:**
```
Type: "My awesome title/h1 [space]"
Result: 
My awesome title
# [cursor here]
```

This ensures proper document structure by keeping headers and tables as block-level elements.

## 🎨 WYSIWYG Editor

**NEW**: Experience markdown editing like never before with our integrated WYSIWYG (What You See Is What You Get) editor!

### Features:
- **Real-time synchronization** between markdown source and visual editor
- **Notion-style slash commands** directly in the WYSIWYG editor  
- **Live editing** with immediate markdown updates
- **Rich text formatting** with visual feedback
- **Task list** checkboxes you can click to toggle
- **Seamless integration** with VS Code themes

### How to Open WYSIWYG Editor:
1. **Open any markdown file** in VS Code
2. **Use keyboard shortcut**: `Ctrl+Shift+W` (Windows/Linux) or `Cmd+Shift+W` (Mac)
3. **Or click the preview icon** in the editor title bar
4. **Or right-click** and select "Open WYSIWYG Editor"

### WYSIWYG Slash Commands:
The WYSIWYG editor supports the same slash commands as the markdown editor:
- Type `/` to see the command menu
- Use arrow keys to navigate
- Press Enter to select
- Commands are instantly applied with visual formatting

### Real-time Sync:
- **Edit in WYSIWYG** → automatically updates the markdown file
- **Edit in markdown** → automatically updates the WYSIWYG view  
- **No conflicts** - both views stay perfectly synchronized

## How to Use

### Method 1: Autocomplete (Recommended)
1. **Type `/`** in any markdown file
2. **See the autocomplete dropdown** appear automatically
3. **Start typing** to filter options (e.g., type `/bo` to see "bold")
4. **Press Tab or Enter** to select and insert the command
5. **Your cursor** will be positioned perfectly for typing content

### Method 2: Type and Space
1. **Type a slash command** (like `/h1`, `/bold`, etc.)
2. **Press space** to trigger the transformation
3. **The command** gets replaced with markdown formatting

### Example Usage

**Autocomplete method:**
```
Type: /h1
Select from dropdown
Result: # [cursor here]
```

**Space trigger method:**
```
Type: /h1 [space]
Result: # [cursor here]
```

## Additional Features

### Quick Command Palette
- **Keyboard Shortcut**: `Ctrl+/` (Windows/Linux) or `Cmd+/` (Mac)
- Shows all available slash commands in a quick pick menu

### WYSIWYG Editor
- **Keyboard Shortcut**: `Ctrl+Shift+W` (Windows/Linux) or `Cmd+Shift+W` (Mac)
- Opens the WYSIWYG editor with real-time sync

### Task Toggle
- **Keyboard Shortcut**: `Ctrl+Shift+C` (Windows/Linux) or `Cmd+Shift+C` (Mac)
- Quickly toggle task completion status `- [ ]` ↔ `- [x]`

### Context Menu
Right-click in any markdown file to access:
- Show Slash Commands
- Toggle Task Completion
- Open WYSIWYG Editor

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to launch the extension in a new Extension Development Host window
4. Open a `.md` file and start using slash commands!

## Development

### Building
```bash
npm run compile
```

### Testing
```bash
npm test
```

### Watching for changes
```bash
npm run watch
```

## Requirements

- VSCode 1.99.3 or higher
- Works with any `.md` or `.markdown` file

## Extension Settings

This extension automatically activates when you open a markdown file. No additional configuration needed!

## Known Issues

- Slash commands only work when triggered with a space or newline
- Text transformation replaces the entire line content

## Contributing

Feel free to submit issues and enhancement requests!

## Release Notes

### 0.0.2

Major update with WYSIWYG functionality:
- **NEW**: Full WYSIWYG editor with real-time markdown sync
- **NEW**: Notion-style slash commands in WYSIWYG mode  
- **NEW**: Visual editing with immediate feedback
- **NEW**: Clickable task list checkboxes
- **Enhanced**: Better integration with VS Code themes

### 0.0.1

Initial release of Narkdown extension:
- Basic slash command functionality
- Support for headers, formatting, lists, and more
- Keyboard shortcuts and context menu integration
