import BaseProvider from './BaseProvider.js';
import fetch from 'node-fetch';

export default class OpenRouterProvider extends BaseProvider {
  constructor(config) {
    super();
    this.name = 'openrouter';
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async generate(prompt) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    return data.choices[0].message.content;
  }
}
