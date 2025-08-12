import React, { useState, useEffect, useRef } from 'react';

interface ReportUserModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  userName?: string;
  onReport?: (reason: string, details?: string) => void;
}

export default function ReportUserModal({ 
  isOpen = false, 
  onClose, 
  userName = 'this user',
  onReport 
}: ReportUserModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const reportReasons = [
    { id: 'inappropriate', label: 'Inappropriate or offensive language' },
    { id: 'harassment', label: 'Harassment or abusive behavior' },
    { id: 'spam', label: 'Spam or self-promotion' },
    { id: 'false-info', label: 'False or misleading information' },
    { id: 'privacy', label: 'Privacy violation' },
    { id: 'safety', label: 'Safety concerns' },
    { id: 'other', label: 'Other (please specify)' }
  ];

  // Update internal state when prop changes
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    // Add event listener when modal is open
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCancel();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedReason('');
    setOtherReason('');
    if (onClose) {
      onClose();
    }
    console.log('Modal closed - Cancel clicked or clicked outside');
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      alert('Please select a reason for reporting');
      return;
    }
    
    if (selectedReason === 'other' && !otherReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    const reportData = {
      reason: selectedReason,
      details: selectedReason === 'other' ? otherReason : null
    };

    console.log('Report submitted:', reportData);
    
    if (onReport) {
      onReport(selectedReason, selectedReason === 'other' ? otherReason : undefined);
    }
    
    setIsModalOpen(false);
    setSelectedReason('');
    setOtherReason('');
    
    if (onClose) {
      onClose();
    }
    // Add your report user API call here
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-80"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ 
          borderRadius: '32px',
          boxShadow: '0px 22px 70px 0px rgba(0,0,0,0.06)'
        }}
      >
        <div className="p-10">
          {/* Modal Content */}
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h2 
                className="text-3xl font-semibold"
                style={{ 
                  fontSize: '29px',
                  color: '#192215',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Report {userName}
              </h2>
              <p 
                className="text-gray-500"
                style={{ 
                  color: '#8d8d8d',
                  fontSize: '15px',
                  lineHeight: '22px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Help us keep Fieldsy safe and respectful. Choose a reason below to report behavior that violates our community guidelines.
              </p>
            </div>

            {/* Report Reasons */}
            <div className="flex flex-col gap-4">
              {reportReasons.map((reason) => (
                <label 
                  key={reason.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <span 
                    className="text-base bg-whit font-medium"
                    style={{ 
                        backgroundColor: '#ffffff',
                      color: '#192215',
                      fontSize: '15px',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  >
                    {reason.label}
                  </span>
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-5 h-5 bg-white cursor-pointer"
                    style={{
                      backgroundColor: '#ffffff',
                      accentColor: '#3A6B22'
                    }}
                  />
                </label>
              ))}
            </div>

            {/* Text Area for "Other" option */}
            {selectedReason === 'other' && (
              <div className="flex flex-col gap-2">
                <label 
                  className="text-base bg-white font-medium"
                  style={{ 
                    color: '#192215',
                    fontSize: '15px',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  Write Reason
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Write your reason here..."
                  className="w-full p-4 border border-gray-200 bg-white rounded-xl resize-none focus:outline-none focus:border-green-600"
                  rows="4"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    borderColor: '#e3e3e3',
                    focusBorderColor: '#3A6B22'
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-4 px-6 bg-white border-2 rounded-full font-semibold text-center transition-all hover:bg-gray-50"
                style={{ 
                  borderColor: '#3A6B22',
                  color: '#3A6B22',
                  borderRadius: '70px',
                  fontSize: '16px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 px-6 text-white rounded-full font-semibold text-center transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: '#3A6B22',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}