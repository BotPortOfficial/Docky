class Cache {
    cache = new Map();
    defaultTTL = 300000;
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    setTicketCount(userId, category, count) {
        this.set(`ticket_count:${userId}:${category}`, count, 60000);
    }
    getTicketCount(userId, category) {
        return this.get(`ticket_count:${userId}:${category}`);
    }
    setCooldown(userId, timestamp) {
        this.set(`cooldown:${userId}`, timestamp, 10000);
    }
    getCooldown(userId) {
        return this.get(`cooldown:${userId}`);
    }
    setPanelMessage(channelId, messageId) {
        this.set(`panel:${channelId}`, messageId, 3600000);
    }
    getPanelMessage(channelId) {
        return this.get(`panel:${channelId}`);
    }
}
export const cache = new Cache();
//# sourceMappingURL=cache.service.js.map