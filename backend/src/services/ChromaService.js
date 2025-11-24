import { ChromaClient } from 'chromadb';
import XenovaEmbeddings from './XenovaEmbeddings.js';

const COLLECTION_NAME = 'study_materials_final';

class ChromaService {
  constructor() {
    this.client = null;
    this.collection = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      console.log('🔄 Initializing ChromaDB client...');
      
      // ✅ Connect to ChromaDB server directly
      this.client = new ChromaClient({
        host: 'localhost',
        port: 8000
      });

      // ✅ Check if collection exists
      const collections = await this.client.listCollections();
      const existing = collections.find(c => c.name === COLLECTION_NAME);

      if (existing) {
        this.collection = existing;
        console.log('✅ Using existing collection');
      } else {
        // ✅ Create new collection
        this.collection = await this.client.createCollection({
          name: COLLECTION_NAME,
          metadata: {
            description: "Study materials for AI learning assistant",
            created: new Date().toISOString()
          }
        });
        console.log('✅ Created new collection');
      }

      this.initialized = true;
      return true;

    } catch (error) {
      console.error('❌ ChromaDB initialization failed:', error.message);
      this.initialized = false;
      return false;
    }
  }

  async addDocuments(rawDocs = []) {
    try {
      await this.initialize();
      
      const validDocs = rawDocs.filter(doc => 
        doc.content && doc.content.trim().length > 50
      );

      if (validDocs.length === 0) {
        console.log('⚠️ No valid documents to add');
        return 0;
      }

      console.log(`📄 Processing ${validDocs.length} documents...`);

      // Extract texts for embedding
      const texts = validDocs.map(doc => doc.content.substring(0, 4000));
      
      // ✅ Generate embeddings using Xenova
      const embeddings = await XenovaEmbeddings.embedDocuments(texts);
      
      // Prepare data for ChromaDB
      const ids = validDocs.map((_, index) => `doc_${Date.now()}_${index}`);
      const metadatas = validDocs.map(doc => ({
        documentId: doc._id?.toString() || '',
        subjectId: doc.subjectId?.toString() || '',
        documentType: doc.documentType || '',
        originalName: doc.originalName || '',
        uploadedAt: new Date().toISOString()
      }));

      // ✅ Add to ChromaDB
      await this.collection.add({
        ids,
        embeddings,
        metadatas,
        documents: texts
      });

      console.log(`✅ Successfully added ${validDocs.length} documents to ChromaDB`);
      return validDocs.length;

    } catch (error) {
      console.error('❌ Failed to add documents:', error.message);
      return 0;
    }
  }

  async findSimilarQuestions(query, subjectId, limit = 5) {
    try {
      await this.initialize();

      console.log(`🔍 Searching for: "${query}"`);

      // ✅ Generate query embedding
      const queryEmbedding = await XenovaEmbeddings.embedQuery(query);
      
      // ✅ Search in ChromaDB
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: subjectId ? { subjectId: subjectId.toString() } : undefined
      });

      // Format results
      const formattedResults = results.documents[0].map((doc, index) => ({
        pageContent: doc,
        metadata: results.metadatas[0][index] || {},
        distance: results.distances[0][index] || 0
      }));

      console.log(`✅ Found ${formattedResults.length} similar questions`);
      return formattedResults;

    } catch (error) {
      console.error('❌ Similar questions search failed:', error.message);
      return [];
    }
  }

  async getCollectionStats() {
    try {
      await this.initialize();
      
      const count = await this.collection.count();
      
      return {
        count,
        collection: COLLECTION_NAME,
        ready: this.initialized,
        type: 'chromadb_direct'
      };
    } catch (error) {
      return {
        count: 0,
        ready: false,
        error: error.message
      };
    }
  }

  async isChromaAvailable() {
    return await this.initialize();
  }

  reset() {
    this.initialized = false;
    this.client = null;
    this.collection = null;
  }
}

export default new ChromaService();