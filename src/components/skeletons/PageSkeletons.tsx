import React from 'react';

export const HeaderSkeleton = () => (
  <div className="w-full h-16 bg-white border-b border-gray-200">
    <div className="container mx-auto px-4 h-full flex items-center justify-between">
      <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="flex gap-4">
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
    <div className="container mx-auto px-4 pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-16 bg-gray-300 rounded-lg animate-pulse" />
        <div className="h-12 bg-gray-300 rounded-lg animate-pulse w-3/4" />
        <div className="h-14 bg-gray-300 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

export const FieldsListSkeleton = () => (
  <div className="min-h-screen bg-light-cream">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LoginFormSkeleton = () => (
  <div className="min-h-screen bg-light-cream flex items-center justify-center">
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-12 bg-gray-300 rounded-full animate-pulse mt-6" />
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-light-cream">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between py-3 border-b">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const BookingsSkeleton = () => (
  <div className="min-h-screen bg-light-cream">
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 bg-gray-200 rounded animate-pulse w-48 mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-64" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Generic content skeleton for pages without specific skeletons
export const GenericPageSkeleton = () => (
  <div className="min-h-screen bg-light-cream">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);