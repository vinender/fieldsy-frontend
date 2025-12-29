import React from 'react';
import { Eye, Edit, Power, KeyRound } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import FieldStatusBadges from '@/components/field-owner/FieldStatusBadges';
import { FieldData } from '@/hooks/queries/useFieldQueries';

interface FieldCardProps {
  field: FieldData;
  isToggling?: boolean;
  onView: (fieldId: string) => void;
  onEdit: (fieldId: string) => void;
  onToggleStatus: (field: FieldData, e: React.MouseEvent) => void;
  onEntryCode: (field: FieldData, e: React.MouseEvent) => void;
}

export default function OwnerFieldCard({
  field,
  isToggling = false,
  onView,
  onEdit,
  onToggleStatus,
  onEntryCode,
}: FieldCardProps) {
  const isSubmitted = Boolean(field.isSubmitted);
  // Determine approval status: if isClaimed is true, consider it approved
  // This maintains backward compatibility while supporting the new isApproved field
  const isApproved = field.isApproved !== undefined ? field.isApproved : field.isClaimed;

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onView(field.id)}
    >
      {/* Image Section */}
      <div className="h-48 bg-gray-200 relative">
        {field.images && field.images.length > 0 ? (
          <img
            src={field.images[0]}
            alt={field.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {/* Status Badges */}
        <div className="absolute top-3 right-3">
          <FieldStatusBadges
            isSubmitted={isSubmitted}
            isActive={field.isActive}
            isApproved={isApproved}
            isClaimed={field.isClaimed}
            variant="card"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{field.name}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {field.address}, {field.city}
        </p>

        <div className="flex justify-between items-center mt-4">
          {/* Pricing */} 
          <div className="flex flex-col">
            <div>
              <span className="text-green font-bold text-lg">
                £{field.price30min || field.price || 0}
              </span>
              <span className="text-gray-500 font-light text-sm">/dog/30min</span>
            </div>
            <div>
              <span className="text-green font-bold text-lg">
                £{field.price1hr || field.price || 0}
              </span>
              <span className="text-gray-500 font-light text-sm">/dog/1hr</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            {/* Toggle status - only show when field is submitted and approved */}
            {isSubmitted && isApproved && (
              <button
                onClick={(e) => onToggleStatus(field, e)}
                disabled={isToggling}
                className={`p-2 rounded-full transition-all ${
                  field.isActive
                    ? 'text-emerald-600 hover:bg-emerald-100'
                    : 'text-gray-400 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={field.isActive ? 'Disable Field' : 'Enable Field'}
              >
                {isToggling ? (
                  <Spinner size="sm" inline />
                ) : (
                  <Power className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Preview - only show when field is submitted */}
            {isSubmitted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(field.id);
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                title="Preview"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}

            {/* Edit button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(field.id);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>

            {/* Entry code - only show when field is submitted */}
            {isSubmitted && (
              <button
                onClick={(e) => onEntryCode(field, e)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                title="Entry Code"
              >
                <KeyRound className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
