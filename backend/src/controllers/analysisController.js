// // import Analysis from '../models/Analysis.js';
// // import Subject from '../models/Subject.js';
// // import Document from '../models/Document.js';
// // import QuestionPredictionService from '../services/QuestionPredictionService.js';
// // import ChromaService from '../services/ChromaService.js';
// // import RedisService from '../services/RedisService.js'; 
// // import logger from '../utils/logger.js';
// // import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';
// //test gemini key first
// // Add this debug endpoint to test your API key
// // Add these new methods to your existing analysisController.js

// import Analysis from '../models/Analysis.js';
// import Subject from '../models/Subject.js';
// import Document from '../models/Document.js';

// import ChromaService from '../services/ChromaService.js';
// import RedisService from '../services/RedisService.js';
// import OllamaService from '../services/OllamaService.js';

// import logger from '../utils/logger.js';
// import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';



// // ✅ REDIS: Health Check Endpoint
// export const getRedisHealth = asyncHandler(async (req, res) => {
//     try {
//         const health = await RedisService.health();
        
//         return res.status(200).json(new ApiResponse(200, {
//             redis: health,
//             timestamp: new Date().toISOString()
//         }, "Redis health check completed"));
        
//     } catch (error) {
//         return res.status(500).json(new ApiResponse(500, {
//             error: error.message
//         }, "Redis health check failed"));
//     }
// });

// // ✅ REDIS: Clear Cache Endpoint
// export const clearRedisCache = asyncHandler(async (req, res) => {
//     try {
//         const { pattern = 'analysis:*' } = req.body;
        
//         // Note: In production, you'd use SCAN and DEL for pattern matching
//         // For now, we'll just reset the service
//         RedisService.reset && RedisService.reset();
        
//         return res.status(200).json(new ApiResponse(200, {
//             cleared: true,
//             pattern: pattern,
//             timestamp: new Date().toISOString()
//         }, "Redis cache cleared successfully"));
        
//     } catch (error) {
//         return res.status(500).json(new ApiResponse(500, {
//             error: error.message
//         }, "Redis cache clear failed"));
//     }
// });
// // ✅ Detailed ChromaDB Test

// export const testChromaFull = asyncHandler(async (req, res) => {
//     try {
//         console.log('🧪 Full ChromaDB Test...');
        
//         // Test 1: Connection
//         const isAvailable = await ChromaService.isChromaAvailable();
//         console.log('✅ Connection test:', isAvailable);
        
//         // Test 2: Add a test document
//         const testDoc = {
//             _id: 'test_' + Date.now(),
//             subjectId: 'test_subject',
//             documentType: 'test',
//             originalName: 'test_document.txt',
//             content: 'This is a test document about web development and XML parsing for educational purposes.'
//         };
        
//         const addedCount = await ChromaService.addDocuments([testDoc]);
//         console.log('✅ Add documents test:', addedCount);
        
//         // Test 3: Search for similar content
//         const similarResults = await ChromaService.findSimilarQuestions('web development', 'test_subject', 3);
//         console.log('✅ Search test:', similarResults.length, 'results');
        
//         // Test 4: Get stats
//         const stats = await ChromaService.getCollectionStats();
        
//         return res.status(200).json(new ApiResponse(200, {
//             connection: isAvailable,
//             documentsAdded: addedCount,
//             searchResults: similarResults.length,
//             similarQuestions: similarResults.map(r => ({
//                 content: r.pageContent.substring(0, 100) + '...',
//                 metadata: r.metadata
//             })),
//             stats: stats,
//             status: 'full_test_completed'
//         }, "Full ChromaDB test completed"));
        
//     } catch (error) {
//         console.log('❌ Full ChromaDB test failed:', error);
//         return res.status(500).json(new ApiResponse(500, {
//             error: error.message,
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         }, "Full ChromaDB test failed"));
//     }
// });
// // ✅ Updated test endpoint with better error handling
// export const testChromaDetailed = asyncHandler(async (req, res) => {
//     try {
//         console.log('🧪 Testing Local ChromaDB...');
        
//         const stats = await ChromaService.getCollectionStats();
//         const isAvailable = await ChromaService.initialize().catch(() => false);
        
//         return res.status(200).json(new ApiResponse(200, {
//             chromaAvailable: isAvailable,
//             stats: stats,
//             type: 'local_file_based',
//             path: './chroma_db' // Your local path
//         }, "Local ChromaDB test completed"));
        
//     } catch (error) {
//         console.log('❌ Local ChromaDB test failed:', error);
//         return res.status(500).json(new ApiResponse(500, {
//             error: error.message
//         }, "Local ChromaDB test failed"));
//     }
// });

// // ✅ Reset ChromaDB Collection
// export const resetChromaCollection = asyncHandler(async (req, res) => {
//     try {
//         console.log('🔄 Resetting ChromaDB collection...');
        
//         // Delete existing collection via API
//         const deleteResponse = await fetch('http://localhost:8000/api/v2/collections/study_materials', {
//             method: 'DELETE'
//         });
        
//         console.log('Delete response status:', deleteResponse.status);
        
//         // Reinitialize ChromaService
//         ChromaService.isInitialized = false;
//         const reinitialized = await ChromaService.initialize();
        
//         return res.status(200).json(new ApiResponse(200, {
//             deleted: deleteResponse.ok,
//             reinitialized: reinitialized
//         }, "ChromaDB collection reset completed"));
        
//     } catch (error) {
//         console.log('❌ Reset failed:', error);
//         return res.status(500).json(new ApiResponse(500, {
//             error: error.message
//         }, "ChromaDB reset failed"));
//     }
// });

// // ✅ Test Gemini API (if not already there)
// export const testGeminiAPI = asyncHandler(async (req, res) => {
//     try {
//         const { GoogleGenerativeAI } = await import("@google/generative-ai");
        
//         console.log('🔑 Testing Gemini API Key...');
//         console.log('🔑 API Key length:', process.env.GEMINI_API_KEY?.length);
        
//         const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
//         const model = genAI.getGenerativeModel({ 
//             model: "gemini-2.0-flash"
//         });

//         const result = await model.generateContent("Say 'Hello World' in one word.");
//         const response = await result.response;
//         const text = response.text();

//         return res.status(200).json(new ApiResponse(200, {
//             status: 'success',
//             response: text,
//             model: 'gemini-2.0-flash',
//             note: 'API key is working'
//         }, "Gemini API test successful"));
        
//     } catch (error) {
//         console.log('❌ Gemini API test failed:', error.message);
//         return res.status(500).json(new ApiResponse(500, {
//             status: 'failed',
//             error: error.message,
//             suggestion: 'Check if your API key is valid and has access to Gemini 2.0 Flash'
//         }, "Gemini API test failed"));
//     }
// });
// // ✅ REDIS: Enhanced Analyze Subject with Caching
// // export const analyzeSubject = asyncHandler(async (req, res) => {
// //     const { subjectId } = req.body;
// //     const { focusAreas, questionTypes, depth } = req.body;

// //     // ✅ REDIS: Generate cache key for analysis
// //     const analysisCacheKey = `analysis:${subjectId}:${JSON.stringify({focusAreas, questionTypes, depth})}`;
    
