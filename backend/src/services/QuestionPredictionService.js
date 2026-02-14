// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import ChromaService from './ChromaService.js';
// import logger from '../utils/logger.js';
// import { ApiError } from '../utils/index.js';

// class QuestionPredictionService {
//   constructor() {
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     this.chatModel = new ChatGoogleGenerativeAI({
//       modelName: process.env.GEMINI_MODEL,
//       maxOutputTokens: 2048,
//       temperature: 0.3,
//       apiKey: process.env.GEMINI_API_KEY,
//     });
//   }

//   async analyzeSubject(subjectId) {
//     try {
//       logger.info(`Starting advanced analysis for subject: ${subjectId}`);

//       // Step 1: Find important topics using semantic search
//       const importantTopics = await this.findImportantTopics(subjectId);
      
//       // Step 2: Get PYQ patterns
//       const pyqPatterns = await this.analyzePYQPatterns(subjectId);
      
//       // Step 3: Predict questions based on patterns
//       const predictions = await this.predictQuestions(
//         importantTopics, 
//         pyqPatterns, 
//         subjectId
//       );

//       return {
//         importantTopics,
//         predictions,
//         patterns: pyqPatterns,
//         metadata: {
//           analysisType: "advanced_pattern_analysis",
//           topicsAnalyzed: importantTopics.length,
//           patternsFound: Object.keys(pyqPatterns).length,
//         }
//       };
//     } catch (error) {
//       logger.error("Advanced analysis failed:", error);
//       throw new ApiError(500, "Advanced analysis failed: " + error.message);
//     }
//   }

//   // async findImportantTopics(subjectId) {
//   //   try {
//   //     // Search for important topics
//   //     const results = await ChromaService.findSimilarQuestions(
//   //       "important topics concepts frequently asked questions",
//   //       subjectId,
//   //       {},
//   //       10
//   //     );

//   //     // Extract topics from results
//   //     const topics = this.extractTopicsFromResults(results);
//   //     return topics.slice(0, 8);
//   //   } catch (error) {
//   //     logger.error("Failed to find important topics:", error);
//   //     return [];
//   //   }
//   // }

//   async findImportantTopics(subjectId) {
//   const results = await ChromaService.findSimilarQuestions(
//     "important topics concepts syllabus",
//     subjectId,
//     15
//   );

//   const topicMap = {};

//   for (const r of results) {
//     const text = r.pageContent.toLowerCase();

//     text.split('\n').forEach(line => {
//       if (line.length < 20) return;

//       const cleaned = line.trim().slice(0, 80);
//       topicMap[cleaned] = (topicMap[cleaned] || 0) + 1;
//     });
//   }

//   return Object.entries(topicMap)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 6)
//     .map(([topic, frequency]) => ({
//       topic,
//       frequency,
//       weightage: Math.min(frequency * 10, 100),
//       priority: frequency > 3 ? 'high' : 'medium',
//       confidence: 0.7,
//       trend: 'stable'
//     }));
// }


//   extractTopicsFromResults(results) {
//     const topicFrequency = {};
    
//     results.forEach(result => {
//       const content = result.pageContent.toLowerCase();
      
//       // Simple topic extraction
//       const lines = content.split('\n').slice(0, 5);
//       lines.forEach(line => {
//         if (line.includes('chapter') || line.includes('topic') || line.includes('unit')) {
//           const topic = line.trim().substring(0, 100);
//           if (topic.length > 10) {
//             topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
//           }
//         }
//       });
//     });

//     return Object.entries(topicFrequency)
//       .sort(([,a], [,b]) => b - a)
//       .map(([topic, frequency]) => ({ topic, frequency }));
//   }

//   // async analyzePYQPatterns(subjectId) {
//   //   try {
//   //     const results = await ChromaService.findSimilarQuestions(
//   //       "question pattern marks distribution important topics",
//   //       subjectId,
//   //       { type: 'pyq' },
//   //       10
//   //     );

//   //     return this.extractPatternsFromResults(results);
//   //   } catch (error) {
//   //     logger.error("PYQ pattern analysis failed:", error);
//   //     return {};
//   //   }
//   // }

//   async analyzePYQPatterns(subjectId) {
//   const results = await ChromaService.findSimilarQuestions(
//     "previous year question marks",
//     subjectId,
//     10
//   );

//   const patterns = {
//     marksDistribution: {},
//     questionTypes: {}
//   };

//   for (const r of results) {
//     const text = r.pageContent.toLowerCase();

//     const marks = text.match(/(\d+)\s*marks?/);
//     if (marks) {
//       const m = Number(marks[1]);
//       patterns.marksDistribution[m] =
//         (patterns.marksDistribution[m] || 0) + 1;
//     }

//     const type = this.detectQuestionType(text);
//     patterns.questionTypes[type] =
//       (patterns.questionTypes[type] || 0) + 1;
//   }

//   return patterns;
// }


//   extractPatternsFromResults(results) {
//     const patterns = {
//       marksDistribution: {},
//       questionTypes: {},
//       frequentTopics: []
//     };

//     results.forEach(result => {
//       const content = result.pageContent;
      
//       // Extract marks
//       const markMatch = content.match(/(\d+)\s*marks?/gi);
//       if (markMatch) {
//         markMatch.forEach(markStr => {
//           const marks = parseInt(markStr.match(/\d+/)[0]);
//           patterns.marksDistribution[marks] = (patterns.marksDistribution[marks] || 0) + 1;
//         });
//       }

//       // Detect question type
//       const type = this.detectQuestionType(content);
//       patterns.questionTypes[type] = (patterns.questionTypes[type] || 0) + 1;
//     });

//     return patterns;
//   }

//   detectQuestionType(content) {
//     const contentLower = content.toLowerCase();
    
//     if (contentLower.includes('define') || contentLower.includes('definition')) {
//       return 'definition';
//     } else if (contentLower.includes('derive') || contentLower.includes('derivation')) {
//       return 'derivation';
//     } else if (contentLower.includes('calculate') || contentLower.includes('solve')) {
//       return 'problem';
//     } else if (contentLower.includes('explain') || contentLower.includes('describe')) {
//       return 'explanation';
//     } else {
//       return 'application';
//     }
//   }

//   async predictQuestions(importantTopics, patterns, subjectId) {
//     try {
//       const prompt = this.createPredictionPrompt(importantTopics, patterns);
      
//       const response = await this.chatModel.invoke(prompt);
      
//       return this.parsePredictionResponse(response.content);
//     } catch (error) {
//       logger.error("Question prediction failed:", error);
//       return this.fallbackPrediction(importantTopics);
//     }
//   }

//   createPredictionPrompt(importantTopics, patterns) {
//     return `
//       You are an expert educational analyst. Analyze these patterns and predict questions:

//       IMPORTANT TOPICS:
//       ${JSON.stringify(importantTopics, null, 2)}

//       PATTERNS FOUND:
//       ${JSON.stringify(patterns, null, 2)}

//       Predict 5-8 most likely questions with:
//       - Question text
//       - Type (definition/derivation/problem/explanation/application)
//       - Expected marks
//       - Confidence level (1-5)
//       - Reasoning

//       Return as JSON array.
//     `;
//   }

//   parsePredictionResponse(response) {
//     try {
//       // Try to extract JSON from response
//       const jsonMatch = response.match(/\[[\s\S]*\]/);
//       if (jsonMatch) {
//         return JSON.parse(jsonMatch[0]);
//       }
//       return JSON.parse(response);
//     } catch (error) {
//       logger.error("Failed to parse prediction response:", error);
//       return this.fallbackPrediction([]);
//     }
//   }

//   fallbackPrediction(importantTopics) {
//     return importantTopics.slice(0, 5).map((topic, index) => ({
//       question: `Explain ${topic.topic} with examples`,
//       type: 'explanation',
//       marks: 5,
//       confidence: 3,
//       reasoning: 'Based on topic frequency analysis'
//     }));
//   }
// }

// export default new QuestionPredictionService();



import aiManager from '../ai/index.js';
import ChromaService from './ChromaService.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/index.js';
import { normalizeGeneratedQuestions } from '../utils/normalizeGeneratedQuestions.js';

class QuestionPredictionService {
  constructor() {
    this.ai = aiManager;
  }

  async analyzeSubject(subject) {
    try {
      logger.info(`Starting advanced analysis for subject: ${subject._id}`);

      const rawImportantTopics = await this.findImportantTopics(subject._id);

const normalizedTopicNames = await this.normalizeImportantTopics(
  rawImportantTopics.map(t => t.topic),
  subject.name
);

const importantTopics = normalizedTopicNames.map((topic, i) => ({
  topic,
  frequency: rawImportantTopics[i]?.frequency ?? 1,
  weightage: 20 + i * 5,
  priority: i < 3 ? 'high' : 'medium',
  confidence: 0.75,
  trend: 'stable'
}));

      const pyqPatterns = await this.analyzePYQPatterns(subject._id);

      const predictions = await this.predictQuestions(
        importantTopics,
        pyqPatterns,
        subject.name
      );

      return {
        importantTopics,
        predictions,
        patterns: pyqPatterns,
        metadata: {
          analysisType: 'advanced_pattern_analysis',
          topicsAnalyzed: importantTopics.length,
          patternsFound: Object.keys(pyqPatterns).length,
          modelUsed: this.ai?.providers?.[0]?.name || 'ai'
        }
      };
    } catch (error) {
      logger.error('Advanced analysis failed:', error);
      throw new ApiError(500, 'Advanced analysis failed: ' + error.message);
    }
  }

  async findImportantTopics(subjectId) {
    const results = await ChromaService.findSimilarQuestions(
      'important topics concepts syllabus',
      subjectId,
      15
    );

    const topicMap = {};

    for (const r of results) {
      const text = r.pageContent.toLowerCase();

      text.split('\n').forEach(line => {
        if (line.length < 20) return;

        const cleaned = line.trim().slice(0, 80);
        topicMap[cleaned] = (topicMap[cleaned] || 0) + 1;
      });
    }

    return Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic, frequency]) => ({
        topic,
        frequency,
        weightage: Math.min(frequency * 10, 100),
        priority: frequency > 3 ? 'high' : 'medium',
        confidence: 0.7,
        trend: 'stable'
      }));
  }

  async analyzePYQPatterns(subjectId) {
    const results = await ChromaService.findSimilarQuestions(
      'previous year question marks',
      subjectId,
      10
    );

    const patterns = {
      marksDistribution: {},
      questionTypes: {}
    };

    for (const r of results) {
      const text = r.pageContent.toLowerCase();

      const marks = text.match(/(\d+)\s*marks?/);
      if (marks) {
        const m = Number(marks[1]);
        patterns.marksDistribution[m] =
          (patterns.marksDistribution[m] || 0) + 1;
      }

      const type = this.detectQuestionType(text);
      patterns.questionTypes[type] =
        (patterns.questionTypes[type] || 0) + 1;
    }

    return patterns;
  }

  detectQuestionType(content) {
    const c = content.toLowerCase();

    if (c.includes('define') || c.includes('definition')) return 'definition';
    if (c.includes('derive') || c.includes('derivation')) return 'derivation';
    if (c.includes('calculate') || c.includes('solve')) return 'problem';
    if (c.includes('explain') || c.includes('describe')) return 'application';

    return 'application';
  }

  async predictQuestions(importantTopics, patterns, subjectName) {
    try {
      const prompt = this.createPredictionPrompt(
        importantTopics,
        patterns
      );

      const { output } = await this.ai.generate(prompt);

      let parsed;
try {
  parsed = this.parsePredictionResponse(output);
} catch {
  const retry = await this.ai.generate(
    prompt + "\nREMINDER: OUTPUT JSON ONLY."
  );
  parsed = this.parsePredictionResponse(retry.output);
}
    parsed = parsed.map(q => ({
  ...q,
  type: this.normalizeQuestionType(q.type)
}));

      // 🔥 THIS IS THE IMPORTANT LINE YOU MISSED

      if (!Array.isArray(parsed) || parsed.length === 0) {
  throw new Error('Empty AI question list');
}

      return normalizeGeneratedQuestions(
        parsed,
        subjectName,
        this.ai?.providers?.[0]?.name || 'ai'
      );
    } catch (error) {
      logger.error('Question prediction failed:', error);

      return normalizeGeneratedQuestions(
        this.fallbackPrediction(importantTopics),
        subjectName,
        'fallback'
      );
    }
  }



