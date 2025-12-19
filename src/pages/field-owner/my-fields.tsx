import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import { useOwnerFields, useToggleFieldStatus } from '@/hooks';
import { FieldData } from '@/hooks/queries/useFieldQueries';
import { Eye, Edit, Power, KeyRound } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/common/BackButton';
import { ToggleFieldStatusModal } from '@/components/modal/ToggleFieldStatusModal';
import { EntryCodeModal } from '@/components/modal/EntryCodeModal';
import { useUpdateField } from '@/hooks/mutations/useFieldMutations';
import FieldStatusBadges from '@/components/field-owner/FieldStatusBadges';

export default function MyFieldsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [togglingFieldId, setTogglingFieldId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldData | null>(null);

  // Fetch all fields owned by the user
  const { data: fields, isLoading: fetchingFields, refetch, error, isError, isSuccess } = useOwnerFields({
    enabled: !!user && user.role === 'FIELD_OWNER',
  });

  // Toggle field status mutation
  const toggleFieldStatusMutation = useToggleFieldStatus();

  // Update field mutation for entry code
  const updateFieldMutation = useUpdateField();

  // Entry code modal state
  const [entryCodeModalOpen, setEntryCodeModalOpen] = useState(false);
  const [selectedFieldForCode, setSelectedFieldForCode] = useState<FieldData | null>(null);

  useEffect(() => {
    // Redirect if not a field owner
    if (user && user.role !== 'FIELD_OWNER') {
      router.replace('/');
    }
  }, [user]);

  const handleAddNewField = () => {
    router.push('/?addNew=true');
  };

  const handleViewField = (fieldId: string) => {
    router.push(`/field-owner/preview?fieldId=${fieldId}`);
  };

  const handleEditField = (fieldId: string) => {
    router.push(`/?edit=true&fieldId=${fieldId}`);
  };

  const handleToggleStatusClick = (field: FieldData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedField(field);
    setModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedField) return;

    setTogglingFieldId(selectedField.id);
    try {
      await toggleFieldStatusMutation.mutateAsync(selectedField.id);
      setModalOpen(false);
      setSelectedField(null);
    } finally {
      setTogglingFieldId(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedField(null);
  };

  const handleEntryCodeClick = (field: FieldData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFieldForCode(field);
    setEntryCodeModalOpen(true);
  };

  const handleSaveEntryCode = async (code: string) => {
    if (!selectedFieldForCode) return;

    try {
      await updateFieldMutation.mutateAsync({
        id: selectedFieldForCode.id,
        data: { entryCode: code }
      });
      setEntryCodeModalOpen(false);
      setSelectedFieldForCode(null);
      refetch(); // Refresh fields to show updated data if needed
    } catch (error) {
      console.error('Failed to update entry code:', error);
    }
  };

  const handleCloseEntryCodeModal = () => {
    setEntryCodeModalOpen(false);
    setSelectedFieldForCode(null);
  };

  // Show loading state while fetching fields or before data is loaded
  // This prevents the flash of "no fields" message before data loads
  if (fetchingFields || (!isSuccess && !isError)) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-gray-600 mt-4">Loading fields...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 mt-24 py-8 min-h-screen">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-4">
          <BackButton showLabel={true} size='lg' label='My Fields' />
          <button
            onClick={handleAddNewField}
            className="w-full sm:w-auto px-6 py-3 bg-green text-white rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Add New Field
          </button>
        </div>

        {isError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error loading fields. Please try again.</p>
          </div>
        )}

        {!fields || fields.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg mb-4">You haven't added any fields yet</p>
            {/* <button
              onClick={handleAddNewField}
              className="px-6 py-3 bg-green text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Add Your First Field
            </button> */}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {fields.map((field: FieldData) => {
              const isSubmitted = Boolean(field.isSubmitted);
              // Determine approval status: if isClaimed is true, consider it approved
              // This maintains backward compatibility while supporting the new isApproved field
              const isApproved = field.isApproved !== undefined ? field.isApproved : field.isClaimed;

              return (
                <div
                  key={field.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewField(field.id)}
                >
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
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{field.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {field.address}, {field.city}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-green font-bold text-lg">
                        £{field.price30min || field.price || 0}/30min • £{field.price1hr || field.price || 0}/hr
                      </span>
                      <div className="flex gap-1">
                        {/* Toggle status - only show when field is submitted and approved */}
                        {isSubmitted && isApproved && (
                          <button
                            onClick={(e) => handleToggleStatusClick(field, e)}
                            disabled={togglingFieldId === field.id}
                            className={`p-2 rounded-full transition-all ${field.isActive
                              ? 'text-emerald-600 hover:bg-emerald-100'
                              : 'text-gray-400 hover:bg-gray-100'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={field.isActive ? 'Disable Field' : 'Enable Field'}
                          >
                            {togglingFieldId === field.id ? (
                              <Spinner size="sm" />
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
                              handleViewField(field.id);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            title="Preview"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditField(field.id);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {/* Entry code - only show when field is submitted */}
                        {isSubmitted && (
                          <button
                            onClick={(e) => handleEntryCodeClick(field, e)}
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
            })}
          </div>
        )}
      </div>
      <ToggleFieldStatusModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmToggle}
        field={{
          id: selectedField?.id || '',
          name: selectedField?.name || '',
          isActive: selectedField?.isActive || false
        }}
        isLoading={toggleFieldStatusMutation.isPending}
      />
      <EntryCodeModal
        isOpen={entryCodeModalOpen}
        onClose={handleCloseEntryCodeModal}
        onConfirm={handleSaveEntryCode}
        initialEntryCode={selectedFieldForCode?.entryCode || ''}
        isLoading={updateFieldMutation.isPending}
      />
    </UserLayout>
  );
}
