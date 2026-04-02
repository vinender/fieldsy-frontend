import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { apiClient } from '@/lib/api/client';
import BackButton from '@/components/common/BackButton';
import { ChevronLeft } from 'lucide-react';
import { useTerms } from '@/hooks/useTerms';
import { cn } from '@/lib/utils';



const TermsConditions = () => {
  const router = useRouter();
  const [isMobileApp, setIsMobileApp] = useState(false);
  const { data: termsData, isLoading: loading } = useTerms();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isApp = params.get('mobile') === 'true' ||
        params.get('source') === 'mobile' ||
        params.get('app') === 'true';
      setIsMobileApp(isApp);
    }
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFCF3]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-green"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#FFFCF3] font-sans",
      isMobileApp ? "mt-0" : "mt-20"
    )}>
      {/* Main Container */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-8 lg:py-10">

        {/* Back Button and Title */}
        {!isMobileApp && (
          <div className="flex items-center mt-[20px]  gap-4 mb-8 lg:mb-10">
            <BackButton size="lg" />
            <h1 className="text-2xl sm:text-3xl lg:text-[29px] font-semibold text-dark-green drop-shadow-sm">
              Terms & Conditions
            </h1>
          </div>
        )}

        {/* White Content Card */}
        <div className="bg-white rounded-3xl lg:rounded-[40px] shadow-[0px_14px_24px_0px_rgba(0,0,0,0.06)] p-6 sm:p-8 lg:p-8">

          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-xl lg:text-[20px] font-semibold text-[#0A2533] mb-2">
              Fieldsy – Terms & Conditions
            </h2>
            <div className="text-base lg:text-[16px] text-[#6B737D] leading-relaxed">
              <p className="mb-1">Effective Date: 24 Jun, 2025</p>
              <p>Welcome to Fieldsy! These Terms & Conditions ("Terms") govern your use of the Fieldsy platform (website and mobile app). By using Fieldsy, you agree to be bound by these Terms.</p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {termsData?.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl lg:text-[20px] font-semibold text-[#0A2533]">
                  {section.title}
                </h3>
                {section.isList && Array.isArray(section.content) ? (
                  <ul className="list-disc list-inside text-base lg:text-[16px] text-[#6B737D] leading-[28px] space-y-1 ml-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="ml-4">
                        <span className="ml-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base lg:text-[16px] text-[#6B737D] leading-[28px] whitespace-pre-line">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;

// Use getStaticProps to pre-render this page at build time
export const getStaticProps: GetStaticProps = async () => {
  // Since terms and conditions is static content, we don't need to fetch anything
  // Just return empty props to enable static generation
  return {
    props: {},
  };
};