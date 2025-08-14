# Narkdown for VSCode

A VSCode/Cursor extension for making editing markdown files more like writing in Notion. I am a big fan of Notion's design language like the slash menu and the WYSIWYG editor, so this is as close I can get to using Notion in VSCode.

## Features

Type a "/" and a menu with options will show up.

### Slash Commands
Type a "/" and a menu with options will show up.

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

### 🎨 WYSIWYG Editor

Instead of editing markdown with traditional markdown language, markdown files can now be viewed in a WYSIWYG (What You See Is What You Get) editor. 
Makes the experience much more similiar to Notion and you don't need to worry about having to use markdown language while typing, but still generating a markdown file that is easy to share with people. 

### Features:
- **Real-time synchronization** between markdown source and visual editor
- **Notion-style slash commands** directly in the WYSIWYG editor  
- **Live editing** with immediate markdown updates
- **Rich text formatting** with visual feedback
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
