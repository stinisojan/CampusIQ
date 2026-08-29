/**
 * Context Assembler: Deduplicates, ranks, and formats chunks into an LLM context payload
 */
const assembleContext = (chunks, maxChars = 4000) => {
  if (!chunks || chunks.length === 0) {
    return {
      contextText: '',
      sources: [],
      hasContext: false,
    };
  }

  const seenSnippets = new Set();
  const validChunks = [];
  const sources = [];

  let accumulatedLength = 0;

  for (const chunk of chunks) {
    const textSnippet = chunk.text.trim();
    // Simple hash to avoid exact duplicates
    const snippetKey = textSnippet.slice(0, 80).toLowerCase();

    if (seenSnippets.has(snippetKey)) {
      continue;
    }
    seenSnippets.add(snippetKey);

    if (accumulatedLength + textSnippet.length > maxChars && validChunks.length > 0) {
      break;
    }

    validChunks.push(chunk);
    accumulatedLength += textSnippet.length;

    // Create source citation object
    sources.push({
      documentId: chunk.metadata?.documentId,
      filename: chunk.metadata?.filename || 'Document',
      snippet: textSnippet.slice(0, 220) + (textSnippet.length > 220 ? '...' : ''),
      page: String(chunk.metadata?.page || '1'),
      section: String(chunk.metadata?.section || 'General'),
      score: chunk.score,
    });
  }

  // Format context for LLM prompt
  const contextText = validChunks
    .map((chunk, index) => {
      const fn = chunk.metadata?.filename || 'Campus Document';
      const pg = chunk.metadata?.page || '1';
      const sec = chunk.metadata?.section || 'General';
      return `--- [SOURCE DOCUMENT ${index + 1}: ${fn} | Page: ${pg} | Section: ${sec}] ---\n${chunk.text}`;
    })
    .join('\n\n');

  return {
    contextText,
    sources,
    hasContext: validChunks.length > 0,
  };
};

module.exports = { assembleContext };
