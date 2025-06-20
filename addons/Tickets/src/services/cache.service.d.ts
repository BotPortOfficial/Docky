declare class Cache {
    private cache;
    private readonly defaultTTL;
    set<T>(key: string, data: T, ttl?: number): void;
    get<T>(key: string): T | null;
    delete(key: string): void;
    clear(): void;
    setTicketCount(userId: string, category: string, count: number): void;
    getTicketCount(userId: string, category: string): number | null;
    setCooldown(userId: string, timestamp: number): void;
    getCooldown(userId: string): number | null;
    setPanelMessage(channelId: string, messageId: string): void;
    getPanelMessage(channelId: string): string | null;
}
export declare const cache: Cache;
export {};
//# sourceMappingURL=cache.service.d.ts.map