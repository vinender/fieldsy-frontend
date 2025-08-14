import React from 'react';
import { MapPin, Clock, Users, DollarSign, Check } from 'lucide-react';

interface FieldPreviewProps {
  formData: any;
  onEdit: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function FieldPreview({ formData, onEdit, onSubmit, isLoading }: FieldPreviewProps) {
  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
            Preview Your Field
          </h1>
          <p className="text-base text-gray-text font-sans">
            Review all details before submitting your field for approval
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="px-6 py-2 rounded-full border-2 border-green text-green font-semibold font-sans transition-colors hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-6 py-2 rounded-full bg-green text-white font-semibold font-sans transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>

      {/* Field Images */}
      {formData.images && formData.images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {formData.images.slice(0, 4).map((image: string, index: number) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={`Field image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Field Details Card */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-dark-green mb-4">
          {formData.fieldName || 'Unnamed Field'}
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-600">
                  {formData.streetAddress && `${formData.streetAddress}, `}
                  {formData.city && `${formData.city}, `}
                  {formData.county && `${formData.county}, `}
                  {formData.postalCode}
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Operating Hours</p>
                <p className="text-sm text-gray-600">
                  {formData.startTime} - {formData.endTime}
                  {formData.openingDays && ` (${formData.openingDays})`}
                </p>
              </div>
            </div>

            {/* Capacity */}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Capacity</p>
                <p className="text-sm text-gray-600">
                  Max {formData.maxDogs || '10'} dogs • {formData.fieldSize} field
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Pricing</p>
                <p className="text-sm text-gray-600">
                  £{formData.pricePerHour}/hour
                  {formData.weekendPrice && ` • £${formData.weekendPrice}/hour (weekends)`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Field Type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Terrain Type</p>
              <p className="text-sm text-gray-600">{formData.terrainType || 'Not specified'}</p>
            </div>

            {/* Description */}
            {formData.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600 line-clamp-3">{formData.description}</p>
              </div>
            )}

            {/* Booking Preferences */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Booking Preferences</p>
              <div className="space-y-1">
                {formData.instantBooking && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green" />
                    <span className="text-sm text-gray-600">Instant booking enabled</span>
                  </div>
                )}
                {formData.requireDeposit && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green" />
                    <span className="text-sm text-gray-600">Deposit required</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {Object.keys(formData.amenities).filter(key => formData.amenities[key]).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-dark-green mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(formData.amenities)
              .filter(key => formData.amenities[key])
              .map((amenity) => (
                <span
                  key={amenity}
                  className="px-3 py-1 bg-green/10 text-green rounded-full text-sm font-medium"
                >
                  {amenity}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Rules & Policies */}
      <div className="grid grid-cols-2 gap-6">
        {formData.rules && (
          <div>
            <h3 className="text-lg font-semibold text-dark-green mb-3">Field Rules</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.rules}</p>
            </div>
          </div>
        )}
        
        {formData.policies && (
          <div>
            <h3 className="text-lg font-semibold text-dark-green mb-3">Booking Policies</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.policies}</p>
            </div>
          </div>
        )}
      </div>

      {/* Submission Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> After submission, your field will be reviewed by our team. 
          You'll receive an email once your field is approved and live on the platform.
        </p>
      </div>
    </div>
  );
}