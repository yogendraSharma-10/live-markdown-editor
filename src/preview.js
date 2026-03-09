import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

/**
 * Retrieves the DOM element designated for displaying the rendered markdown preview.
 * This element is expected to have the ID 'preview' in the index.html file.
 * @type {HTMLElement | null}
 */
const previewElement = document.getElementById('preview');

// --- Configuration for marked.js ---
// marked.js is used to convert markdown text into HTML.
// We configure it to integrate with highlight.js for code block syntax highlighting
// and to use GitHub Flavored Markdown (GFM) features.
marked.setOptions({
  /**
   * Custom highlight function for marked.js.
   * It uses highlight.js to detect and highlight code blocks.
   * @param {string} code - The raw code string from the markdown block.
   * @param {string} lang - The language specified for the code block (e.g., 'javascript', 'python').
   * @returns {string} The HTML-highlighted code.
   */
  highlight: function(code, lang) {
    // Check if highlight.js supports the specified language.
    // If not, default to 'plaintext' to avoid errors and still display the code.
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    try {
      // Highlight the code and return its HTML representation.
      return hljs.highlight(code, { language }).value;
    } catch (error) {
      // Log any errors during highlighting, but still return the original code
      // to prevent breaking the preview.
      console.warn(`Highlighting failed for language "${lang}":`, error);
      return code;
    }
  },
  langPrefix: 'hljs language-', // Prefix for highlight.js CSS classes (e.g., <code class="hljs language-javascript">)
  gfm: true, // Enable GitHub Flavored Markdown (tables, task lists, strikethrough).
  breaks: true, // Convert newlines to <br> tags in GFM.
  // marked's built-in sanitization is less robust than DOMPurify.
  // We rely on DOMPurify for comprehensive HTML sanitization after markdown parsing.
  // sanitize: false, // Explicitly disable marked's internal sanitization if DOMPurify is used.
});

/**
 * Renders the provided markdown text into the designated preview pane.
 * This function performs the following steps:
 * 1. Converts the markdown text to raw HTML using `marked.js`.
 * 2. Sanitizes the generated HTML using `DOMPurify` to prevent Cross-Site Scripting (XSS) vulnerabilities.
 * 3. Updates the `innerHTML` of the preview element with the sanitized HTML.
 *
 * If the preview element is not found, an error is logged to the console.
 *
 * @param {string} markdownText - The markdown string to be rendered.
 */
export function renderPreview(markdownText) {
  if (!previewElement) {
    console.error('Preview element with ID "preview" not found. Cannot render markdown.');
    return;
  }

  // Step 1: Convert markdown to raw HTML.
  // marked.parse() returns a string of HTML.
  const rawHtml = marked.parse(markdownText || ''); // Handle empty or null input gracefully

  // Step 2: Sanitize the raw HTML using DOMPurify.
  // This is crucial for security, especially if markdown content can come from untrusted sources.
  // DOMPurify removes potentially malicious scripts, attributes, and tags.
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true }, // Use a common HTML profile for allowed elements/attributes.
    // Explicitly forbid common XSS vectors, though DOMPurify is robust by default.
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onmouseover', 'onfocus', 'onblur', 'onclick', 'onchange', 'onsubmit'],
  });

  // Step 3: Update the preview element's content with the sanitized HTML.
  previewElement.innerHTML = cleanHtml;
}

// Optional: Initial check to ensure the preview element exists when the script loads.
// This helps catch configuration issues early.
if (!previewElement) {
  console.warn('Preview element with ID "preview" was not found when src/preview.js loaded. ' +
               'Ensure index.html contains <div id="preview"></div>.');
}