// //     // ✅ REDIS: Check cache first
// //     try {
// //         const cachedAnalysis = await RedisService.get(analysisCacheKey);
// //         if (cachedAnalysis) {
// //             console.log('✅ Serving analysis from Redis cache');
// //             const cachedData = JSON.parse(cachedAnalysis);
// //             return res.status(200).json(new ApiResponse(200, {
// //                 ...cachedData,
// //                 cached: true,
// //                 servedFrom: 'redis_cache'
// //             }, "Analysis served from cache"));
// //         }
// //     } catch (cacheError) {
// //         console.log('⚠️ Analysis cache check failed:', cacheError.message);
// //     }

// //     // Validate subject exists and belongs to user
// //     const subject = await Subject.findOne({
// //         _id: subjectId,
// //         userId: req.user._id
// //     });

// //     if (!subject) {
// //         throw new ApiError(404, "Subject not found");
// //     }

// //     // Check if we have enough documents for analysis
// //     const documentCount = await Document.countDocuments({
// //         subjectId,
// //         userId: req.user._id,
// //         processingStatus: 'completed'
// //     });

// //     if (documentCount < 2) {
// //         throw new ApiError(400, 
// //             `Need at least 2 processed documents for analysis. Currently have ${documentCount}. ` +
// //             "Please upload syllabus, notes, or previous year questions."
// //         );
// //     }

// //     // Create analysis record
// //     const analysis = await Analysis.create({
// //         userId: req.user._id,
// //         subjectId,
// //         documentIds: await Document.find({ 
// //             subjectId, 
// //             userId: req.user._id 
// //         }).distinct('_id'),
// //         status: 'processing'
// //     });

// //     // Perform advanced analysis asynchronously
// //     performAdvancedAnalysis(analysis._id, {
// //         subject,
// //         options: { focusAreas, questionTypes, depth }
// //     }).catch(error => {
// //         logger.error(`Advanced analysis failed for ${analysis._id}:`, error);
// //     });

// //     logger.info(`Advanced analysis started for subject: ${subject.name} by user ${req.user.email}`);

// //     const responseData = { 
// //         analysisId: analysis._id, 
// //         status: 'processing',
// //         message: 'Advanced pattern analysis started. This may take 1-2 minutes.',
// //         estimatedTime: '1-2 minutes',
// //         subject: subject.name
// //     };

// //     // ✅ REDIS: Cache the initial analysis response (2 minutes)
// //     try {
// //         await RedisService.setex(analysisCacheKey, 120, JSON.stringify({
// //             ...responseData,
// //             cached: true
// //         }));
// //         console.log('✅ Analysis initiation cached in Redis');
// //     } catch (cacheError) {
// //         console.log('⚠️ Analysis cache store failed:', cacheError.message);
// //     }

// //     return res
// //         .status(202)
// //         .json(new ApiResponse(202, responseData, "Advanced analysis started successfully"));
// // });

// export const analyzeSubject = asyncHandler(async (req, res) => {
//   const { subjectId } = req.body;

//   const subject = await Subject.findOne({
//     _id: subjectId,
//     userId: req.user._id
//   });
//   if (!subject) throw new ApiError(404, 'Subject not found');

//   const documents = await Document.find({
//     subjectId,
//     userId: req.user._id,
//     processingStatus: 'completed'
//   });

//   if (documents.length < 2) {
//     throw new ApiError(400, 'At least 2 documents required');
//   }

//   const analysis = await Analysis.create({
//     userId: req.user._id,
//     subjectId,
//     documentIds: documents.map(d => d._id),
//     status: 'processing'
//   });

//   performAdvancedAnalysis(analysis._id, subject, documents)
//     .catch(err => logger.error(err));

//   return res.status(202).json(
//     new ApiResponse(202, {
//       analysisId: analysis._id,
//       status: 'processing'
//     }, 'Analysis started')
//   );
// });


// // Advanced analysis processing (add caching here too)
// // const performAdvancedAnalysis = async (analysisId, input) => {
// //     try {
// //         const analysis = await Analysis.findById(analysisId);
// //         if (!analysis) return;

// //         // Use the new prediction service
// //         const result = await QuestionPredictionService.analyzeSubject(input.subject._id);

// //         // Update analysis with advanced results
// //         analysis.importantTopics = result.importantTopics;
// //         analysis.generatedQuestions = result.predictions || [];
// //         analysis.summary = {
// //             overview: `Advanced analysis completed for ${input.subject.name}`,
// //             keyConcepts: result.importantTopics.map(t => t.topic),
// //             studyRecommendations: ["Focus on high-frequency topics", "Practice previous year questions"],
// //             estimatedPreparationTime: "14 hours"
// //         };
// //         analysis.metadata = {
// //             processingTime: Date.now() - analysis.createdAt,
// //             totalDocuments: await Document.countDocuments({ subjectId: input.subject._id }),
// //             modelVersion: 'gemini-pro + chroma',
// //             cacheHit: false,
// //             tokensUsed: 0,
// //             analysisType: 'advanced_pattern_analysis',
// //             confidence: 75
// //         };
// //         analysis.status = 'completed';
// //         await analysis.save();

// //         // ✅ REDIS: Cache the completed analysis
// //         try {
// //             const cacheKey = `analysis_result:${analysisId}`;
// //             await RedisService.setex(cacheKey, 3600, JSON.stringify(analysis)); // 1 hour
// //             console.log('✅ Completed analysis cached in Redis');
// //         } catch (cacheError) {
// //             console.log('⚠️ Completed analysis cache store failed:', cacheError.message);
// //         }

// //         logger.info(`Advanced analysis completed successfully: ${analysisId}`);
// //     } catch (error) {
// //         const analysis = await Analysis.findById(analysisId);
// //         if (analysis) {
// //             analysis.status = 'failed';
// //             analysis.metadata = { 
// //                 error: error.message,
// //                 analysisType: 'advanced_pattern_analysis'
// //             };
// //             await analysis.save();
// //         }
// //         logger.error(`Advanced analysis failed for ${analysisId}:`, error);
// //         throw error;
// //     }
// // };

// // async function performAdvancedAnalysis(analysisId, subject, documents) {
// //   const analysis = await Analysis.findById(analysisId);
// //   if (!analysis) return;

// //   let context = `Subject: ${subject.name}\n\n`;

// //   documents.forEach((doc, i) => {
// //     context += `Document ${i + 1}:\n${doc.content.substring(0, 2000)}\n\n`;
// //   });

// //   const prompt = `
// // You are an academic analysis expert.

// // Analyze the following study material and return JSON ONLY.

// // JSON FORMAT:
// // {
// //   "importantTopics": [
// //     { "topic": "string", "priority": "high|medium|low" }
// //   ],
// //   "generatedQuestions": [
// //     { "question": "string", "difficulty": "easy|medium|hard" }
// //   ],
// //   "summary": {
// //     "overview": "string",
// //     "studyRecommendations": ["string"]
// //   }
// // }

// // CONTENT:
// // ${context}
// // `;

// //   const raw = await OllamaService.generate(prompt);

// //   let parsed;
// //   try {
// //     parsed = JSON.parse(
// //       raw.replace(/```json|```/g, '').trim()
// //     );
// //   } catch (e) {
// //     throw new Error('Qwen returned invalid JSON');
// //   }

// //   analysis.importantTopics = parsed.importantTopics || [];
// //   analysis.generatedQuestions = parsed.generatedQuestions || [];
// //   analysis.summary = parsed.summary || {};
// //   analysis.status = 'completed';
// //   analysis.metadata = {
// //     modelUsed: 'qwen3:4b',
// //     completedAt: new Date().toISOString()
// //   };

