import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/router';

interface ClaimSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldName?: string;
  fieldId?: string;
}

export const ClaimSuccessModal: React.FC<ClaimSuccessModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  fieldId
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleBackToField = () => {
    onClose();
    if (fieldId) {
      router.push(`/fields/${fieldId}`);
    }
  };

  const handleBackToHome = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-50 animation-delay-200" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark-green mb-3">
            Thank You!
          </h2>
          
          <p className="text-gray-600 mb-2">
            Your claim request for
          </p>
          
          {fieldName && (
            <p className="text-lg font-semibold text-dark-green mb-4">
              "{fieldName}"
            </p>
          )}
          
          <p className="text-gray-600 mb-8">
            has been submitted successfully. We'll review your documents and get back to you within 2-3 business days.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBackToField}
              className="w-full py-3 px-6 bg-[#3A6B22] text-white rounded-full font-semibold hover:bg-[#2D5A1B] transition-colors"
            >
              Back to Field
            </button>
            
            <button
              onClick={handleBackToHome}
              className="w-full py-3 px-6 border border-gray-300 text-dark-green rounded-full font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">What's next?</span> You'll receive an email confirmation shortly. Our team will verify your ownership documents and notify you once your claim is approved.
          </p>
        </div>
      </div>
    </div>
  );
};

// Add CSS for animation delay
const styles = `
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .animation-delay-200 {
    animation-delay: 200ms;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}