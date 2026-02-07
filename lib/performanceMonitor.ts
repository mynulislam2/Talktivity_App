/**
 * Performance Monitoring Utility
 *
 * Tracks app performance metrics:
 * - Screen load times
 * - Navigation transitions
 * - API response times
 * - Memory usage
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type: 'measure' | 'navigation' | 'api' | 'render';
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = true;

  /**
   * Start measuring a metric
   */
  startMeasure(name: string, type: PerformanceMetric['type'] = 'measure') {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      type,
      startTime: Date.now(),
    };

    this.metrics.set(name, metric);
  }

  /**
   * End measuring a metric
   */
  endMeasure(name: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Metric '${name}' not started`);
      return;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.metadata = metadata;

    this.logMetric(metric);
  }

  /**
   * Measure a function execution
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    type: PerformanceMetric['type'] = 'measure',
  ): Promise<T> {
    this.startMeasure(name, type);

    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name, { error: true });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    type: PerformanceMetric['type'] = 'measure',
  ): T {
    this.startMeasure(name, type);

    try {
      const result = fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name, { error: true });
      throw error;
    }
  }

  /**
   * Log a metric to console and analytics
   */
  private logMetric(metric: PerformanceMetric) {
    const { name, duration, type, metadata } = metric;

    if (!duration) return;

    // Development logging
    if (__DEV__) {
      const color = this.getDurationColor(duration, type);
      console.log(
        `⏱️ [${type}] ${name}: ${duration}ms`,
        metadata ? `(${JSON.stringify(metadata)})` : '',
      );
    }

    // TODO: Send to analytics service (Mixpanel, Amplitude, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   analytics.track('performance_metric', {
    //     name,
    //     duration,
    //     type,
    //     ...metadata,
    //   });
    // }

    // Warn if slow
    this.warnIfSlow(metric);
  }

  /**
   * Get color based on duration
   */
  private getDurationColor(
    duration: number,
    type: PerformanceMetric['type'],
  ): string {
    switch (type) {
      case 'navigation':
        return duration > 300 ? '🔴' : '🟢'; // Warn if nav takes > 300ms
      case 'api':
        return duration > 2000 ? '🔴' : '🟢'; // Warn if API takes > 2s
      case 'render':
        return duration > 16.67 ? '🟡' : '🟢'; // Warn if render takes > 16.67ms (60fps)
      default:
        return '🟢';
    }
  }

  /**
   * Warn if metric is slow
   */
  private warnIfSlow(metric: PerformanceMetric) {
    const { name, duration, type } = metric;
    if (!duration) return;

    let threshold = 0;
    let action = '';

    switch (type) {
      case 'navigation':
        threshold = 300;
        action = 'Navigation';
        break;
      case 'api':
        threshold = 2000;
        action = 'API Request';
        break;
      case 'render':
        threshold = 16.67;
        action = 'Screen Render';
        break;
      default:
        return;
    }

    if (duration > threshold && __DEV__) {
      console.warn(
        `⚠️ ${action} slow: "${name}" took ${duration}ms (threshold: ${threshold}ms)`,
      );
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get average duration for metric type
   */
  getAverageDuration(type: PerformanceMetric['type']): number {
    const typeMetrics = Array.from(this.metrics.values()).filter(
      (m) => m.type === type && m.duration,
    );

    if (typeMetrics.length === 0) return 0;

    const totalDuration = typeMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / typeMetrics.length;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Clear metrics by type
   */
  clearByType(type: PerformanceMetric['type']) {
    Array.from(this.metrics.entries()).forEach(([key, metric]) => {
      if (metric.type === type) {
        this.metrics.delete(key);
      }
    });
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Get a summary of metrics
   */
  getSummary(): Record<string, any> {
    const metrics = Array.from(this.metrics.values());
    const typeGroups = metrics.reduce(
      (acc, m) => {
        if (!acc[m.type]) {
          acc[m.type] = [];
        }
        acc[m.type].push(m);
        return acc;
      },
      {} as Record<string, PerformanceMetric[]>,
    );

    const summary: Record<string, any> = {};
    Object.entries(typeGroups).forEach(([type, typeMetrics]) => {
      const durations = typeMetrics
        .map((m) => m.duration || 0)
        .filter((d) => d > 0);

      if (durations.length > 0) {
        summary[type] = {
          count: durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          avg:
            durations.reduce((a, b) => a + b, 0) / durations.length,
          total: durations.reduce((a, b) => a + b, 0),
        };
      }
    });

    return summary;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