// //   await analysis.save();
// // }

// function buildAnalysisContext(subject, documents) {
//   const syllabus = documents.filter(d => d.documentType === 'syllabus');
//   const notes = documents.filter(d => d.documentType === 'notes');
//   const pyqs = documents.filter(d => d.documentType === 'pyqs');

//   let context = `SUBJECT: ${subject.name}\n\n`;

//   if (syllabus.length) {
//     context += `SYLLABUS (MOST IMPORTANT):\n`;
//     syllabus.forEach(d => {
//       context += `- ${d.content.substring(0, 1500)}\n`;
//     });
//   }

//   if (notes.length) {
//     context += `\nNOTES:\n`;
//     notes.forEach(d => {
//       context += `- ${d.content.substring(0, 1200)}\n`;
//     });
//   }

//   if (pyqs.length) {
//     context += `\nPREVIOUS YEAR QUESTIONS (HIGH WEIGHTAGE):\n`;
//     pyqs.forEach(d => {
//       context += `- ${d.content.substring(0, 1000)}\n`;
//     });
//   }

//   return context;
// }

// async function performAdvancedAnalysis(analysisId, subject, documents) {
//   const analysis = await Analysis.findById(analysisId);
//   if (!analysis) return;

// //   let context = `Subject: ${subject.name}\n\n`;
// //   documents.forEach((doc, i) => {
// //     context += `Document ${i + 1}:\n${doc.content.substring(0, 2000)}\n\n`;
// //   });

//     let context = buildAnalysisContext(subject, documents);

//   const prompt = `
// You are an exam-oriented academic analyst.

// TASK:
// Analyze the syllabus, notes, and previous exam material.

// RULES:
// - Output ONLY valid JSON
// - No markdown
// - No explanations
// - No filler
// - Base importance on FREQUENCY + SYLLABUS EMPHASIS

// IMPORTANT TOPICS RULES:
// - Extract 6–10 topics
// - Topics MUST be specific (e.g. "JWT Authentication", not "Security")
// - Assign priority based on exam likelihood

// GENERATED QUESTIONS RULES:
// - 8–12 questions
// - Exam-style, not generic
// - Vary difficulty

// JSON FORMAT:
// {
//   "importantTopics": [
//     {
//       "topic": "string",
//       "priority": "high|medium|low",
//       "reason": "short string"
//     }
//   ],
//   "generatedQuestions": [
//     {
//       "question": "string",
//       "difficulty": "easy|medium|hard"
//     }
//   ],
//   "summary": {
//     "overview": "string",
//     "studyRecommendations": ["string"]
//   }
// }

// CONTENT:
// ${context}}

// `;

//   const parsed = await generateWithRetry(prompt);

//   const normalized = normalizeAnalysisForSchema(parsed, subject.name);

//     analysis.importantTopics = normalized.importantTopics;
//     analysis.generatedQuestions = normalized.generatedQuestions;
//     analysis.summary = normalized.summary;

//   analysis.status = 'completed';
//   analysis.metadata = {
//     modelUsed: 'qwen3:4b',
//     completedAt: new Date().toISOString()
//   };

//   await analysis.save();
// }

// async function generateWithRetry(prompt, retries = 2) {
//   for (let i = 0; i <= retries; i++) {
//     const output = await OllamaService.generate(prompt);

//     try {
//       return safeParseJSON(output);
//     } catch (err) {
//       if (i === retries) throw err;
//     }
//   }
// }
// function safeParseJSON(text) {
//   try {
//     // extract first JSON object
//     const match = text.match(/\{[\s\S]*\}/);
//     if (!match) throw new Error('No JSON object found');

//     return JSON.parse(match[0]);
//   } catch (err) {
//     throw new Error('Invalid JSON from model');
//   }
// }

// function normalizeAnalysisForSchema(raw, subjectName) {
//   return {
//     importantTopics: (raw.importantTopics || []).map((t, i) => ({
//       topic: t.topic,
//       frequency: Math.min(100, 60 + i * 5),
//       weightage: Math.min(100, 50 + i * 5),
//       priority: t.priority || 'medium',
//       confidence: 0.7,
//       trend: 'stable',
//       lastAppeared: null,
//       recommendedStudyTime: '2-3 hours'
//     })),

//     generatedQuestions: (raw.generatedQuestions || []).map((q, i) => ({
//       id: `q-${Date.now()}-${i}`,
//       question: q.question,
//       type: 'application',
//       marks: 5,
//       difficulty: normalizeDifficulty(q.difficulty),
//       topic: subjectName,
//       learningOutcome: `Understand and apply ${subjectName}`,
//       modelUsed: 'qwen3:4b',
//       estimatedTime: 10
//     })),

//     summary: {
//       overview: raw.summary?.overview || '',
//       keyConcepts: (raw.importantTopics || []).map(t => t.topic),
//       studyRecommendations: raw.summary?.studyRecommendations || [],
//       estimatedPreparationTime: '10-12 hours'
//     }
//   };
// }

// function normalizeDifficulty(d) {
//   if (d === 'high') return 'hard';
//   if (d === 'low') return 'easy';
//   return 'medium';
// }




// // ✅ REDIS: Enhanced Quick Predict with Caching
// // export const quickPredict = asyncHandler(async (req, res) => {
// //     const { subjectId, topic } = req.body;

// //     console.log('🔍 Quick Predict Started for topic:', topic);

// //     // ✅ REDIS: Generate cache key
// //     const cacheKey = `quick_predict:${subjectId}:${topic.toLowerCase().trim()}`;
    
// //     // ✅ REDIS: Check cache first
// //     try {
// //         const cachedResult = await RedisService.getCachedAnalysis(subjectId, topic);
// //         if (cachedResult) {
// //             console.log('✅ Serving from Redis cache');
// //             return res.status(200).json(new ApiResponse(200, {
// //                 ...cachedResult,
// //                 cached: true,
// //                 servedFrom: 'redis_cache',
// //                 cacheTimestamp: new Date().toISOString()
// //             }, "Quick prediction served from cache"));
// //         }
// //     } catch (cacheError) {
// //         console.log('⚠️ Cache check failed, proceeding normally:', cacheError.message);
// //     }

// //     const subject = await Subject.findOne({
// //         _id: subjectId,
// //         userId: req.user._id
// //     });

// //     if (!subject) {
// //         throw new ApiError(404, "Subject not found");
// //     }

// //     try {
// //         // ✅ Check if ChromaDB is available
// //         const isChromaAvailable = await ChromaService.initialize().catch(() => false);
        
// //         let similarQuestions = [];
// //         let confidence = 'Medium';
// //         let note = '';

// //         if (isChromaAvailable) {
// //             console.log('🔍 Using Local ChromaDB for similar question search...');
// //             similarQuestions = await ChromaService.findSimilarQuestions(topic, subjectId, 3);
// //             confidence = similarQuestions.length > 0 ? 'High' : 'Medium';
// //             note = 'Enhanced with similar question analysis';
// //         } else {
// //             console.log('⚠️ Local ChromaDB not available, using direct AI prediction');
// //             note = 'Direct AI prediction (Local vector store not available)';
// //         }

// //         // Build prompt based on available data
// //         let prompt = `As an exam prediction expert, predict 3 likely exam questions about "${topic}".\n\n`;

