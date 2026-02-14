export function normalizeGeneratedQuestions(
  rawQuestions = [],
  subjectName,
  modelUsed = 'ai'
) {
  const now = Date.now();

  return rawQuestions.map((q, index) => ({
    id: `gen_${now}_${index}`,

    question: q.question || q.text || 'Explain the given concept',

    // 🔥 REQUIRED BY SCHEMA
    type: q.type || inferQuestionType(q.question || ''),

    topic: q.topic || subjectName,

    difficulty: q.difficulty || 'medium',

    marks: q.marks || q.expectedMarks || 5,

    learningOutcome:
      q.learningOutcome ||
      q.reasoning ||
      `Understand and explain ${subjectName}`,

    modelUsed,

    estimatedTime: q.estimatedTime || 10
  }));
}

/**
 * Infer question type safely when AI does not provide it
 */
function inferQuestionType(text) {
  const t = text.toLowerCase();

  if (t.includes('define') || t.includes('what is')) return 'definition';
  if (t.includes('derive')) return 'derivation';
  if (t.includes('calculate') || t.includes('solve')) return 'problem';

  return 'application'; // safest default
}