async normalizeKeyConcepts(rawTopics, subjectName) {
  const prompt = `
You are an academic syllabus expert.

TASK:
Convert the following raw extracted text into
clean, concise academic key concepts for the subject "${subjectName}".

RULES:
- Remove IDs, dates, IPs, question paper codes
- Remove headers and metadata
- Keep concepts syllabus-oriented
- Return 5–8 short concepts
- Each concept must be 2–5 words max

OUTPUT FORMAT (JSON ONLY):
["Concept 1", "Concept 2", "Concept 3"]

RAW INPUT:
${JSON.stringify(rawTopics)}
`;

  const { output } = await this.ai.generate(prompt);

  return this.safeParseJSONArray(output, 'keyConcepts');
}

safeParseJSONArray(text, label = 'AI JSON') {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
    console.error(`RAW ${label} OUTPUT ↓↓↓`);
    console.error(text);
    throw new Error(`${label} did not contain valid JSON array`);
  }

  const jsonSlice = cleaned.slice(firstBracket, lastBracket + 1);

  try {
    const parsed = JSON.parse(jsonSlice);


    if (!Array.isArray(parsed)) {
      throw new Error('Parsed JSON is not an array');
    }

    return parsed;
  } catch (err) {
    console.error(`INVALID ${label} JSON ↓↓↓`);
    console.error(jsonSlice);
    throw err;
  }
}