// //         if (similarQuestions.length > 0) {
// //             prompt += `Based on these similar previous questions:\n${similarQuestions.map(q => `- ${q.pageContent}`).join('\n')}\n\n`;
// //         }

// //         prompt += `Consider:
// //         - Important concepts and definitions
// //         - Common problem types  
// //         - Frequently tested areas
// //         - Recent exam trends
        
// //         Return 3 clear, specific questions that would likely appear in an exam.`;

// //         console.log('🤖 Calling Gemini 2.0 Flash...');
        
// //         const { GoogleGenerativeAI } = await import("@google/generative-ai");
// //         const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// //         const model = genAI.getGenerativeModel({ 
// //             model: "gemini-2.0-flash"
// //         });

// //         const result = await model.generateContent(prompt);
// //         const response = await result.response;
// //         const text = response.text();

// //         // Prepare final result
// //         const finalResult = {
// //             topic,
// //             similarPastQuestions: similarQuestions.map(q => ({
// //                 content: q.pageContent.substring(0, 150) + '...',
// //                 metadata: q.metadata
// //             })),
// //             predictedQuestions: text,
// //             confidence: confidence,
// //             note: note,
// //             vectorStoreAvailable: isChromaAvailable,
// //             modelUsed: 'gemini-2.0-flash',
// //             cached: false,
// //             servedFrom: 'ai_generation',
// //             generatedAt: new Date().toISOString()
// //         };

// //         // ✅ REDIS: Cache the result (5 minutes)
// //         try {
// //             await RedisService.cacheAnalysisResult(subjectId, topic, finalResult, 300); // 5 minutes
// //             console.log('✅ Result cached in Redis for 5 minutes');
// //         } catch (cacheError) {
// //             console.log('⚠️ Cache store failed:', cacheError.message);
// //         }

// //         return res.status(200).json(new ApiResponse(200, finalResult, "Quick prediction generated successfully"));

// //     } catch (error) {
// //         console.log('❌ Quick prediction error:', error);
        
// //         // Fallback response
// //         const mockQuestions = `Based on "${topic}", here are 3 predicted exam questions:

// // 1. **Conceptual Understanding**: Explain the core principles and significance of ${topic}.
// // 2. **Practical Application**: Describe a real-world scenario where ${topic} would be implemented.
// // 3. **Comparative Analysis**: Compare ${topic} with related technologies or approaches.`;

// //         const fallbackResult = {
// //             topic,
// //             similarPastQuestions: [],
// //             predictedQuestions: mockQuestions,
// //             confidence: 'Medium',
// //             note: 'Fallback prediction',
// //             vectorStoreAvailable: false,
// //             isFallback: true,
// //             cached: false,
// //             servedFrom: 'fallback',
// //             generatedAt: new Date().toISOString()
// //         };

// //         return res.status(200).json(new ApiResponse(200, fallbackResult, "Quick prediction generated (fallback mode)"));
// //     }
// // });

// export const quickPredict = asyncHandler(async (req, res) => {
//   const { subjectId, topic } = req.body;

//   if (!topic) throw new ApiError(400, 'Topic is required');

//   const cached = await RedisService.getCachedAnalysis(subjectId, topic);
//   if (cached) {
//     return res.status(200).json(
//       new ApiResponse(200, { ...cached, cached: true }, 'From cache')
//     );
//   }

//   const subject = await Subject.findOne({
//     _id: subjectId,
//     userId: req.user._id
//   });
//   if (!subject) throw new ApiError(404, 'Subject not found');

//   const chromaAvailable = await ChromaService.initialize().catch(() => false);
//   let similarQuestions = [];

//   if (chromaAvailable) {
//     similarQuestions = await ChromaService.findSimilarQuestions(
//       topic,
//       subjectId,
//       3
//     );
//   }

//   let prompt = `
// You are an exam prediction expert.

// Predict 3 likely exam questions about "${topic}".

// `;

//   if (similarQuestions.length) {
//     prompt += `Previous exam questions:\n`;
//     similarQuestions.forEach(q => {
//       prompt += `- ${q.pageContent}\n`;
//     });
//   }

//   prompt += `
// Rules:
// - Output only questions
// - No explanations
// `;

//   const text = await OllamaService.generate(prompt);

//   const result = {
//     topic,
//     predictedQuestions: text,
//     similarPastQuestions: similarQuestions,
//     modelUsed: 'qwen3:4b',
//     vectorStoreAvailable: chromaAvailable,
//     generatedAt: new Date().toISOString()
//   };

//   await RedisService.cacheAnalysisResult(subjectId, topic, result, 300);

//   return res.status(200).json(
//     new ApiResponse(200, result, 'Quick prediction generated')
//   );
// });


// // Generate questions endpoint
// // ✅ REDIS: Enhanced Generate Questions with Caching
// // export const generateQuestions = asyncHandler(async (req, res) => {
// //     const { topic, count = 5, difficulty, type } = req.body;

// //     // ✅ REDIS: Generate cache key
// //     const cacheKey = `generated_questions:${topic}:${count}:${difficulty}:${type}`;
    
// //     // ✅ REDIS: Check cache first
// //     try {
// //         const cachedQuestions = await RedisService.get(cacheKey);
// //         if (cachedQuestions) {
// //             console.log('✅ Serving generated questions from Redis cache');
// //             const cachedData = JSON.parse(cachedQuestions);
// //             return res.status(200).json(new ApiResponse(200, {
// //                 questions: cachedData.questions,
// //                 metadata: cachedData.metadata,
// //                 cached: true,
// //                 servedFrom: 'redis_cache'
// //             }, "Questions generated successfully from cache"));
// //         }
// //     } catch (cacheError) {
// //         console.log('⚠️ Questions cache check failed:', cacheError.message);
// //     }

// //     try {
// //         const prompt = `
// //             Generate ${count} ${difficulty} difficulty ${type} questions about ${topic} for exam preparation.
// //             Make them educational and exam-focused.
// //         `;

// //         const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
// //         const model = new ChatGoogleGenerativeAI({
// //             modelName: "gemini-pro",
// //             maxOutputTokens: 2048,
// //             temperature: 0.3,
// //             apiKey: process.env.GEMINI_API_KEY,
// //         });

// //         const response = await model.call([{ role: "user", content: prompt }]);

// //         // Parse the response into structured questions
// //         const questions = parseGeneratedQuestions(response.content, count);

// //         const result = {
// //             questions: questions,
// //             metadata: {
// //                 topic,
// //                 count,
// //                 difficulty,
// //                 type,
// //                 generatedAt: new Date().toISOString()
// //             }
// //         };

// //         // ✅ REDIS: Cache the generated questions (10 minutes)
// //         try {
// //             await RedisService.setex(cacheKey, 600, JSON.stringify(result));
// //             console.log('✅ Generated questions cached in Redis for 10 minutes');
// //         } catch (cacheError) {
// //             console.log('⚠️ Questions cache store failed:', cacheError.message);
// //         }

// //         return res.status(200).json(new ApiResponse(200, result, "Questions generated successfully"));
// //     } catch (error) {
// //         logger.error("Generate questions failed:", error);
        
// //         // Fallback mock questions
// //         const mockQuestions = Array.from({ length: count }, (_, i) => ({
// //             id: `gen-${Date.now()}-${i}`,
// //             question: `Sample ${difficulty} question about ${topic} (${type})`,
// //             type: type || 'application',
// //             marks: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 5 : 10,
// //             difficulty,
// //             topic,
// //             learningOutcome: `Understand key concepts of ${topic}`,
// //             modelUsed: 'gemini-pro',
// //             estimatedTime: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15
// //         }));

