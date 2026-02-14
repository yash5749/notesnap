import BaseProvider from './BaseProvider.js';
import fetch from 'node-fetch';

export default class OllamaProvider extends BaseProvider {
  constructor(config) {
    super();
    this.name = 'ollama';
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  async generate(prompt) {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false
      })
    });

    const data = await res.json();
    return data.response;
  }
}
