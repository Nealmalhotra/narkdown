# Notion-style Markdown Demo

Welcome to the demo of our Notion-style markdown extension! 

## 🎯 Two Ways to Use Slash Commands

### Method 1: Autocomplete (NEW!)
1. Type `/` in any markdown file
2. See the autocomplete dropdown appear automatically
3. Start typing to filter options (e.g., type `/bo` to see "bold")
4. Press `Tab` or `Enter` to select and insert the command
5. Your cursor will be positioned perfectly for typing content

### Method 2: Type and Space
1. Type a slash command (like `/h1`, `/bold`, etc.)
2. Press space to trigger the transformation
3. The command gets replaced with markdown formatting

## 🆕 Smart Line Handling for Headers & Tables

**NEW FEATURE**: Headers and tables automatically create new lines when used on non-empty lines!

### Examples to Try:

**Headers on non-empty lines:**
```
Type: "My awesome title/h1 [space]"
Result: 
My awesome title
# [cursor here]
```

**Tables on non-empty lines:**
```
Type: "Here's my data/table [space]"
Result:
Here's my data
| Column 1 | Column 2 |
|----------|----------|
| [cursor here] |          |
```

**On empty lines (works as before):**
```
Type: "/h1 [space]" on empty line
Result: "# [cursor here]"
```

## 🚀 Try the Autocomplete Feature

**Test it now:**
- Type `/` below this line and watch the suggestions appear
- Try typing `/h` to filter to headers
- Try typing `/bo` to see bold formatting
- Try typing `/ta` to see table and task options

**Test the new line behavior:**
- Type some text followed by `/h1` and see it create a new line
- Type some text followed by `/table` and see the table appear below

---

## 📝 Available Slash Commands

| Command | Description | Result |
|---------|-------------|--------|
| `/h1` - `/h6` | Headers | `# Header text` (new line if content before) |
| `/bold` | Bold text | `**text**` (with cursor between asterisks) |
| `/italic` | Italic text | `*text*` (with cursor between asterisks) |
| `/code` | Inline code | `` `code` `` (with cursor between backticks) |
| `/codeblock` | Code block | Multi-line code block with syntax highlighting |
| `/quote` | Quote | `> Quote text` |
| `/list` | Bullet list | `- List item` |
| `/numbered` | Numbered list | `1. List item` |
| `/task` | Task list | `- [ ] Task item` |
| `/line` | Horizontal line | `---` |
| `/table` | Table | Complete table structure (new line if content before) |

## ✨ Smart Cursor Positioning

The extension intelligently positions your cursor:
- **Bold/Italic**: Between the formatting markers
- **Code**: Inside the backticks
- **Code blocks**: In the content area with language selector
- **Tables**: In the first cell with tab navigation
- **Headers/Lists**: At the end, ready for content
- **NEW**: Headers and tables on non-empty lines create proper line breaks

## 🎹 Keyboard Shortcuts

- **Ctrl+/** (Cmd+/ on Mac): Show all slash commands
- **Ctrl+Shift+C** (Cmd+Shift+C on Mac): Toggle task completion

## 💡 Tips

- The autocomplete is **smart** - it filters as you type
- You can use either **Tab** or **Enter** to accept suggestions
- Both autocomplete and space-trigger work simultaneously
- Headers and tables automatically handle line breaks intelligently
- Works in any `.md` or `.markdown` file

**Try it now!** Type `/` below and start exploring:

Try typing some content and then a header command to see the new line behavior: 