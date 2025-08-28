import React, { useState, useEffect, useRef } from 'react';
import { useBlockUser } from '@/hooks/queries/useUserBlockQueries';
import { toast } from 'sonner';

interface BlockUserModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  userName?: string;
  userId?: string;
  onBlock?: () => void;
}

export default function BlockUserModal({ 
  isOpen = false, 
  onClose, 
  userName = 'this user',
  userId,
  onBlock 
}: BlockUserModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [reason, setReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const blockUserMutation = useBlockUser();
  
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
    setReason('');
    if (onClose) {
      onClose();
    }
  };

  const handleBlock = async () => {
    if (!userId) {
      toast.error('User information is missing');
      return;
    }

    try {
      await blockUserMutation.mutateAsync({
        blockedUserId: userId,
        reason: reason || undefined
      });
      
      if (onBlock) {
        onBlock();
      }
      
      setIsModalOpen(false);
      setReason('');
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Failed to block user:', error);
    }
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-80"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4"
        style={{ 
          borderRadius: '32px',
          boxShadow: '0px 22px 70px 0px rgba(0,0,0,0.06)'
        }}
      >
        <div className="p-10">
          {/* Modal Content */}
          <div className="flex flex-col items-center gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 
                className="text-3xl font-bold text-black"
                style={{ 
                  fontSize: '32px',
                  lineHeight: '40px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Block User?
              </h2>
              <p 
                className="text-gray-500 text-lg max-w-xl"
                style={{ 
                  color: '#8d8d8d',
                  fontSize: '18px',
                  lineHeight: '28px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Are you sure you want to block {userName}? They will no longer be able to message you.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={handleCancel}
                className="flex-1 py-4 px-6 bg-white border-2 rounded-full font-bold text-center transition-all hover:bg-gray-50"
                style={{ 
                  borderColor: '#3A6B22',
                  color: '#3A6B22',
                  borderRadius: '70px',
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={blockUserMutation.isPending}
                className="flex-1 py-4 px-6 text-white rounded-full font-bold text-center transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#3A6B22',
                  borderRadius: '70px',
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                {blockUserMutation.isPending ? 'Blocking...' : "Yes, I'm Sure"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}