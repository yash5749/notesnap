import GeminiProvider from './providers/GeminiProvider.js';
import OllamaProvider from './providers/OllamaProvider.js';
import OpenRouterProvider from './providers/OpenRouterProvider.js';
import AIManager from './AIManager.js';

const providersMap = {
  gemini: () =>
    new GeminiProvider({
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL
    }),

  ollama: () =>
    new OllamaProvider({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: process.env.OLLAMA_MODEL
    }),

  openrouter: () =>
    new OpenRouterProvider({
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL
    })
};

const order = (process.env.AI_PROVIDER_ORDER || '')
  .split(',')
  .map(p => p.trim())
  .filter(Boolean);

const providers = [];

for (const key of order) {
  if (providersMap[key]) {
    try {
      providers.push(providersMap[key]());
    } catch {
      // ignore misconfigured providers
    }
  }
}

const aiManager = new AIManager(providers);

export default  aiManager;
