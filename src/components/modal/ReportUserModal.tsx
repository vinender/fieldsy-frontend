import React, { useState, useEffect, useRef } from 'react';
import { useCreateReport } from '@/hooks/queries/useUserReportQueries';
import { toast } from 'sonner';

interface ReportUserModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  userName?: string;
  userId?: string;
  onReport?: (reason: string, details?: string) => void;
}

export default function ReportUserModal({ 
  isOpen = false, 
  onClose, 
  userName = 'this user',
  userId,
  onReport 
}: ReportUserModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const createReportMutation = useCreateReport();

  const reportReasons = [
    { id: 'inappropriate_behavior', label: 'Inappropriate or offensive behavior' },
    { id: 'property_damage', label: 'Property damage or vandalism' },
    { id: 'no_show', label: 'No show without notice' },
    { id: 'harassment', label: 'Harassment or abusive behavior' },
    { id: 'safety_concern', label: 'Safety concerns' },
    { id: 'payment_issue', label: 'Payment issue or fraud' },
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

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    
    if (selectedReason === 'other' && !otherReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    if (!userId) {
      toast.error('User information is missing');
      return;
    }

    try {
      await createReportMutation.mutateAsync({
        reportedUserId: userId,
        reportOption: selectedReason,
        reason: selectedReason === 'other' ? otherReason : undefined
      });

      if (onReport) {
        onReport(selectedReason, selectedReason === 'other' ? otherReason : undefined);
      }
      
      setIsModalOpen(false);
      setSelectedReason('');
      setOtherReason('');
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Failed to submit report:', error);
    }
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
                className="text-3xl font-semibold text-dark-green font-sans"
                style={{ 
                  fontSize: '29px'
                }}
              >
                Report {userName}
              </h2>
              <p 
                className="text-gray-text font-sans"
                style={{ 
                  fontSize: '15px',
                  lineHeight: '22px'
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
                    className="text-base bg-white font-medium text-dark-green font-sans"
                    style={{ 
                      fontSize: '15px'
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
                    className="w-5 h-5 bg-white cursor-pointer accent-green"
                  />
                </label>
              ))}
            </div>

            {/* Text Area for "Other" option */}
            {selectedReason === 'other' && (
              <div className="flex flex-col gap-2">
                <label 
                  className="text-base bg-white font-medium text-dark-green font-sans"
                  style={{ 
                    fontSize: '15px'
                  }}
                >
                  Write Reason
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Write your reason here..."
                  className="w-full p-4 border border-gray-border bg-white rounded-xl resize-none focus:outline-none focus:border-green font-sans"
                  rows={4}
                  style={{
                    fontSize: '15px'
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-4 px-6 bg-white border-2 border-green text-green rounded-full font-semibold text-center transition-all hover:bg-gray-50 font-sans"
                style={{ 
                  borderRadius: '70px',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createReportMutation.isPending}
                className="flex-1 py-4 px-6 bg-green text-white rounded-full font-semibold text-center transition-all hover:opacity-90 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderRadius: '50px',
                  fontSize: '16px'
                }}
              >
                {createReportMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}