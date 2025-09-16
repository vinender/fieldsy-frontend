import React from 'react';
import { ResponsiveLink } from '@/components/common/ResponsiveLink';
import { useResponsiveRouter } from '@/hooks/useResponsiveRouter';

export default function TestNavigationPage() {
  const router = useResponsiveRouter();

  const handleProgrammaticNav = () => {
    router.push('/fields');
  };

  return (
    <div className="min-h-screen bg-light-cream p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Navigation Test Page</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Responsive Links</h2>
            <div className="space-x-4">
              <ResponsiveLink href="/" className="text-green hover:underline">
                Home
              </ResponsiveLink>
              <ResponsiveLink href="/fields" className="text-green hover:underline">
                Fields
              </ResponsiveLink>
              <ResponsiveLink href="/login" className="text-green hover:underline">
                Login
              </ResponsiveLink>
              <ResponsiveLink href="/register" className="text-green hover:underline">
                Register
              </ResponsiveLink>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Programmatic Navigation</h2>
            <button
              onClick={handleProgrammaticNav}
              className="px-4 py-2 bg-green text-white rounded hover:bg-dark-green"
            >
              Navigate to Fields
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Click any link above - you should see a loading screen immediately</li>
              <li>The loading screen should appear before the page starts navigating</li>
              <li>The loading screen should disappear once the new page loads</li>
              <li>Test both links and the programmatic navigation button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}