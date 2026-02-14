export default class AIManager {
  constructor(providers = []) {
    this.providers = providers;
  }

  async generate(prompt) {
    for (const provider of this.providers) {
      try {
        return {
          output: await provider.generate(prompt),
          provider: provider.name
        };
      } catch (err) {
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }
}
