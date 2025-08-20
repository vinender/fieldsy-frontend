// Performance monitoring for lazy loading
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  private static measures: Map<string, number> = new Map();

  static mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      this.marks.set(name, performance.now());
      console.debug(`[Performance] Mark: ${name}`);
    }
  }

  static measure(name: string, startMark: string, endMark?: string) {
    if (typeof window !== 'undefined' && window.performance) {
      const start = this.marks.get(startMark);
      const end = endMark ? this.marks.get(endMark) : performance.now();
      
      if (start && end) {
        const duration = end - (typeof start === 'number' ? start : 0);
        this.measures.set(name, duration);
        console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    }
    return 0;
  }

  static getMetrics() {
    return {
      marks: Array.from(this.marks.entries()),
      measures: Array.from(this.measures.entries()),
    };
  }

  static clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

// Utility to check if we should use lazy loading based on connection speed
export function shouldUseLazyLoading(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Check if Save-Data header is set
  const connection = (navigator as any).connection;
  if (connection?.saveData) {
    return true;
  }
  
  // Check connection speed
  if (connection?.effectiveType) {
    // Use lazy loading for slower connections
    return ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
  }
  
  // Default to using lazy loading
  return true;
}

// Preload component when idle
export function preloadWhenIdle(loadComponent: () => Promise<any>) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadComponent();
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      loadComponent();
    }, 1000);
  }
}