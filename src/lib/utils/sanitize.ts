import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Used for rich text fields that are rendered with dangerouslySetInnerHTML
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div', 
      'pre', 'code', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      '*': ['class', 'style']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    // Disallow all protocol relative URLs
    allowProtocolRelative: false,
    // Only allow safe URL schemes  
    enforceHtmlBoundary: true,
  });
};