// //         return res.status(200).json(new ApiResponse(200, { 
// //             questions: mockQuestions 
// //         }, "Questions generated successfully (fallback)"));
// //     }
// // });

// export const generateQuestions = asyncHandler(async (req, res) => {
//   const { topic, count = 5 } = req.body;

//   const prompt = `
// Generate ${count} exam-oriented questions about "${topic}".
// Only list questions.
// `;

//   const text = await OllamaService.generate(prompt);

//   return res.status(200).json(
//     new ApiResponse(200, {
//       topic,
//       questions: text,
//       modelUsed: 'qwen3:4b'
//     }, 'Questions generated')
//   );
// });


// // Helper function to parse generated questions
// function parseGeneratedQuestions(content, count) {
//     try {
//         const lines = content.split('\n').filter(line => line.trim());
//         const questions = [];
        
//         for (let i = 0; i < Math.min(lines.length, count); i++) {
//             if (lines[i].trim() && !lines[i].includes('```')) {
//                 questions.push({
//                     id: `gen-${Date.now()}-${i}`,
//                     question: lines[i].replace(/^\d+\.\s*/, '').trim(),
//                     type: 'application',
//                     marks: 5,
//                     difficulty: 'medium',
//                     topic: 'General',
//                     learningOutcome: 'Understand key concepts',
//                     modelUsed: 'gemini-pro',
//                     estimatedTime: 10
//                 });
//             }
//         }
        
//         return questions.length > 0 ? questions : createFallbackQuestions(count);
//     } catch (error) {
//         return createFallbackQuestions(count);
//     }
// }

// function createFallbackQuestions(count) {
//     return Array.from({ length: count }, (_, i) => ({
//         id: `fallback-${Date.now()}-${i}`,
//         question: `Explain key concepts in your own words (Question ${i + 1})`,
//         type: 'explanation',
//         marks: 5,
//         difficulty: 'medium',
//         topic: 'General',
//         learningOutcome: 'Understanding and application',
//         modelUsed: 'fallback',
//         estimatedTime: 10
//     }));
// }

// // Get specific analysis
// // ✅ REDIS: Enhanced Get Analysis with Caching
// export const getAnalysis = asyncHandler(async (req, res) => {
//     const { id } = req.params;
    
//     // ✅ REDIS: Generate cache key
//     const cacheKey = `analysis_result:${id}`;
    
//     // ✅ REDIS: Check cache first
//     try {
//         const cachedAnalysis = await RedisService.get(cacheKey);
//         if (cachedAnalysis) {
//             console.log('✅ Serving analysis result from Redis cache');
//             const cachedData = JSON.parse(cachedAnalysis);
//             return res.status(200).json(new ApiResponse(200, { 
//                 analysis: cachedData,
//                 cached: true 
//             }, "Analysis fetched successfully from cache"));
//         }
//     } catch (cacheError) {
//         console.log('⚠️ Analysis result cache check failed:', cacheError.message);
//     }

//     const analysis = await Analysis.findOne({
//         _id: id,
//         userId: req.user._id
//     })
//         .populate('subjectId', 'name')
//         .populate('documentIds', 'originalName documentType');

//     if (!analysis) {
//         throw new ApiError(404, "Analysis not found");
//     }

//     // ✅ REDIS: Cache the analysis result (10 minutes)
//     try {
//         await RedisService.setex(cacheKey, 600, JSON.stringify(analysis));
//         console.log('✅ Analysis result cached in Redis for 10 minutes');
//     } catch (cacheError) {
//         console.log('⚠️ Analysis result cache store failed:', cacheError.message);
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, { analysis }, "Analysis fetched successfully"));
// });

// // ✅ REDIS: Enhanced Get Analyses with Caching
// export const getAnalysesForSubject = asyncHandler(async (req, res) => {
//     const { subjectId } = req.query;
    
//     // ✅ REDIS: Generate cache key based on query
//     const cacheKey = `analyses_list:${req.user._id}:${subjectId || 'all'}`;
    
//     // ✅ REDIS: Check cache first
//     try {
//         const cachedAnalyses = await RedisService.get(cacheKey);
//         if (cachedAnalyses) {
//             console.log('✅ Serving analyses list from Redis cache');
//             const cachedData = JSON.parse(cachedAnalyses);
//             return res.status(200).json(new ApiResponse(200, { 
//                 analyses: cachedData,
//                 cached: true 
//             }, "Analyses fetched successfully from cache"));
//         }
//     } catch (cacheError) {
//         console.log('⚠️ Analyses list cache check failed:', cacheError.message);
//     }

//     const filter = {
//         userId: req.user._id
//     };

//     if (subjectId) {
//         filter.subjectId = subjectId;
//     }

//     const analyses = await Analysis.find(filter)
//         .populate('subjectId', 'name')
//         .sort({ createdAt: -1 })
//         .limit(20);

//     // ✅ REDIS: Cache the analyses list (2 minutes)
//     try {
//         await RedisService.setex(cacheKey, 120, JSON.stringify(analyses));
//         console.log('✅ Analyses list cached in Redis for 2 minutes');
//     } catch (cacheError) {
//         console.log('⚠️ Analyses list cache store failed:', cacheError.message);
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, { analyses }, "Analyses fetched successfully"));
// });

// // test for chroma

// // Add this to your analysisController.js
// export const testChromaConnection = asyncHandler(async (req, res) => {
//     try {
//         console.log('🧪 Testing ChromaDB connection...');
        
//         const isAvailable = await ChromaService.isChromaAvailable();
//         const stats = await ChromaService.getCollectionStats();
        
//         return res.status(200).json(new ApiResponse(200, {
//             chromaAvailable: isAvailable,
//             stats: stats,
//             chromaUrl: 'http://localhost:8000'
//         }, "ChromaDB connection test completed"));
        
//     } catch (error) {
//         console.log('❌ ChromaDB test failed:', error);
//         return res.status(500).json(new ApiResponse(500, {
//             chromaAvailable: false,
//             error: error.message
//         }, "ChromaDB connection test failed"));
//     }
// });

// // Get all analyses for user
// export const getAnalyses = asyncHandler(async (req, res) => {
//     const { subjectId } = req.query;
    
//     const filter = {
//         userId: req.user._id
//     };

//     if (subjectId) {
//         filter.subjectId = subjectId;
//     }

//     const analyses = await Analysis.find(filter)
//         .populate('subjectId', 'name')
//         .sort({ createdAt: -1 })
//         .limit(20);

//     return res
//         .status(200)
//         .json(new ApiResponse(200, { analyses }, "Analyses fetched successfully"));
// });









import Analysis from '../models/Analysis.js';
import Subject from '../models/Subject.js';
import Document from '../models/Document.js';
import QuestionPredictionService from '../services/QuestionPredictionService.js';
import ChromaService from '../services/ChromaService.js';
import RedisService from '../services/RedisService.js'; 
import logger from '../utils/logger.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';
import aiManager from '../ai/index.js';
import { normalizeGeneratedQuestions } from '../utils/normalizeGeneratedQuestions.js';

//test gemini key first
// Add this debug endpoint to test your API key
// Add these new methods to your existing analysisController.js


