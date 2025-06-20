interface PerformanceMetric {
    operation: string;
    duration: number;
    timestamp: number;
    success: boolean;
    error?: string | undefined;
}
interface MetricsSummary {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    errorCount: number;
    slowestOperation: string;
    slowestDuration: number;
}
declare class PerformanceMonitor {
    private metrics;
    private readonly maxMetrics;
    private readonly slowThreshold;
    trackOperation<T>(operation: string, fn: () => Promise<T>): Promise<T>;
    private recordMetric;
    getSummary(hours?: number): MetricsSummary;
    getOperationMetrics(operation: string, hours?: number): PerformanceMetric[];
    clearOldMetrics(hours?: number): void;
    logSummary(hours?: number): void;
}
export declare const performanceMonitor: PerformanceMonitor;
export {};
//# sourceMappingURL=metrics.service.d.ts.map