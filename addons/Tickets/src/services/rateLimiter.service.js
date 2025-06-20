import { logger } from '../utils/logger.js';
class RateLimiter {
    limits = new Map();
    cleanupInterval = 60000;
    constructor() {
        setInterval(() => this.cleanup(), this.cleanupInterval);
    }
    isRateLimited(userId, action, maxRequests = 5, windowMs = 60000) {
        const key = `${userId}:${action}`;
        const now = Date.now();
        const entry = this.limits.get(key);
        if (!entry || now > entry.resetTime) {
            this.limits.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return false;
        }
        if (entry.count >= maxRequests) {
            logger.warn(`Rate limit exceeded for user ${userId} on action ${action}`);
            return true;
        }
        entry.count++;
        return false;
    }
    getRemainingRequests(userId, action, maxRequests = 5) {
        const key = `${userId}:${action}`;
        const entry = this.limits.get(key);
        if (!entry || Date.now() > entry.resetTime) {
            return maxRequests;
        }
        return Math.max(0, maxRequests - entry.count);
    }
    getResetTime(userId, action) {
        const key = `${userId}:${action}`;
        const entry = this.limits.get(key);
        if (!entry || Date.now() > entry.resetTime) {
            return null;
        }
        return entry.resetTime;
    }
    reset(userId, action) {
        const key = `${userId}:${action}`;
        this.limits.delete(key);
    }
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.limits.entries()) {
            if (now > entry.resetTime) {
                this.limits.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
        }
    }
    getInfo(userId, action) {
        const key = `${userId}:${action}`;
        const entry = this.limits.get(key);
        const now = Date.now();
        if (!entry || now > entry.resetTime) {
            return {
                limited: false,
                remaining: 5,
                resetTime: null,
            };
        }
        return {
            limited: entry.count >= 5,
            remaining: Math.max(0, 5 - entry.count),
            resetTime: entry.resetTime,
        };
    }
}
export const rateLimiter = new RateLimiter();
export const RATE_LIMITS = {
    TICKET_CREATION: { maxRequests: 3, windowMs: 60000 },
    TICKET_ACTION: { maxRequests: 10, windowMs: 60000 },
    PANEL_INTERACTION: { maxRequests: 20, windowMs: 60000 },
};
//# sourceMappingURL=rateLimiter.service.js.map