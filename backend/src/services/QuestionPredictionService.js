import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import ChromaService from './ChromaService.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/index.js';

class QuestionPredictionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.chatModel = new ChatGoogleGenerativeAI({
      modelName: "gemini-pro",
      maxOutputTokens: 2048,
      temperature: 0.3,
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async analyzeSubject(subjectId) {
    try {
      logger.info(`Starting advanced analysis for subject: ${subjectId}`);

      // Step 1: Find important topics using semantic search
      const importantTopics = await this.findImportantTopics(subjectId);
      
      // Step 2: Get PYQ patterns
      const pyqPatterns = await this.analyzePYQPatterns(subjectId);
      
      // Step 3: Predict questions based on patterns
      const predictions = await this.predictQuestions(
        importantTopics, 
        pyqPatterns, 
        subjectId
      );

      return {
        importantTopics,
        predictions,
        patterns: pyqPatterns,
        metadata: {
          analysisType: "advanced_pattern_analysis",
          topicsAnalyzed: importantTopics.length,
          patternsFound: Object.keys(pyqPatterns).length,
        }
      };
    } catch (error) {
      logger.error("Advanced analysis failed:", error);
      throw new ApiError(500, "Advanced analysis failed: " + error.message);
    }
  }

  async findImportantTopics(subjectId) {
    try {
      // Search for important topics
      const results = await ChromaService.semanticSearch(
        "important topics concepts frequently asked questions",
        subjectId,
        {},
        10
      );

      // Extract topics from results
      const topics = this.extractTopicsFromResults(results);
      return topics.slice(0, 8);
    } catch (error) {
      logger.error("Failed to find important topics:", error);
      return [];
    }
  }

  extractTopicsFromResults(results) {
    const topicFrequency = {};
    
    results.forEach(result => {
      const content = result.pageContent.toLowerCase();
      
      // Simple topic extraction
      const lines = content.split('\n').slice(0, 5);
      lines.forEach(line => {
        if (line.includes('chapter') || line.includes('topic') || line.includes('unit')) {
          const topic = line.trim().substring(0, 100);
          if (topic.length > 10) {
            topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
          }
        }
      });
    });

    return Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .map(([topic, frequency]) => ({ topic, frequency }));
  }

  async analyzePYQPatterns(subjectId) {
    try {
      const results = await ChromaService.semanticSearch(
        "question pattern marks distribution important topics",
        subjectId,
        { type: 'pyq' },
        10
      );

      return this.extractPatternsFromResults(results);
    } catch (error) {
      logger.error("PYQ pattern analysis failed:", error);
      return {};
    }
  }

  extractPatternsFromResults(results) {
    const patterns = {
      marksDistribution: {},
      questionTypes: {},
      frequentTopics: []
    };

    results.forEach(result => {
      const content = result.pageContent;
      
      // Extract marks
      const markMatch = content.match(/(\d+)\s*marks?/gi);
      if (markMatch) {
        markMatch.forEach(markStr => {
          const marks = parseInt(markStr.match(/\d+/)[0]);
          patterns.marksDistribution[marks] = (patterns.marksDistribution[marks] || 0) + 1;
        });
      }

      // Detect question type
      const type = this.detectQuestionType(content);
      patterns.questionTypes[type] = (patterns.questionTypes[type] || 0) + 1;
    });

    return patterns;
  }

  detectQuestionType(content) {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('define') || contentLower.includes('definition')) {
      return 'definition';
    } else if (contentLower.includes('derive') || contentLower.includes('derivation')) {
      return 'derivation';
    } else if (contentLower.includes('calculate') || contentLower.includes('solve')) {
      return 'problem';
    } else if (contentLower.includes('explain') || contentLower.includes('describe')) {
      return 'explanation';
    } else {
      return 'application';
    }
  }

  async predictQuestions(importantTopics, patterns, subjectId) {
    try {
      const prompt = this.createPredictionPrompt(importantTopics, patterns);
      
      const response = await this.chatModel.call([{ role: "user", content: prompt }]);
      
      return this.parsePredictionResponse(response.content);
    } catch (error) {
      logger.error("Question prediction failed:", error);
      return this.fallbackPrediction(importantTopics);
    }
  }

  createPredictionPrompt(importantTopics, patterns) {
    return `
      You are an expert educational analyst. Analyze these patterns and predict questions:

      IMPORTANT TOPICS:
      ${JSON.stringify(importantTopics, null, 2)}

      PATTERNS FOUND:
      ${JSON.stringify(patterns, null, 2)}

      Predict 5-8 most likely questions with:
      - Question text
      - Type (definition/derivation/problem/explanation/application)
      - Expected marks
      - Confidence level (1-5)
      - Reasoning

      Return as JSON array.
    `;
  }

  parsePredictionResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      logger.error("Failed to parse prediction response:", error);
      return this.fallbackPrediction([]);
    }
  }

  fallbackPrediction(importantTopics) {
    return importantTopics.slice(0, 5).map((topic, index) => ({
      question: `Explain ${topic.topic} with examples`,
      type: 'explanation',
      marks: 5,
      confidence: 3,
      reasoning: 'Based on topic frequency analysis'
    }));
  }
}

export default new QuestionPredictionService();