import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import RedisService from './RedisService.js';

class AnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.redis = RedisService;
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
  }

  async analyzeSubject(input) {
    const cacheKey = `analysis:${input.subject._id}:${this.getDocumentsHash(input)}`;
    
    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      logger.info('Cache hit for analysis');
      return JSON.parse(cached);
    }

    const startTime = Date.now();
    
    try {
      const context = this.prepareAnalysisContext(input);
      const prompt = this.createAnalysisPrompt(context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisResult = this.parseAIResponse(response.text());

      const processingTime = Date.now() - startTime;

      const finalResult = {
        importantTopics: analysisResult.importantTopics || [],
        generatedQuestions: analysisResult.generatedQuestions || [],
        summary: analysisResult.summary || {},
        metadata: {
          processingTime,
          totalDocuments: input.notes.length + input.pyqs.length + (input.syllabus ? 1 : 0),
          modelVersion: 'gemini-pro',
          cacheHit: false,
          tokensUsed: this.estimateTokens(response.text())
        }
      };

      await this.redis.set(cacheKey, JSON.stringify(finalResult), 3600);

      return finalResult;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  prepareAnalysisContext(input) {
    let context = `Subject: ${input.subject.name}\n`;

    if (input.subject.description) {
      context += `Description: ${input.subject.description}\n`;
    }

    if (input.syllabus) {
      context += `\nSYLLABUS:\n${input.syllabus.content.substring(0, 2000)}\n`;
    }

    if (input.notes.length > 0) {
      context += `\nSTUDY NOTES:\n`;
      input.notes.forEach((note, index) => {
        context += `Note ${index + 1}:\n${note.content.substring(0, 1000)}\n\n`;
      });
    }

    if (input.pyqs.length > 0) {
      context += `\nPREVIOUS YEAR QUESTIONS:\n`;
      input.pyqs.forEach((pyq, index) => {
        context += `PYQ Set ${index + 1}:\n${pyq.content.substring(0, 1500)}\n\n`;
      });
    }

    return context;
  }

  createAnalysisPrompt(context) {
    return `
      You are an expert educational analyst. Analyze the following study materials and provide comprehensive insights:

      ${context}

      Please provide your analysis in the following JSON format:

      {
        "importantTopics": [
          {
            "topic": "string",
            "frequency": number (0-100),
            "weightage": number (0-100),
            "priority": "high" | "medium" | "low",
            "confidence": number (0-1),
            "trend": "increasing" | "decreasing" | "stable",
            "lastAppeared": number (year if available),
            "recommendedStudyTime": "string"
          }
        ],
        "generatedQuestions": [
          {
            "id": "unique-id",
            "question": "string",
            "type": "definition" | "application" | "derivation" | "problem",
            "marks": number,
            "difficulty": "easy" | "medium" | "hard",
            "topic": "string",
            "learningOutcome": "string",
            "modelUsed": "gemini-pro",
            "estimatedTime": number
          }
        ],
        "summary": {
          "overview": "string",
          "keyConcepts": ["string"],
          "studyRecommendations": ["string"],
          "estimatedPreparationTime": "string"
        }
      }

      Guidelines:
      - Be accurate and educational
      - Focus on exam patterns and important concepts
      - Generate 5-8 important topics
      - Generate 10-15 practice questions covering different types
      - Provide actionable study recommendations
    `;
  }

  parseAIResponse(response) {
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/({[\s\S]*})/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      throw new Error('Invalid response format from AI service');
    }
  }

  getDocumentsHash(input) {
    const contents = [
      input.syllabus?.content || '',
      ...input.notes.map(n => n.content),
      ...input.pyqs.map(p => p.content)
    ].join('|');
    
    return Buffer.from(contents).toString('base64').substring(0, 50);
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
}

export default new AnalysisService();