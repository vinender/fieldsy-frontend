import React from 'react';
import { useRouter } from 'next/router';
import { Check } from 'lucide-react';
import { getUserImage, getUserInitials } from '@/utils/getUserImage';
import { useSession } from 'next-auth/react';

interface OwnerInformationProps {
  owner: {
    id?: string;
    name?: string;
    email?: string;
    isVerified?: boolean;
    createdAt?: string;
    profileImage?: string;
  };
  fieldId?: string;
  className?: string;
  showMessage?: boolean;
}

export default function OwnerInformation({
  owner,
  fieldId,
  className = '',
  showMessage = true
}: OwnerInformationProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Format the joined date to show "Month Year" format
  const formatJoinedDate = (dateString?: string) => {
    if (!dateString) {
      // If no date provided, use current date
      const currentDate = new Date();
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If invalid date, use current date
      const currentDate = new Date();
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleMessageClick = () => {
    // Check if user is authenticated
    if (!session) {
      // Save the intended action in sessionStorage
      if (owner?.id) {
        sessionStorage.setItem('messageIntentUserId', owner.id);
        if (fieldId) {
          sessionStorage.setItem('messageIntentFieldId', fieldId);
        }
      }
      // Redirect to login with return URL
      router.push('/login?redirect=/user/messages');
    } else if (owner?.id) {
      // Navigate to messages page with the field owner's ID
      router.push(`/user/messages?userId=${owner.id}`);
    }
  };

  return (
    <div className={className}>
      <h3 className="text-[18px] font-bold text-dark-green mb-2.5">Owner Information</h3>
      <div className="bg-[#F8F1D7] rounded-lg p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={getUserImage(owner) || ''}
            alt={owner.name || 'Field Owner'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[16px] font-medium text-[#090F1F]">
                {owner.name || owner.email || 'Field Owner'}
              </span>
              {owner.isVerified && <Check className="w-4 h-4 text-[#3A6B22]" />}
            </div>
            <span className="text-[14px] text-[#545662]/70">
              Joined {formatJoinedDate(owner.createdAt)}
            </span>
          </div>
        </div>
        {showMessage && (
          <button
            onClick={handleMessageClick}
            className="bg-white border border-[#8FB366]/40 rounded-[10px] px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            <img src='/msg.svg' className="w-5 h-5" alt="Message" />
            <span className="text-[12px] font-semibold text-dark-green">Send a Message</span>
          </button>
        )}
      </div>
    </div>
  );
}
