import { logger } from '../utils/logger.js';
class PerformanceMonitor {
    metrics = [];
    maxMetrics = 1000;
    slowThreshold = 1000;
    async trackOperation(operation, fn) {
        const startTime = Date.now();
        let success = false;
        let error;
        try {
            const result = await fn();
            success = true;
            return result;
        }
        catch (err) {
            error = err instanceof Error ? err.message : String(err);
            throw err;
        }
        finally {
            const duration = Date.now() - startTime;
            this.recordMetric(operation, duration, success, error);
            if (duration > this.slowThreshold) {
                logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
            }
        }
    }
    recordMetric(operation, duration, success, error) {
        const metric = {
            operation,
            duration,
            timestamp: Date.now(),
            success,
            ...(error && { error }),
        };
        this.metrics.push(metric);
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }
    getSummary(hours = 1) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);
        if (recentMetrics.length === 0) {
            return {
                totalOperations: 0,
                averageDuration: 0,
                successRate: 0,
                errorCount: 0,
                slowestOperation: '',
                slowestDuration: 0,
            };
        }
        const totalOperations = recentMetrics.length;
        const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
        const averageDuration = totalDuration / totalOperations;
        const successCount = recentMetrics.filter(m => m.success).length;
        const successRate = (successCount / totalOperations) * 100;
        const errorCount = totalOperations - successCount;
        const slowest = recentMetrics.reduce((slowest, current) => current.duration > slowest.duration ? current : slowest);
        return {
            totalOperations,
            averageDuration: Math.round(averageDuration),
            successRate: Math.round(successRate * 100) / 100,
            errorCount,
            slowestOperation: slowest.operation,
            slowestDuration: slowest.duration,
        };
    }
    getOperationMetrics(operation, hours = 1) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        return this.metrics.filter(m => m.operation === operation && m.timestamp > cutoff);
    }
    clearOldMetrics(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
        logger.debug(`Cleared metrics older than ${hours} hours`);
    }
    logSummary(hours = 1) {
        const summary = this.getSummary(hours);
        logger.info('Performance Summary:', {
            period: `${hours}h`,
            ...summary,
        });
    }
}
export const performanceMonitor = new PerformanceMonitor();
setInterval(() => {
    performanceMonitor.clearOldMetrics(24);
}, 60 * 60 * 1000);
setInterval(() => {
    performanceMonitor.logSummary(6);
}, 6 * 60 * 60 * 1000);
//# sourceMappingURL=metrics.service.js.map