async normalizeImportantTopics(rawTopics, subjectName) {
  const prompt = `
You are an academic syllabus expert.

TASK:
Convert the following RAW extracted text into
clean, syllabus-level IMPORTANT TOPICS for the subject "${subjectName}".

RULES:
- Remove IDs, timestamps, IP addresses
- Merge similar concepts
- Use academic terminology
- Output 5–8 topics
- Each topic should be 3–6 words

OUTPUT FORMAT (JSON ONLY):
[
  "Topic 1",
  "Topic 2",
  "Topic 3"
]

RAW INPUT:
${JSON.stringify(rawTopics)}
`;

  const { output } = await this.ai.generate(prompt);

  return this.safeParseJSONArray(output, 'importantTopics');
}
normalizeQuestionType(type) {
  if (!type) return 'definition';

  const t = type.toLowerCase();

  if (t.includes('definition')) return 'definition';
  if (t.includes('derivation')) return 'derivation';
  if (t.includes('problem')) return 'problem';
  if (t.includes('application')) return 'application';

  return 'definition';
}



createPredictionPrompt(importantTopics, patterns) {
  const topicNames = importantTopics.map(t => t.topic);

  return `
You are a STRICT exam-question generator.

RULES (MANDATORY):
- Output ONLY valid JSON
- No explanations
- No placeholders
- Every question MUST explicitly mention a topic name
- NEVER say "the given concept"

TOPICS:
${JSON.stringify(topicNames)}

EXAM PATTERNS:
${JSON.stringify(patterns)}

OUTPUT FORMAT (STRICT JSON ARRAY):
[
  {
    "question": "Explain <TOPIC NAME> in detail.",
    "type": "definition",
    "marks": 5,
    "confidence": 0.7,
    "reasoning": "why this question is important"
  }
]


IMPORTANT:
- Replace <TOPIC NAME> with an actual topic from the list
- Always generate at least 3 questions
- If unsure, choose any topic from the list
- Distribute question types evenly
- type MUST be exactly one of:
  definition, derivation, problem, application

`;
}


parsePredictionResponse(response) {
  // 🔥 KILL THINKING
  const cleaned = response
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

  // 🔥 FORCE JSON ARRAY
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start === -1 || end === -1) {
    throw new Error('AI did not return JSON array');
  }

  const jsonString = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('RAW AI OUTPUT ↓↓↓');
    console.error(response);
    throw err;
  }
}




fallbackPrediction(importantTopics) {
  return importantTopics.slice(0, 5).map(topic => ({
    question: `Explain ${topic.topic} in detail.`,
    type: 'definition',
    marks: 5,
    confidence: 0.6,
    reasoning: 'Fallback question due to AI uncertainty'
  }));
}

}




export default new QuestionPredictionService();
