import { updatePreview } from './preview.js';
import { saveContent } from './storage.js';

/**
 * @file src/editor.js
 * @description Manages the markdown editor's core functionality, including
 *              initializing the editor, handling user input, and debouncing
 *              updates to the preview and local storage.
 */

/**
 * The HTML textarea element used for markdown input.
 * @type {HTMLTextAreaElement | null}
 */
let editorElement = null;

/**
 * Timeout ID for debouncing input events.
 * @type {number | null}
 */
let debounceTimeout = null;

/**
 * The delay in milliseconds for debouncing input events.
 * This helps prevent excessive updates to the preview and storage
 * while the user is actively typing.
 * @type {number}
 */
const DEBOUNCE_DELAY_MS = 300;

/**
 * Initializes the markdown editor.
 * Locates the editor element, sets its initial content, and attaches an event listener
 * for user input. It also triggers an initial update to ensure the preview and
 * storage reflect the starting content.
 *
 * @param {string} initialContent - The content to load into the editor initially.
 */
export function initEditor(initialContent = '') {
    editorElement = document.getElementById('markdown-editor');

    if (!editorElement) {
        console.error('Markdown editor element not found. Ensure an element with id "markdown-editor" exists.');
        return;
    }

    editorElement.value = initialContent;
    editorElement.addEventListener('input', handleEditorInput);

    // Immediately update preview and storage with initial content.
    // This ensures the preview is rendered and content is saved even if the user doesn't type.
    updateContent(initialContent);

    console.log('Markdown editor initialized and ready for input.');
}

/**
 * Handles input events from the editor textarea.
 * This function implements a debounce mechanism to limit the frequency of
 * calls to `updateContent`, improving performance and user experience.
 *
 * @param {Event} event - The input event object from the textarea.
 */
function handleEditorInput(event) {
    const markdownText = event.target.value;

    // Clear any existing debounce timeout to reset the timer
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    // Set a new debounce timeout. The `updateContent` function will be called
    // only after the user stops typing for `DEBOUNCE_DELAY_MS`.
    debounceTimeout = setTimeout(() => {
        updateContent(markdownText);
    }, DEBOUNCE_DELAY_MS);
}

/**
 * Propagates the current markdown text to the preview component and the storage module.
 * This function is called after the debounce delay has passed.
 *
 * @param {string} markdownText - The current markdown text from the editor.
 */
function updateContent(markdownText) {
    // Update the real-time rendered preview pane
    updatePreview(markdownText);

    // Save the content to local storage for persistence
    saveContent(markdownText);

    // Optional: Log a snippet of the updated content for debugging
    // console.log('Editor content updated and propagated:', markdownText.substring(0, Math.min(markdownText.length, 50)) + (markdownText.length > 50 ? '...' : ''));
}

/**
 * Retrieves the current content from the editor textarea.
 * This function can be used by other modules if they need to explicitly
 * pull the current state of the editor.
 *
 * @returns {string} The current markdown text in the editor. Returns an empty string
 *                   if the editor element has not been initialized.
 */
export function getEditorContent() {
    return editorElement ? editorElement.value : '';
}