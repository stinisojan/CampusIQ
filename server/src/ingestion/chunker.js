const config = require('../config/env');

/**
 * Splits extracted document pages into semantic chunks with metadata
 * @param {Array<{ pageNumber: number, text: string, section?: string }>} pages
 * @param {Object} options - { chunkSize, chunkOverlap, department, filename }
 * @returns {Array<{ chunkIndex: number, text: string, page: string, section: string, department: string, filename: string }>}
 */
const createChunksFromPages = (pages, options = {}) => {
  const chunkSize = options.chunkSize || config.CHUNK_SIZE || 700;
  const chunkOverlap = options.chunkOverlap || config.CHUNK_OVERLAP || 150;
  const department = options.department || 'General';
  const filename = options.filename || 'Document';

  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const pageText = page.text.trim();
    if (!pageText) continue;

    // Detect primary headings or sections on this page
    const lines = pageText.split('\n').map((l) => l.trim()).filter(Boolean);
    let currentSection = page.section || (lines[0] ? lines[0].slice(0, 50) : 'General');

    // Split text into paragraphs
    const paragraphs = pageText.split(/\n\s*\n/);
    let currentChunkText = '';

    for (const paragraph of paragraphs) {
      const cleanPara = paragraph.replace(/\s+/g, ' ').trim();
      if (!cleanPara) continue;

      // Check if paragraph looks like a section header (e.g. "3. Admissions Policy" or "## Hostel Rules")
      if (cleanPara.length < 60 && (/^(\d+(\.\d+)*|[A-Z\s]{3,}|#+)\s+/i.test(cleanPara) || cleanPara.endsWith(':'))) {
        currentSection = cleanPara;
      }

      if ((currentChunkText + ' ' + cleanPara).length <= chunkSize) {
        currentChunkText = currentChunkText ? `${currentChunkText}\n\n${cleanPara}` : cleanPara;
      } else {
        if (currentChunkText.length >= 100) {
          chunks.push({
            chunkIndex: chunkIndex++,
            text: currentChunkText.trim(),
            page: String(page.pageNumber || 1),
            section: currentSection,
            department,
            filename,
          });

          // Compute overlap
          const words = currentChunkText.split(' ');
          const overlapWords = words.slice(-Math.floor(chunkOverlap / 6)).join(' ');
          currentChunkText = overlapWords ? `${overlapWords} ${cleanPara}` : cleanPara;
        } else {
          // If paragraph itself is longer than chunkSize, split by sentences
          const sentences = cleanPara.match(/[^.!?]+[.!?]+(\s|$)/g) || [cleanPara];
          for (const sentence of sentences) {
            if ((currentChunkText + ' ' + sentence).length <= chunkSize) {
              currentChunkText = currentChunkText ? `${currentChunkText} ${sentence}` : sentence;
            } else {
              if (currentChunkText.trim()) {
                chunks.push({
                  chunkIndex: chunkIndex++,
                  text: currentChunkText.trim(),
                  page: String(page.pageNumber || 1),
                  section: currentSection,
                  department,
                  filename,
                });
              }
              currentChunkText = sentence;
            }
          }
        }
      }
    }

    if (currentChunkText.trim().length > 50) {
      chunks.push({
        chunkIndex: chunkIndex++,
        text: currentChunkText.trim(),
        page: String(page.pageNumber || 1),
        section: currentSection,
        department,
        filename,
      });
    }
  }

  // Fallback: If no chunks produced (e.g. very small document)
  if (chunks.length === 0 && pages.length > 0) {
    const full = pages.map((p) => p.text).join('\n\n').trim();
    if (full) {
      chunks.push({
        chunkIndex: 0,
        text: full.slice(0, chunkSize),
        page: '1',
        section: 'General',
        department,
        filename,
      });
    }
  }

  return chunks;
};

module.exports = { createChunksFromPages };