// ✅ REDIS: Health Check Endpoint
export const getRedisHealth = asyncHandler(async (req, res) => {
    try {
        const health = await RedisService.health();
        
        return res.status(200).json(new ApiResponse(200, {
            redis: health,
            timestamp: new Date().toISOString()
        }, "Redis health check completed"));
        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, {
            error: error.message
        }, "Redis health check failed"));
    }
});

// ✅ REDIS: Clear Cache Endpoint
export const clearRedisCache = asyncHandler(async (req, res) => {
    try {
        const { pattern = 'analysis:*' } = req.body;
        
        // Note: In production, you'd use SCAN and DEL for pattern matching
        // For now, we'll just reset the service
        RedisService.reset && RedisService.reset();
        
        return res.status(200).json(new ApiResponse(200, {
            cleared: true,
            pattern: pattern,
            timestamp: new Date().toISOString()
        }, "Redis cache cleared successfully"));
        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, {
            error: error.message
        }, "Redis cache clear failed"));
    }
});
// ✅ Detailed ChromaDB Test

export const testChromaFull = asyncHandler(async (req, res) => {
    try {
        console.log('🧪 Full ChromaDB Test...');
        
        // Test 1: Connection
        const isAvailable = await ChromaService.isChromaAvailable();
        console.log('✅ Connection test:', isAvailable);
        
        // Test 2: Add a test document
        const testDoc = {
            _id: 'test_' + Date.now(),
            subjectId: 'test_subject',
            documentType: 'test',
            originalName: 'test_document.txt',
            content: 'This is a test document about web development and XML parsing for educational purposes.'
        };
        
        const addedCount = await ChromaService.addDocuments([testDoc]);
        console.log('✅ Add documents test:', addedCount);
        
        // Test 3: Search for similar content
        const similarResults = await ChromaService.findSimilarQuestions('web development', 'test_subject', 3);
        console.log('✅ Search test:', similarResults.length, 'results');
        
        // Test 4: Get stats
        const stats = await ChromaService.getCollectionStats();
        
        return res.status(200).json(new ApiResponse(200, {
            connection: isAvailable,
            documentsAdded: addedCount,
            searchResults: similarResults.length,
            similarQuestions: similarResults.map(r => ({
                content: r.pageContent.substring(0, 100) + '...',
                metadata: r.metadata
            })),
            stats: stats,
            status: 'full_test_completed'
        }, "Full ChromaDB test completed"));
        
    } catch (error) {
        console.log('❌ Full ChromaDB test failed:', error);
        return res.status(500).json(new ApiResponse(500, {
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, "Full ChromaDB test failed"));
    }
});
// ✅ Updated test endpoint with better error handling
export const testChromaDetailed = asyncHandler(async (req, res) => {
    try {
        console.log('🧪 Testing Local ChromaDB...');
        
        const stats = await ChromaService.getCollectionStats();
        const isAvailable = await ChromaService.initialize().catch(() => false);
        
        return res.status(200).json(new ApiResponse(200, {
            chromaAvailable: isAvailable,
            stats: stats,
            type: 'local_file_based',
            path: './chroma_db' // Your local path
        }, "Local ChromaDB test completed"));
        
    } catch (error) {
        console.log('❌ Local ChromaDB test failed:', error);
        return res.status(500).json(new ApiResponse(500, {
            error: error.message
        }, "Local ChromaDB test failed"));
    }
});

// ✅ Reset ChromaDB Collection
export const resetChromaCollection = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 Resetting ChromaDB collection...');
        
        // Delete existing collection via API
        const deleteResponse = await fetch('http://localhost:8000/api/v2/collections/study_materials', {
            method: 'DELETE'
        });
        
        console.log('Delete response status:', deleteResponse.status);
        
        // Reinitialize ChromaService
        ChromaService.isInitialized = false;
        const reinitialized = await ChromaService.initialize();
        
        return res.status(200).json(new ApiResponse(200, {
            deleted: deleteResponse.ok,
            reinitialized: reinitialized
        }, "ChromaDB collection reset completed"));
        
    } catch (error) {
        console.log('❌ Reset failed:', error);
        return res.status(500).json(new ApiResponse(500, {
            error: error.message
        }, "ChromaDB reset failed"));
    }
});

