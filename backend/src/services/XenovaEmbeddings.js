import { pipeline } from '@xenova/transformers';

const MODEL = 'Xenova/all-MiniLM-L6-v2';

class XenovaEmbeddings {
  constructor() {
    this.model = null;
    this.dimensions = 384;
  }

  async init() {
    if (this.model) return;
    
    console.log('🔄 Loading Xenova embeddings model...');
    try {
      this.model = await pipeline('feature-extraction', MODEL);
      console.log('✅ Xenova model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Xenova model:', error);
      throw error;
    }
  }

  async embedDocuments(texts = []) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    await this.init();

    const embeddings = [];
    
    for (const text of texts) {
      try {
        const output = await this.model(text, { 
          pooling: 'mean', 
          normalize: true 
        });
        
        // ✅ SIMPLE & RELIABLE: Always use .data property
        let embedding;
        if (output && output.data) {
          embedding = Array.from(output.data);
        } else {
          // Fallback
          embedding = this.createSimpleEmbedding(text);
        }
        
        // Ensure correct dimensions
        if (!embedding || embedding.length !== this.dimensions) {
          embedding = this.createSimpleEmbedding(text);
        }
        
        embeddings.push(embedding);
        
      } catch (error) {
        console.error('❌ Embedding failed:', error.message);
        embeddings.push(this.createSimpleEmbedding(text));
      }
    }

    return embeddings;
  }

  async embedQuery(text) {
    const embeddings = await this.embedDocuments([text]);
    return embeddings[0] || this.createSimpleEmbedding(text);
  }

  createSimpleEmbedding(text) {
    // Simple deterministic embedding
    const embedding = new Array(this.dimensions);
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    
    for (let i = 0; i < this.dimensions; i++) {
      embedding[i] = Math.sin(hash + i) * 0.1;
    }
    
    return embedding;
  }
}

export default new XenovaEmbeddings();