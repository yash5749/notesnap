import redis from 'redis';
import env from '../config/env.js';
import logger from '../utils/logger.js';

class RedisService {
  constructor() {
    this.client = null;
    this.connect();
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: env.REDIS_URL
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis connected successfully');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
    }
  }

  async get(key) {
    try {
      if (!this.client) {
        await this.connect();
      }
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, expireSeconds = 3600) {
    try {
      if (!this.client) {
        await this.connect();
      }
      await this.client.set(key, value, {
        EX: expireSeconds
      });
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.client) {
        await this.connect();
      }
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  }

  async quit() {
    try {
      if (this.client) {
        await this.client.quit();
      }
    } catch (error) {
      logger.error('Redis quit error:', error);
    }
  }
}

export default new RedisService();