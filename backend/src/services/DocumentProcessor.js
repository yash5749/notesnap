import {PDFParse }from 'pdf-parse';
import fs from 'fs/promises';
import logger from '../utils/logger.js';

class DocumentProcessor {
  constructor() {
    this.supportedMimeTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  async processDocument(filePath, mimeType) {
    try {
      if (!this.supportedMimeTypes.includes(mimeType)) {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      let content = '';
      let metadata = { wordCount: 0 };

      switch (mimeType) {
        case 'application/pdf':
          const result = await this.processPDF(filePath);
          content = result.content;
          metadata = { ...metadata, ...result.metadata };
          break;

        case 'text/plain':
          content = await fs.readFile(filePath, 'utf-8');
          break;

        default:
          throw new Error(`Processing for ${mimeType} not yet implemented`);
      }

      // Basic content cleaning and analysis
      content = this.cleanContent(content);
      metadata.wordCount = this.countWords(content);
      metadata.topics = this.extractTopics(content);

      return { content, metadata };
    } catch (error) {
      logger.error('Document processing failed:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  async processPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await PDFParse(dataBuffer);
      
      return {
        content: data.text,
        metadata: {
          pages: data.numpages,
          wordCount: data.text.split(/\s+/).length
        }
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  cleanContent(content) {
    return content
      .replace(/\s+/g, ' ')
      .replace(/[^\S\r\n]+/g, ' ')
      .trim();
  }

  countWords(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  extractTopics(content) {
    const lines = content.split('\n').slice(0, 20);
    const topics = [];
    const topicKeywords = ['chapter', 'unit', 'topic', 'module', 'part'];

    lines.forEach(line => {
      if (line.trim().length > 10) {
        topicKeywords.forEach(keyword => {
          if (line.toLowerCase().includes(keyword)) {
            const topic = line.trim().substring(0, 100);
            if (!topics.includes(topic)) {
              topics.push(topic);
            }
          }
        });
      }
    });

    return topics.slice(0, 10);
  }

  async validateFile(file) {
    if (!this.supportedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
  }
}

export default new DocumentProcessor();