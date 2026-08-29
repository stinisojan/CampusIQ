const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

/**
 * Extracts text content and metadata from PDF, DOCX, TXT, MD, and image files (with OCR fallback)
 * @param {string} filePath 
 * @param {string} mimeType 
 * @returns {Promise<{ text: string, pages: Array<{ pageNumber: number, text: string, section?: string }>, numPages: number }>}
 */
const extractTextFromFile = async (filePath, mimeType) => {
  const ext = path.extname(filePath).toLowerCase();

  // 1. OCR for Raw Image Files (.png, .jpg, .jpeg)
  if (['.png', '.jpg', '.jpeg'].includes(ext) || (mimeType && mimeType.startsWith('image/'))) {
    console.log(`[TextExtractor] Running Tesseract OCR on image file: ${filePath}`);
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    const cleanText = text.trim();
    return {
      text: cleanText,
      pages: [{ pageNumber: 1, text: cleanText }],
      numPages: 1,
    };
  }

  // 2. PDF Extraction with Scanned OCR Fallback
  if (ext === '.pdf' || mimeType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const pageTexts = [];

    const options = {
      pagerender: function (pageData) {
        return pageData.getTextContent().then(function (textContent) {
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY === item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          pageTexts.push({
            pageNumber: pageData.pageIndex + 1,
            text: text.trim(),
          });
          return text;
        });
      },
    };

    const pdfData = await pdfParse(dataBuffer, options);
    let fullText = pdfData.text ? pdfData.text.trim() : '';

    // If pdf-parse extracts minimal/zero text, run OCR fallback on scanned pages
    if (!fullText || fullText.length < 50) {
      console.log(`[TextExtractor] Low text extracted. Scanned PDF detected (${filePath}). Executing OCR...`);
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      fullText = text.trim();
      return {
        text: fullText,
        pages: [{ pageNumber: 1, text: fullText }],
        numPages: pdfData.numpages || 1,
      };
    }

    return {
      text: fullText,
      pages: pageTexts.length > 0 ? pageTexts : [{ pageNumber: 1, text: fullText }],
      numPages: pdfData.numpages || 1,
    };
  }

  // 3. Word Documents (.docx)
  if (
    ext === '.docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    const fullText = result.value;
    const sections = fullText.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
    const pages = sections.map((sec, idx) => ({
      pageNumber: Math.floor(idx / 4) + 1,
      section: sec.slice(0, 40).replace(/\n/g, ' '),
      text: sec,
    }));

    return {
      text: fullText,
      pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
      numPages: Math.ceil(pages.length / 4) || 1,
    };
  }

  // 4. Plain Text & Markdown (.txt, .md)
  if (ext === '.txt' || ext === '.md' || mimeType === 'text/plain' || mimeType === 'text/markdown') {
    const fullText = fs.readFileSync(filePath, 'utf-8');
    return {
      text: fullText,
      pages: [{ pageNumber: 1, text: fullText }],
      numPages: 1,
    };
  }

  throw new Error(`Unsupported file type: ${ext} (${mimeType})`);
};

module.exports = { extractTextFromFile };