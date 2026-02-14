export default class BaseProvider {
  constructor() {
    this.name = 'base';
  }

  async generate(prompt) {
    throw new Error('generate() not implemented');
  }
}
