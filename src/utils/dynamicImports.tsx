import dynamic from 'next/dynamic';
import { ComponentType, useEffect } from 'react';
import GreenSpinner from '@/components/common/GreenSpinner';

/**
 * Helper function to create dynamic imports with consistent loading state
 */
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    ssr?: boolean;
    loading?: ComponentType;
  }
) {
  return dynamic(importFn, {
    ssr: options?.ssr ?? true,
    loading: options?.loading || (() => (
      <div className="flex justify-center items-center min-h-[200px]">
        <GreenSpinner size="medium" />
      </div>
    )),
  });
}

// Pre-configured dynamic imports for heavy components
export const DynamicComponents = {
  // Maps and location-based components
  FieldMap: createDynamicComponent(
    () => import('@/components/common/FieldMap'),
    { ssr: false }
  ),
  
  // Chat and real-time components
  ChatModal: createDynamicComponent(
    () => import('@/components/modal/ChatModal'),
    { ssr: false }
  ),
  
  // Heavy modals
  BookingDetailsModal: createDynamicComponent(
    () => import('@/components/modal/BookingDetailModal').then(mod => ({ 
      default: mod.BookingDetailsModal 
    }))
  ),
  
  // Payment components
  PaymentForm: createDynamicComponent(
    () => import('@/components/payment/PaymentForm'),
    { ssr: false }
  ),
  
  // Rich text editors or heavy forms
  FieldForm: createDynamicComponent(
    () => import('@/components/forms/FieldForm'),
    { ssr: false }
  ),
  
  // Image galleries and uploaders
  ImageUploader: createDynamicComponent(
    () => import('@/components/ui/image-uploader')
  ),
  
  // Charts and data visualization
  DashboardCharts: createDynamicComponent(
    () => import('@/components/dashboard/Charts'),
    { ssr: false }
  ),
};

/**
 * Utility to prefetch dynamic components
 */
export async function prefetchDynamicComponent(componentName: keyof typeof DynamicComponents) {
  const component = DynamicComponents[componentName];
  if (component && typeof component.preload === 'function') {
    await component.preload();
  }
}

/**
 * Hook to prefetch multiple dynamic components
 */
export function usePrefetchDynamicComponents(componentNames: (keyof typeof DynamicComponents)[]) {
  useEffect(() => {
    componentNames.forEach(name => {
      prefetchDynamicComponent(name).catch(console.error);
    });
  }, []);
}