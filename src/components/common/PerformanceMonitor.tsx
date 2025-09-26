import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  }>({});
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        setMetrics(prev => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime }));
      });
      
      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // LCP not supported
      }
      
      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: fcpEntry?.startTime,
        }));
      }
    }
  }, [router.pathname]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-2">Performance Metrics</div>
      <div>FCP: {metrics.fcp?.toFixed(0) || '---'}ms</div>
      <div>LCP: {metrics.lcp?.toFixed(0) || '---'}ms</div>
      <div>TTFB: {metrics.ttfb?.toFixed(0) || '---'}ms</div>
    </div>
  );
}