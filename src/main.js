/**
 * @file src/main.js
 * @description Main entry point for the Live Markdown Editor application.
 *              Orchestrates the editor, preview, and local storage modules.
 *              Ensures real-time updates and persistence of markdown content.
 */

// Import necessary modules for editor, preview rendering, and local storage management.
import { initEditor, getEditorContent, onEditorChange } from './editor.js';
import { renderPreview } from './preview.js';
import { loadContent, saveContent } from './storage.js';

/**
 * @constant {string} STORAGE_KEY - The key used to store and retrieve markdown content from local storage.
 *                                  Prefixed to avoid conflicts with other potential applications
 *                                  (e.g., Drawing Board, Kanban Board) in a microservice-like ecosystem.
 */
const STORAGE_KEY = 'live-markdown-editor-content';

/**
 * @constant {number} DEBOUNCE_DELAY - The delay in milliseconds for debouncing editor input.
 *                                    This prevents excessive updates to local storage and the preview
 *                                    while the user is actively typing, improving performance.
 */
const DEBOUNCE_DELAY = 300; // milliseconds

// Global variables to hold references to DOM elements and the CodeMirror editor instance.
let editorElement;
let previewElement;
let editorInstance; // This will hold the CodeMirror editor instance

/**
 * @function debounce
 * @description Creates a debounced version of a function.
 *              The debounced function will only be called after a specified delay
 *              has passed since the last time it was invoked.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * @function initializeApp
 * @description Initializes the Live Markdown Editor application.
 *              This function performs the following steps:
 *              1. Retrieves references to the editor and preview DOM elements.
 *              2. Loads any previously saved markdown content from local storage.
 *              3. Initializes the CodeMirror editor with the loaded content or a default message.
 *              4. Renders the initial markdown content into the preview pane.
 *              5. Sets up an event listener to update the preview and local storage whenever
 *                 the editor's content changes, using a debounce mechanism for performance.
 */
function initializeApp() {
    // 1. Get DOM elements
    editorElement = document.getElementById('markdown-editor');
    previewElement = document.getElementById('preview-pane');

    // Basic error handling if required DOM elements are missing.
    if (!editorElement || !previewElement) {
        console.error('Initialization failed: Required DOM elements (#markdown-editor or #preview-pane) not found.');
        return;
    }

    // 2. Load initial content from storage.
    // If no content is found, provide a friendly default message.
    // The default message also includes a cross-project context reference.
    const initialContent = loadContent(STORAGE_KEY) ||
        '# Welcome to Live Markdown Editor!\n\nStart typing your **markdown** here.\n\n- Real-time preview\n- Syntax highlighting\n- Local storage persistence\n\n```javascript\nconsole.log("Hello, world!");\n```\n\nThis project is part of a larger ecosystem, including a [Drawing Board](/drawing-board) and a [Kanban Board](/kanban-board).';

    // 3. Initialize the CodeMirror editor with the retrieved content.
    editorInstance = initEditor(editorElement, initialContent);

    // 4. Render the initial content into the preview pane.
    renderPreview(previewElement, initialContent);

    // 5. Set up an event listener for editor content changes.
    // The `handleEditorChange` function is debounced to optimize performance.
    const handleEditorChange = debounce(() => {
        const currentContent = getEditorContent(editorInstance);
        saveContent(STORAGE_KEY, currentContent);
        renderPreview(previewElement, currentContent);
    }, DEBOUNCE_DELAY);

    // Attach the debounced change handler to the editor's 'change' event.
    onEditorChange(editorInstance, handleEditorChange);

    console.log('Live Markdown Editor initialized successfully.');
}

// Ensure the DOM is fully loaded before attempting to initialize the application.
// This prevents issues where scripts try to access elements that haven't been rendered yet.
document.addEventListener('DOMContentLoaded', initializeApp);