declare class RateLimiter {
    private limits;
    private readonly cleanupInterval;
    constructor();
    isRateLimited(userId: string, action: string, maxRequests?: number, windowMs?: number): boolean;
    getRemainingRequests(userId: string, action: string, maxRequests?: number): number;
    getResetTime(userId: string, action: string): number | null;
    reset(userId: string, action: string): void;
    private cleanup;
    getInfo(userId: string, action: string): {
        limited: boolean;
        remaining: number;
        resetTime: number | null;
    };
}
export declare const rateLimiter: RateLimiter;
export declare const RATE_LIMITS: {
    readonly TICKET_CREATION: {
        readonly maxRequests: 3;
        readonly windowMs: 60000;
    };
    readonly TICKET_ACTION: {
        readonly maxRequests: 10;
        readonly windowMs: 60000;
    };
    readonly PANEL_INTERACTION: {
        readonly maxRequests: 20;
        readonly windowMs: 60000;
    };
};
export {};
//# sourceMappingURL=rateLimiter.service.d.ts.map