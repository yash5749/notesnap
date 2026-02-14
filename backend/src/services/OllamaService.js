import fetch from 'node-fetch';

class OllamaService {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.model = 'deepseek-r1:1.5b'; // or deepseek-coder, deepseek-llm
  }

  async generate(prompt) {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.95,
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return data.response;
  }
}

export default new OllamaService();
