import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseProvider from './BaseProvider.js';

export default class GeminiProvider extends BaseProvider {
  constructor(config) {
    super();
    this.name = 'gemini';
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = this.client.getGenerativeModel({
      model: config.model,
      generationConfig: config.generationConfig
    });
  }

  async generate(prompt) {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