// ✅ Test Gemini API (if not already there)
export const testGeminiAPI = asyncHandler(async (req, res) => {
    try {
        const { output, provider } = await aiManager.generate(
    "Say Hello World in one word."
  );

  return res.status(200).json(
    new ApiResponse(200, {
      provider,
      response: output
    }, "AI provider test successful")
  );
        
    } catch (error) {
        console.log('❌  API test failed:', error.message);
        return res.status(500).json(new ApiResponse(500, {
            status: 'failed',
            error: error.message,
        
        }, "test failed"));
    }
});
// ✅ REDIS: Enhanced Analyze Subject with Caching
export const analyzeSubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.body;
    const { focusAreas, questionTypes, depth } = req.body;

    // ✅ REDIS: Generate cache key for analysis
    const analysisCacheKey = `analysis:${subjectId}:${JSON.stringify({focusAreas, questionTypes, depth})}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedAnalysis = await RedisService.get(analysisCacheKey);
        if (cachedAnalysis) {
            console.log('✅ Serving analysis from Redis cache');
            const cachedData = JSON.parse(cachedAnalysis);
            return res.status(200).json(new ApiResponse(200, {
                ...cachedData,
                cached: true,
                servedFrom: 'redis_cache'
            }, "Analysis served from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Analysis cache check failed:', cacheError.message);
    }

    // Validate subject exists and belongs to user
    const subject = await Subject.findOne({
        _id: subjectId,
        userId: req.user._id
    });

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    // Check if we have enough documents for analysis
    const documentCount = await Document.countDocuments({
        subjectId,
        userId: req.user._id,
        processingStatus: 'completed'
    });

    if (documentCount < 2) {
        throw new ApiError(400, 
            `Need at least 2 processed documents for analysis. Currently have ${documentCount}. ` +
            "Please upload syllabus, notes, or previous year questions."
        );
    }

    // Create analysis record
    const analysis = await Analysis.create({
        userId: req.user._id,
        subjectId,
        documentIds: await Document.find({ 
            subjectId, 
            userId: req.user._id 
        }).distinct('_id'),
        status: 'processing'
    });

    // Perform advanced analysis asynchronously
    performAdvancedAnalysis(analysis._id, {
        subject,
        options: { focusAreas, questionTypes, depth }
    }).catch(error => {
        logger.error(`Advanced analysis failed for ${analysis._id}:`, error);
    });

    logger.info(`Advanced analysis started for subject: ${subject.name} by user ${req.user.email}`);

    const responseData = { 
        analysisId: analysis._id, 
        status: 'processing',
        message: 'Advanced pattern analysis started. This may take 1-2 minutes.',
        estimatedTime: '1-2 minutes',
        subject: subject.name
    };

    // ✅ REDIS: Cache the initial analysis response (2 minutes)
    try {
        await RedisService.setex(analysisCacheKey, 120, JSON.stringify({
            ...responseData,
            cached: true
        }));
        console.log('✅ Analysis initiation cached in Redis');
    } catch (err) {
       analysis.status = 'failed';
  analysis.metadata = { error: err.message };
  await analysis.save();
  throw err;
    }

    return res
        .status(202)
        .json(new ApiResponse(202, responseData, "Advanced analysis started successfully"));
});

// Advanced analysis processing (add caching here too)
const performAdvancedAnalysis = async (analysisId, input) => {
    try {
        const analysis = await Analysis.findById(analysisId);
        if (!analysis) return;
        
        // Use the new prediction service
        const result = await QuestionPredictionService.analyzeSubject(input.subject);
        const rawTopics = result.importantTopics.map(t => t.topic);
        

        // Update analysis with advanced results
        const normalizedImportantTopics =
  await QuestionPredictionService.normalizeImportantTopics(
    rawTopics,
    input.subject.name
  );
        analysis.importantTopics = normalizedImportantTopics.map((topic, index) => ({
  topic,
  frequency: Math.max(1, 5 - index),       // simple ranking
  weightage: 20 + index * 5,               // progressive importance
  priority: index < 2 ? 'high' : 'medium',
  confidence: 0.75,
  trend: 'stable'
}));
analysis.generatedQuestions = result.predictions;
        if (!result.predictions || !result.predictions.length) {
        logger.warn('AI returned no questions, using fallback');
  result.predictions = QuestionPredictionService.fallbackPrediction(
    result.importantTopics
  );
        }

const keyConcepts = await QuestionPredictionService.normalizeKeyConcepts(
  rawTopics,
  input.subject.name
);

analysis.summary = {
  overview: `Advanced analysis completed for ${input.subject.name}`,
  keyConcepts,
  studyRecommendations: [
    "Focus on high-frequency concepts",
    "Practice previous year questions"
  ],
  estimatedPreparationTime: "14 hours"
};
;
        analysis.metadata = {
            processingTime: Date.now() - analysis.createdAt,
            totalDocuments: await Document.countDocuments({ subjectId: input.subject._id }),
            modelVersion: 'gemini-pro + chroma',
            cacheHit: false,
            tokensUsed: 0,
            analysisType: 'advanced_pattern_analysis',
            confidence: 75
        };
        analysis.status = 'completed';
        await analysis.save();

        // ✅ REDIS: Cache the completed analysis
        try {
            const cacheKey = `analysis_result:${analysisId}`;
            await RedisService.setex(cacheKey, 120, JSON.stringify(analysis)); // 1 hour
            console.log('✅ Completed analysis cached in Redis');
        } catch (cacheError) {
            console.log('⚠️ Completed analysis cache store failed:', cacheError.message);
        }

        logger.info(`Advanced analysis completed successfully: ${analysisId}`);
    } catch (error) {
        const analysis = await Analysis.findById(analysisId);
        if (analysis) {
            analysis.status = 'failed';
            analysis.metadata = { 
                error: error.message,
                analysisType: 'advanced_pattern_analysis'
            };
            await analysis.save();
        }
        logger.error(`Advanced analysis failed for ${analysisId}:`, error);
        throw error;
    }
};


// ✅ REDIS: Enhanced Quick Predict with Caching
export const quickPredict = asyncHandler(async (req, res) => {

    console.log('AI MANAGER TYPE:', typeof aiManager, aiManager);

    const { subjectId, topic } = req.body;

    console.log('🔍 Quick Predict Started for topic:', topic);

    // ✅ REDIS: Generate cache key
    const cacheKey = `quick_predict:${subjectId}:${topic.toLowerCase().trim()}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedResult = await RedisService.getCachedAnalysis(subjectId, topic);
        if (cachedResult) {
            console.log('✅ Serving from Redis cache');
            return res.status(200).json(new ApiResponse(200, {
                ...cachedResult,
                cached: true,
                servedFrom: 'redis_cache',
                cacheTimestamp: new Date().toISOString()
            }, "Quick prediction served from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Cache check failed, proceeding normally:', cacheError.message);
    }

    const subject = await Subject.findOne({
        _id: subjectId,
        userId: req.user._id
    });

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    try {
        // ✅ Check if ChromaDB is available
        const isChromaAvailable = await ChromaService.initialize().catch(() => false);
        
        let similarQuestions = [];
        let confidence = 'Medium';
        let note = '';

        if (isChromaAvailable) {
            console.log('🔍 Using Local ChromaDB for similar question search...');
            similarQuestions = await ChromaService.findSimilarQuestions(topic, subjectId, 3);
            confidence = similarQuestions.length > 0 ? 'High' : 'Medium';
            note = 'Enhanced with similar question analysis';
        } else {
            console.log('⚠️ Local ChromaDB not available, using direct AI prediction');
            note = 'Direct AI prediction (Local vector store not available)';
        }

        // Build prompt based on available data
        let prompt = `You are an exam prediction expert.

IMPORTANT RULES:
- Do NOT invent specifications, numbers, or formats.
- If unsure, keep questions conceptual.
- Do NOT assume fixed sizes, byte lengths, or mandatory fields.
- Stick to standard definitions used in textbooks.

Predict exactly 3 likely exam questions about "${topic}".
Each question must be:
- Factually correct
- Syllabus-oriented
- Conceptual or applied (not speculative)
\n\n`;

        if (similarQuestions.length > 0) {
            prompt += `Based on these similar previous questions:\n${similarQuestions.map(q => `- ${q.pageContent}`).join('\n')}\n\n`;
        }

        prompt += `Consider:
- Important concepts and definitions
- Common problem types  
- Frequently tested areas
- Recent exam trends

Return 3 clear, specific questions that would likely appear in an exam.`;

        // ✅ UNIVERSAL AI CALL
        const { output, provider } = await aiManager.generate(prompt);
        const cleanedOutput = output.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        // Prepare final result
        const finalResult = {
            topic,
            similarPastQuestions: similarQuestions.map(q => ({
                content: q.pageContent.substring(0, 150) + '...',
                metadata: q.metadata
            })),
            predictedQuestions: cleanedOutput,
            confidence: confidence,
            note: note,
            vectorStoreAvailable: isChromaAvailable,
            modelUsed: provider,
            cached: false,
            servedFrom: 'ai_generation',
            generatedAt: new Date().toISOString()
        };

        // ✅ REDIS: Cache the result (5 minutes)
        try {
            await RedisService.cacheAnalysisResult(subjectId, topic, finalResult, 300);
            console.log('✅ Result cached in Redis for 5 minutes');
        } catch (cacheError) {
            console.log('⚠️ Cache store failed:', cacheError.message);
        }

        return res.status(200).json(
            new ApiResponse(200, finalResult, "Quick prediction generated successfully")
        );

    } catch (error) {
        console.log('❌ Quick prediction error:', error);
        
        // Fallback response
        const mockQuestions = `Based on "${topic}", here are 3 predicted exam questions:

1. Explain the core principles and significance of ${topic}.
2. Describe a real-world scenario where ${topic} would be implemented.
3. Compare ${topic} with related technologies or approaches.`;

        const fallbackResult = {
            topic,
            similarPastQuestions: [],
            predictedQuestions: mockQuestions,
            confidence: 'Medium',
            note: 'Fallback prediction',
            vectorStoreAvailable: false,
            isFallback: true,
            cached: false,
            servedFrom: 'fallback',
            generatedAt: new Date().toISOString()
        };

        return res.status(200).json(
            new ApiResponse(200, fallbackResult, "Quick prediction generated (fallback mode)")
        );
    }
});


