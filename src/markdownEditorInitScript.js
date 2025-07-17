//@ts-nocheck

function initializeNarkdown(editor) {
    // Get a reference to the VS Code webview api.
    // We use this API to post messages back to our extension.
    
    // This will store the latest saved data from VS Code
    editor.savedData = null;
    
    editor.suppressNextDataChangeEvent = false;
    
    // We use this to track whether the document's initial content has been set yet
    var initializedFlag = false;
    
    /**
     * Render the document in the webview.
     */
    function setEditorContent(/** @type {string} */ text) {
        console.log('setEditorContent', { initializedFlag, text: JSON.stringify(text) });
    
        // We use setData instead of editor.model.change for initial content otherwise undo history starts with empty content
        if (!initializedFlag) {
            editor.setData(text);
            initializedFlag = true;
            return;
        }
    
        // If the new text doesn't match the editor's current text, we need to update it but preserve the selection.
        if (editor.getData() != text) {
            // Save selection so we can restore it after replacing the content
            const userSelection = editor.model.document.selection.getFirstRange();
    
            // Replace all content but calling insertContent with the whole document range as a selection
            const selectionRange = editor.model.createRangeIn(editor.model.document.getRoot());
            const viewFragment = editor.data.processor.toView(text);
            const modelFragment = editor.data.toModel(viewFragment);
            editor.model.insertContent(modelFragment, selectionRange);
    
            editor.model.change((writer) => {
                try {
                    writer.setSelection(userSelection);
                } catch {
                    // Backup selection to use if userSelection became invalid after replacing content
                    // Usually userSelection should only become invalid if the document got shorter (its now out of bounds)
                    // so in that case we should put the cursor at the end of the last line in the document
                    let lastElement = editor.model.document
                        .getRoot()
                        .getChild(editor.model.document.getRoot().childCount - 1);
                    editor.model.change((writer) => {
                        writer.setSelection(lastElement, 'after');
                    });
                }
            });
        }
    
        // Keep track of this to check if document is really dirty in change:data event
        editor.savedData = editor.getData();
    }
    
    // Add listener for user modifying text in the editor
    editor.model.document.on('change:data', (e) => {
        handleSlashCommand();
        // This happens when the even was triggered by documentChanged event rather than user input
        if (editor.suppressNextDataChangeEvent) {
            editor.suppressNextDataChangeEvent = false;
            return;
        }
    
        const data = editor.getData();
        window.vscode.postMessage({
            type: 'webviewChanged',
            text: data,
        });
    
        editor.dirty = true;
    });
    
    let slashCommands = [];
    let filteredSlashCommands = [];
    let slashMenuActive = false;
    let selectedSlashCommandIndex = 0;
    const slashMenu = document.getElementById('slash-menu');
    
    // Handle messages sent from the extension to the webview
    window.addEventListener('message', (event) => {
        console.log('Recieved Message', { 'event.data': JSON.stringify(event.data) });
        const message = event.data; // The data that the extension sent
        switch (message.type) {
            case 'documentChanged': {
                const text = message.text;
                editor.suppressNextDataChangeEvent = true;
                setEditorContent(text);
    
                // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
                window.vscode.setState({ text });
                break;
            }
            case 'setSlashCommands': {
                slashCommands = message.commands;
                console.log('Slash commands set:', slashCommands);
                break;
            }
            case 'scrollChanged': {
                // TODO
            }
        }
    });
    
    editor.editing.view.document.on('keydown', (evt, data) => {
        if (slashMenuActive) {
            if (data.keyCode === 40) { // ArrowDown
                evt.stop();
                data.preventDefault();
                selectedSlashCommandIndex = (selectedSlashCommandIndex + 1) % filteredSlashCommands.length;
                updateSlashMenuSelection();
                return false;
            } else if (data.keyCode === 38) { // ArrowUp
                evt.stop();
                data.preventDefault();
                selectedSlashCommandIndex = (selectedSlashCommandIndex - 1 + filteredSlashCommands.length) % filteredSlashCommands.length;
                updateSlashMenuSelection();
                return false;
            } else if (data.keyCode === 13) { // Enter
                evt.stop();
                data.preventDefault();
                executeSlashCommand();
                return false;
            } else if (data.keyCode === 27) { // Escape
                evt.stop();
                data.preventDefault();
                hideSlashMenu();
                return false;
            }
        }
        
        // Close dropdowns on Escape
        if (data.keyCode === 27) { // Escape
            closeAllDropdowns();
        }
    }, { priority: 'highest' });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        const clickedElement = event.target;
        const isDropdownButton = clickedElement.closest('.ck-dropdown__button');
        const isDropdownPanel = clickedElement.closest('.ck-dropdown__panel');
        
        if (!isDropdownButton && !isDropdownPanel) {
            closeAllDropdowns();
        }
    });
    
    function closeAllDropdowns() {
        const openDropdowns = document.querySelectorAll('.ck-dropdown_open');
        openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('ck-dropdown_open');
            const panel = dropdown.querySelector('.ck-dropdown__panel');
            if (panel) {
                panel.classList.remove('ck-dropdown__panel_visible');
            }
        });
    }
    
        function handleSlashCommand() {
        if (!slashCommands || slashCommands.length === 0) {
            console.log('No slash commands available');
            return;
        }

        const selection = editor.model.document.selection;
        if (!selection.isCollapsed) {
            hideSlashMenu();
            return;
        }

        const position = selection.getFirstPosition();
        const parent = position.parent;
        
        // Get text content more reliably
        let textContent = '';
        let cursorOffset = position.offset;
        
        if (parent && parent.is && (parent.is('element', 'paragraph') || parent.is('element', 'heading1') || 
            parent.is('element', 'heading2') || parent.is('element', 'heading3') ||
            parent.is('element', 'heading4') || parent.is('element', 'heading5') ||
            parent.is('element', 'heading6') || parent.is('element', 'listItem'))) {
            
            // Extract text from the element
            for (const child of parent.getChildren()) {
                if (child.is('$text') && child.data) {
                    textContent += child.data;
                }
            }
        } else if (parent && parent.is && parent.is('$text') && parent.data) {
            textContent = parent.data;
            // Get the actual parent element to extract full text
            const grandParent = parent.parent;
            if (grandParent) {
                textContent = '';
                let currentOffset = 0;
                for (const child of grandParent.getChildren()) {
                    if (child.is('$text') && child.data) {
                        if (child === parent) {
                            cursorOffset = currentOffset + position.offset;
                        }
                        textContent += child.data;
                        currentOffset += child.data.length;
                    }
                }
            }
        }

        const textBeforeCursor = textContent.slice(0, cursorOffset);
        console.log('Text before cursor:', textBeforeCursor);

        // Look for slash commands at the end of the text
        const slashMatch = textBeforeCursor.match(/\/(\w*)$/);

        if (slashMatch) {
            const query = slashMatch[1].toLowerCase();
            console.log('Slash query:', query);
            
            filteredSlashCommands = slashCommands.filter(c => 
                c.trigger.toLowerCase().startsWith('/' + query)
            );
            
            console.log('Filtered commands:', filteredSlashCommands);

            if (filteredSlashCommands.length > 0) {
                showSlashMenu();
            } else {
                hideSlashMenu();
            }
        } else {
            hideSlashMenu();
        }
    }
    
        function showSlashMenu() {
        if (!slashMenu) {
            console.log('Slash menu element not found');
            return;
        }
        
        console.log('Showing slash menu with commands:', filteredSlashCommands);
        slashMenuActive = true;
        slashMenu.style.display = 'block';
        slashMenu.style.visibility = 'visible';
        slashMenu.style.opacity = '1';
        slashMenu.innerHTML = '';
        selectedSlashCommandIndex = 0;

        filteredSlashCommands.forEach((command, index) => {
            const item = document.createElement('div');
            item.className = 'slash-menu-item';
            if (index === selectedSlashCommandIndex) {
                item.classList.add('selected');
            }
            item.innerHTML = `<div class="slash-menu-trigger">${command.trigger}</div><div class="slash-menu-description">${command.description}</div>`;
            item.addEventListener('click', () => {
                selectedSlashCommandIndex = index;
                executeSlashCommand();
            });
            slashMenu.appendChild(item);
        });
        
        updateSlashMenuPosition();
    }
    
    function hideSlashMenu() {
        if (!slashMenu) return;
        slashMenuActive = false;
        slashMenu.style.display = 'none';
    }
    
    function updateSlashMenuSelection() {
        if (!slashMenu) return;
        for (let i = 0; i < slashMenu.children.length; i++) {
            const child = slashMenu.children[i];
            if (i === selectedSlashCommandIndex) {
                child.classList.add('selected');
            } else {
                child.classList.remove('selected');
            }
        }
    }
    
    function executeSlashCommand() {
        const command = filteredSlashCommands[selectedSlashCommandIndex];
        if (!command) {
            hideSlashMenu();
            return;
        }

        console.log('Executing slash command:', command);

        // Find and remove the slash command text
        let slashStartPosition = null;
        let slashEndPosition = null;

        editor.model.change(writer => {
            const selection = editor.model.document.selection;
            const position = selection.getFirstPosition();
            const parent = position.parent;
            
            // Get text content and find slash command
            let textContent = '';
            let cursorOffset = position.offset;
            
            if (parent.is('element')) {
                // Extract text from the element
                for (const child of parent.getChildren()) {
                    if (child.is('$text')) {
                        textContent += child.data;
                    }
                }
            } else if (parent.is('$text')) {
                // Get text from parent element
                const grandParent = parent.parent;
                if (grandParent) {
                    textContent = '';
                    let currentOffset = 0;
                    for (const child of grandParent.getChildren()) {
                        if (child.is('$text')) {
                            if (child === parent) {
                                cursorOffset = currentOffset + position.offset;
                            }
                            textContent += child.data;
                            currentOffset += child.data.length;
                        }
                    }
                }
            }

            const textBeforeCursor = textContent.slice(0, cursorOffset);
            const slashMatch = textBeforeCursor.match(/\/(\w*)$/);

            if (slashMatch) {
                const slashLength = slashMatch[0].length;
                slashStartPosition = position.getShiftedBy(-slashLength);
                slashEndPosition = position;
                
                // Remove the slash command text
                const range = writer.createRange(slashStartPosition, slashEndPosition);
                writer.remove(range);
                
                // Set cursor to where the slash was
                writer.setSelection(slashStartPosition);
            }
        });

        // Execute the command
        if (command.action) {
            try {
                console.log('Executing CKEditor command:', command.action);
                
                // Handle special commands that need parameters
                if (command.action === 'heading1') {
                    editor.execute('heading', { value: 'heading1' });
                } else if (command.action === 'heading2') {
                    editor.execute('heading', { value: 'heading2' });
                } else if (command.action === 'heading3') {
                    editor.execute('heading', { value: 'heading3' });
                } else if (command.action === 'heading4') {
                    editor.execute('heading', { value: 'heading4' });
                } else if (command.action === 'insertTable') {
                    editor.execute('insertTable', { rows: 2, columns: 2 });
                } else if (command.action === 'horizontalLine') {
                    // Only execute the command, don't insert replacement text
                    editor.execute('horizontalLine');
                } else if (command.action === 'bold' || command.action === 'italic' || command.action === 'code') {
                    // For formatting commands, just execute the command - no placeholder text
                    editor.execute(command.action);
                } else {
                    // Execute other commands directly
                    editor.execute(command.action);
                }
                
            } catch (error) {
                console.warn('Command execution failed, falling back to text replacement:', error);
                // Fallback to text replacement only if there's actual replacement text
                if (command.replacement && command.replacement.length > 0) {
                    editor.model.change(writer => {
                        const position = editor.model.document.selection.getFirstPosition();
                        writer.insertText(command.replacement, position);
                    });
                }
            }
        } else {
            // Fallback to text replacement for commands without actions
            if (command.replacement && command.replacement.length > 0) {
                console.log('Using text replacement:', command.replacement);
                editor.model.change(writer => {
                    const position = editor.model.document.selection.getFirstPosition();
                    writer.insertText(command.replacement, position);
                });
            }
        }

        hideSlashMenu();
    }
    
    function updateSlashMenuPosition() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
    
        if (!slashMenu) return;
        slashMenu.style.top = `${rect.bottom + window.scrollY}px`;
        slashMenu.style.left = `${rect.left + window.scrollX}px`;
    }
    
    
    // Webviews are normally torn down when not visible and re-created when they become visible again.
    // State lets us save information across these re-loads
    const state = window.vscode.getState();
    if (state) {
        setEditorContent(state.text);
    }
    
    window.vscode.postMessage({
        type: 'initialized',
    });
}
