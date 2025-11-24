import redis from 'redis';
import logger from '../utils/logger.js';

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async connect() {
        if (this.isConnected && this.client) return this.client;

        try {
            console.log('🔄 Connecting to Redis...');
            
            this.client = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    connectTimeout: 60000,
                    lazyConnect: true
                }
            });

            this.client.on('error', (err) => {
                console.log('❌ Redis error:', err.message);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('✅ Redis connected successfully');
                this.isConnected = true;
                this.retryCount = 0;
            });

            this.client.on('disconnect', () => {
                console.log('🔌 Redis disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
            return this.client;

        } catch (error) {
            console.log('❌ Redis connection failed:', error.message);
            this.isConnected = false;
            this.retryCount++;
            
            if (this.retryCount <= this.maxRetries) {
                console.log(`🔄 Retrying Redis connection (${this.retryCount}/${this.maxRetries})...`);
                setTimeout(() => this.connect(), 2000);
            }
            return null;
        }
    }

    async get(key) {
        try {
            const client = await this.connect();
            if (!client) {
                console.log('⚠️ Redis not available for get');
                return null;
            }
            const value = await client.get(key);
            if (value) {
                console.log(`✅ Redis cache HIT for key: ${key}`);
            } else {
                console.log(`❌ Redis cache MISS for key: ${key}`);
            }
            return value;
        } catch (error) {
            console.log('❌ Redis get failed:', error.message);
            return null;
        }
    }

    async setex(key, seconds, value) {
        try {
            const client = await this.connect();
            if (!client) {
                console.log('⚠️ Redis not available for setex');
                return false;
            }
            await client.setEx(key, seconds, value);
            console.log(`✅ Redis cache SET for key: ${key} (${seconds}s)`);
            return true;
        } catch (error) {
            console.log('❌ Redis setex failed:', error.message);
            return false;
        }
    }

    async del(key) {
        try {
            const client = await this.connect();
            if (!client) return false;
            await client.del(key);
            console.log(`✅ Redis cache DEL for key: ${key}`);
            return true;
        } catch (error) {
            console.log('❌ Redis del failed:', error.message);
            return false;
        }
    }

    async exists(key) {
        try {
            const client = await this.connect();
            if (!client) return false;
            const result = await client.exists(key);
            return result === 1;
        } catch (error) {
            console.log('❌ Redis exists failed:', error.message);
            return false;
        }
    }

    // Cache analysis results
    async cacheAnalysisResult(subjectId, topic, result, ttlSeconds = 300) {
        const cacheKey = `analysis:${subjectId}:${topic}`;
        return await this.setex(cacheKey, ttlSeconds, JSON.stringify(result));
    }

    async getCachedAnalysis(subjectId, topic) {
        const cacheKey = `analysis:${subjectId}:${topic}`;
        const cached = await this.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
    }

    // Cache document processing status
    async cacheDocumentStatus(documentId, status, ttlSeconds = 3600) {
        const cacheKey = `doc:${documentId}:status`;
        const statusData = {
            ...status,
            cachedAt: new Date().toISOString(),
            ttl: ttlSeconds
        };
        return await this.setex(cacheKey, ttlSeconds, JSON.stringify(statusData));
    }

    async getDocumentStatus(documentId) {
        const cacheKey = `doc:${documentId}:status`;
        const cached = await this.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
    }

    // User session cache
    async cacheUserSession(userId, userData, ttlSeconds = 3600) {
        const cacheKey = `user:${userId}`;
        return await this.setex(cacheKey, ttlSeconds, JSON.stringify(userData));
    }

    async getCachedUser(userId) {
        const cacheKey = `user:${userId}`;
        const cached = await this.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
    }

    // Health check
    async health() {
        try {
            const client = await this.connect();
            if (!client) return { status: 'disconnected', connected: false };
            
            await client.ping();
            return { status: 'connected', connected: true };
        } catch (error) {
            return { status: 'error', connected: false, error: error.message };
        }
    }
}

export default new RedisService();