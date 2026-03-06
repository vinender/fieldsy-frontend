import React from 'react';
import { CheckCircle, XCircle, Clock, Power, FileText, Shield } from 'lucide-react';

interface FieldStatusBadgesProps {
  isSubmitted: boolean;
  isActive: boolean;
  isApproved?: boolean;
  isClaimed?: boolean;
  variant?: 'card' | 'detail'; // 'card' for compact view, 'detail' for full view
  hideActiveStatus?: boolean; // Hide active/disabled badge (useful when a separate toggle is shown)
}

type StatusType = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'disabled' | 'claimed' | 'unclaimed';

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  tooltip: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  draft: {
    label: 'Draft',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: <FileText className="w-3 h-3" />,
    tooltip: 'Field is still in draft mode. Complete and submit to go live.',
  },
  pending_approval: {
    label: 'Pending Approval',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: <Clock className="w-3 h-3" />,
    tooltip: 'Waiting for admin approval before your field can go live.',
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-green-100',
    textColor: 'text-white bg-green',
    icon: <CheckCircle className="w-3 h-3" />,
    tooltip: 'Your field has been approved by admin.',
  },
  rejected: {
    label: 'Rejected',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: <XCircle className="w-3 h-3" />,
    tooltip: 'Your field was rejected. Please review and resubmit.',
  },
  active: {
    label: 'Live',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
    icon: <Power className="w-3 h-3" />,
    tooltip: 'Your field is live and visible to dog owners.',
  },
  disabled: {
    label: 'Disabled',
    bgColor: 'bg-gray-400',
    textColor: 'text-white',
    icon: <Power className="w-3 h-3" />,
    tooltip: 'You have disabled this field. Enable it to accept bookings.',
  },
  claimed: {
    label: 'Claimed',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: <Shield className="w-3 h-3" />,
    tooltip: 'You have claimed ownership of this field.',
  },
  unclaimed: {
    label: 'Unclaimed',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: <Shield className="w-3 h-3" />,
    tooltip: 'This field has not been claimed yet.',
  },
};

export function FieldStatusBadges({
  isSubmitted,
  isActive,
  isApproved,
  isClaimed,
  variant = 'card',
  hideActiveStatus = false
}: FieldStatusBadgesProps) {
  // Determine the primary status based on the field state
  const getStatuses = (): StatusType[] => {
    const statuses: StatusType[] = [];

    // 1. Draft status (not submitted yet)
    if (!isSubmitted) {
      return ['draft'];
    }

    // 2. Approval status (for submitted fields)
    if (isApproved === false) {
      statuses.push('pending_approval');
    } else if (isApproved === true) {
      statuses.push('approved');
    }

    // 3. Active/Disabled status (only show if approved and not hidden)
    if (!hideActiveStatus && isApproved !== false) {
      if (isActive) {
        statuses.push('active');
      } else {
        statuses.push('disabled');
      }
    }

    // 4. Claimed status (optional, show if explicitly set)
    // if (isClaimed !== undefined) {
    //   statuses.push(isClaimed ? 'claimed' : 'unclaimed');
    // }

    return statuses;
  };

  const statuses = getStatuses();

  if (variant === 'card') {
    // Compact view for field cards - show primary status prominently
    return (
      <div className="flex flex-col gap-1.5">
        {statuses.map((status) => {
          const config = statusConfigs[status];
          return (
            <div
              key={status}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
              title={config.tooltip}
            >
              {config.icon}
              <span>{config.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Detail view - more informative display
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const config = statusConfigs[status];
        return (
          <div
            key={status}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${config.bgColor} ${config.textColor}`}
            title={config.tooltip}
          >
            {config.icon}
            <span>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Helper component to show a single combined status indicator
export function FieldStatusIndicator({
  isSubmitted,
  isActive,
  isApproved
}: Omit<FieldStatusBadgesProps, 'variant' | 'isClaimed'>) {
  // Determine the overall field visibility status
  const getOverallStatus = (): { label: string; color: string; description: string } => {
    if (!isSubmitted) {
      return {
        label: 'Draft',
        color: 'text-gray-500',
        description: 'Complete your field setup to submit for approval',
      };
    }

    if (isApproved === false) {
      return {
        label: 'Pending Review',
        color: 'text-amber-600',
        description: 'Your field is being reviewed by our team',
      };
    }

    if (!isActive) {
      return {
        label: 'Disabled',
        color: 'text-gray-500',
        description: 'Your field is not visible to dog owners',
      };
    }

    return {
      label: 'Live',
      color: 'text-emerald-600',
      description: 'Your field is visible and accepting bookings',
    };
  };

  const status = getOverallStatus();

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-semibold ${status.color}`}>
        {status.label}
      </span>
      <span className="text-xs text-gray-500">
        {status.description}
      </span>
    </div>
  );
}

export default FieldStatusBadges;
