/**
 * @file src/storage.js
 * @description Handles local storage persistence for the Live Markdown Editor.
 *              Provides functions to save, load, and clear markdown content.
 */

/**
 * The key used to store the markdown content in local storage.
 * It's good practice to make this unique to avoid conflicts with other applications
 * or other parts of a larger system that might use local storage.
 *
 * @type {string}
 */
const MARKDOWN_STORAGE_KEY = 'live-markdown-editor-content';

/**
 * Saves the provided markdown content to local storage.
 *
 * @param {string} content - The markdown text to be saved.
 * @returns {boolean} True if the content was saved successfully, false otherwise.
 */
export function saveContent(content) {
  try {
    localStorage.setItem(MARKDOWN_STORAGE_KEY, content);
    console.log('Markdown content saved to local storage.');
    return true;
  } catch (error) {
    console.error('Failed to save markdown content to local storage:', error);
    // Handle specific errors like QuotaExceededError
    if (error.name === 'QuotaExceededError') {
      alert('Local storage quota exceeded. Could not save content.');
    }
    return false;
  }
}

/**
 * Loads the markdown content from local storage.
 *
 * @returns {string} The loaded markdown content, or an empty string if no content is found
 *                   or an error occurs during loading.
 */
export function loadContent() {
  try {
    const content = localStorage.getItem(MARKDOWN_STORAGE_KEY);
    if (content !== null) {
      console.log('Markdown content loaded from local storage.');
      return content;
    } else {
      console.log('No markdown content found in local storage.');
      return ''; // Return empty string if no content is found
    }
  } catch (error) {
    console.error('Failed to load markdown content from local storage:', error);
    // In case of security errors or other issues preventing access to localStorage
    return ''; // Return empty string on error
  }
}

/**
 * Clears the markdown content from local storage.
 *
 * @returns {boolean} True if the content was cleared successfully, false otherwise.
 */
export function clearContent() {
  try {
    localStorage.removeItem(MARKDOWN_STORAGE_KEY);
    console.log('Markdown content cleared from local storage.');
    return true;
  } catch (error) {
    console.error('Failed to clear markdown content from local storage:', error);
    return false;
  }
}

// You might also export the key itself if other modules need to reference it
// for debugging or specific interactions, though generally not necessary for this project.
// export const storageKey = MARKDOWN_STORAGE_KEY;