// Generate questions endpoint
// ✅ REDIS: Enhanced Generate Questions with Caching
export const generateQuestions = asyncHandler(async (req, res) => {
    const { topic, count = 5, difficulty, type } = req.body;

    // ✅ REDIS: Generate cache key
    const cacheKey = `generated_questions:${topic}:${count}:${difficulty}:${type}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedQuestions = await RedisService.get(cacheKey);
        if (cachedQuestions) {
            console.log('✅ Serving generated questions from Redis cache');
            const cachedData = JSON.parse(cachedQuestions);
            return res.status(200).json(new ApiResponse(200, {
                questions: cachedData.questions,
                metadata: cachedData.metadata,
                cached: true,
                servedFrom: 'redis_cache'
            }, "Questions generated successfully from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Questions cache check failed:', cacheError.message);
    }

    try {
        const prompt = `
            Generate ${count} ${difficulty} difficulty ${type} questions about ${topic} for exam preparation.
            Make them educational and exam-focused.
        `;

        const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
        const model = new ChatGoogleGenerativeAI({
            modelName: "gemini-pro",
            maxOutputTokens: 2048,
            temperature: 0.3,
            apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await model.call([{ role: "user", content: prompt }]);

        // Parse the response into structured questions
        const questions = parseGeneratedQuestions(response.content, count);

        const result = {
            questions: questions,
            metadata: {
                topic,
                count,
                difficulty,
                type,
                generatedAt: new Date().toISOString()
            }
        };

        // ✅ REDIS: Cache the generated questions (10 minutes)
        try {
            await RedisService.setex(cacheKey, 120, JSON.stringify(result));
            console.log('✅ Generated questions cached in Redis for 10 minutes');
        } catch (cacheError) {
            console.log('⚠️ Questions cache store failed:', cacheError.message);
        }

        return res.status(200).json(new ApiResponse(200, result, "Questions generated successfully"));
    } catch (error) {
        logger.error("Generate questions failed:", error);
        
        // Fallback mock questions
        const mockQuestions = Array.from({ length: count }, (_, i) => ({
            id: `gen-${Date.now()}-${i}`,
            question: `Sample ${difficulty} question about ${topic} (${type})`,
            type: type || 'application',
            marks: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 5 : 10,
            difficulty,
            topic,
            learningOutcome: `Understand key concepts of ${topic}`,
            modelUsed: 'gemini-pro',
            estimatedTime: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15
        }));

        return res.status(200).json(new ApiResponse(200, { 
            questions: mockQuestions 
        }, "Questions generated successfully (fallback)"));
    }
});

// Helper function to parse generated questions
function parseGeneratedQuestions(content, count) {
    try {
        const lines = content.split('\n').filter(line => line.trim());
        const questions = [];
        
        for (let i = 0; i < Math.min(lines.length, count); i++) {
            if (lines[i].trim() && !lines[i].includes('```')) {
                questions.push({
                    id: `gen-${Date.now()}-${i}`,
                    question: lines[i].replace(/^\d+\.\s*/, '').trim(),
                    type: 'application',
                    marks: 5,
                    difficulty: 'medium',
                    topic: 'General',
                    learningOutcome: 'Understand key concepts',
                    modelUsed: 'gemini-pro',
                    estimatedTime: 10
                });
            }
        }
        
        return questions.length > 0 ? questions : createFallbackQuestions(count);
    } catch (error) {
        return createFallbackQuestions(count);
    }
}

function createFallbackQuestions(count) {
    return Array.from({ length: count }, (_, i) => ({
        id: `fallback-${Date.now()}-${i}`,
        question: `Explain key concepts in your own words (Question ${i + 1})`,
        type: 'explanation',
        marks: 5,
        difficulty: 'medium',
        topic: 'General',
        learningOutcome: 'Understanding and application',
        modelUsed: 'fallback',
        estimatedTime: 10
    }));
}

// Get specific analysis
// ✅ REDIS: Enhanced Get Analysis with Caching
export const getAnalysis = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // ✅ REDIS: Generate cache key
    const cacheKey = `analysis_result:${id}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedAnalysis = await RedisService.get(cacheKey);
        if (cachedAnalysis) {
            console.log('✅ Serving analysis result from Redis cache');
            const cachedData = JSON.parse(cachedAnalysis);
            return res.status(200).json(new ApiResponse(200, { 
                analysis: cachedData,
                cached: true 
            }, "Analysis fetched successfully from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Analysis result cache check failed:', cacheError.message);
    }

    const analysis = await Analysis.findOne({
        _id: id,
        userId: req.user._id
    })
        .populate('subjectId', 'name')
        .populate('documentIds', 'originalName documentType');

    if (!analysis) {
        throw new ApiError(404, "Analysis not found");
    }

    // ✅ REDIS: Cache the analysis result (10 minutes)
    try {
        await RedisService.setex(cacheKey, 120, JSON.stringify(analysis));
        console.log('✅ Analysis result cached in Redis for 10 minutes');
    } catch (cacheError) {
        console.log('⚠️ Analysis result cache store failed:', cacheError.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { analysis }, "Analysis fetched successfully"));
});

// ✅ REDIS: Enhanced Get Analyses with Caching
export const getAnalysesForSubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.query;
    
    // ✅ REDIS: Generate cache key based on query
    const cacheKey = `analyses_list:${req.user._id}:${subjectId || 'all'}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedAnalyses = await RedisService.get(cacheKey);
        if (cachedAnalyses) {
            console.log('✅ Serving analyses list from Redis cache');
            const cachedData = JSON.parse(cachedAnalyses);
            return res.status(200).json(new ApiResponse(200, { 
                analyses: cachedData,
                cached: true 
            }, "Analyses fetched successfully from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Analyses list cache check failed:', cacheError.message);
    }

    const filter = {
        userId: req.user._id
    };

    if (subjectId) {
        filter.subjectId = subjectId;
    }

    const analyses = await Analysis.find(filter)
        .populate('subjectId', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

    // ✅ REDIS: Cache the analyses list (2 minutes)
    try {
        await RedisService.setex(cacheKey, 120, JSON.stringify(analyses));
        console.log('✅ Analyses list cached in Redis for 2 minutes');
    } catch (cacheError) {
        console.log('⚠️ Analyses list cache store failed:', cacheError.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { analyses }, "Analyses fetched successfully"));
});

// test for chroma

// Add this to your analysisController.js
export const testChromaConnection = asyncHandler(async (req, res) => {
    try {
        console.log('🧪 Testing ChromaDB connection...');
        
        const isAvailable = await ChromaService.isChromaAvailable();
        const stats = await ChromaService.getCollectionStats();
        
        return res.status(200).json(new ApiResponse(200, {
            chromaAvailable: isAvailable,
            stats: stats,
            chromaUrl: 'http://localhost:8000'
        }, "ChromaDB connection test completed"));
        
    } catch (error) {
        console.log('❌ ChromaDB test failed:', error);
        return res.status(500).json(new ApiResponse(500, {
            chromaAvailable: false,
            error: error.message
        }, "ChromaDB connection test failed"));
    }
});

// Get all analyses for user
export const getAnalyses = asyncHandler(async (req, res) => {
    const { subjectId } = req.query;
    
    const filter = {
        userId: req.user._id
    };

    if (subjectId) {
        filter.subjectId = subjectId;
    }

    const analyses = await Analysis.find(filter)
        .populate('subjectId', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

    return res
        .status(200)
        .json(new ApiResponse(200, { analyses }, "Analyses fetched successfully"));
});