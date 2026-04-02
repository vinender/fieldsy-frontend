/**
 * Utility function to format text with line breaks
 * Converts newline characters to React elements
 */
export function formatTextWithLineBreaks(text: string | undefined | null): (string | JSX.Element)[] {
  if (!text) return [''];

  return text.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </span>
  ));
}

/**
 * Simple function that just preserves whitespace in CSS
 * Use this with className="whitespace-pre-wrap break-words"
 */
export function getTextWithWhitespace(text: string | undefined | null): string {
  return text || '';
}
