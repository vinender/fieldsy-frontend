import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import { useOwnerFields, useToggleFieldStatus } from '@/hooks';
import { FieldData } from '@/hooks/queries/useFieldQueries';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/common/BackButton';
import { ToggleFieldStatusModal } from '@/components/modal/ToggleFieldStatusModal';
import { EntryCodeModal } from '@/components/modal/EntryCodeModal';
import { useUpdateField } from '@/hooks/mutations/useFieldMutations';
import OwnerFieldCard from '@/components/field-owner/OwnerFieldCard';

export default function MyFieldsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [togglingFieldId, setTogglingFieldId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldData | null>(null);

  // Fetch all fields owned by the user
  const { data: fields, isLoading: fetchingFields, refetch, isError, isSuccess } = useOwnerFields({
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
  }, [user, router]);

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
      refetch();
    } catch (error) {
      console.error('Failed to update entry code:', error);
    }
  };

  const handleCloseEntryCodeModal = () => {
    setEntryCodeModalOpen(false);
    setSelectedFieldForCode(null);
  };

  // Show loading state while fetching fields or before data is loaded
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

  const hasFields = fields && fields.length > 0;

  return (
    <UserLayout>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 mt-24 py-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-4">
          <BackButton showLabel={true} size='lg' label='My Fields' />
          {hasFields && (
            <button
              onClick={handleAddNewField}
              className="w-full sm:w-auto px-6 py-3 bg-green text-white rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              Add New Field
            </button>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error loading fields. Please try again.</p>
          </div>
        )}

        {/* Empty State */}
        {!hasFields ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg mb-4">You haven't added any fields yet</p>
            <button
              onClick={handleAddNewField}
              className="px-6 py-3 bg-green text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Add New Field
            </button>
          </div>
        ) : (
          /* Fields Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {fields.map((field: FieldData) => (
              <OwnerFieldCard
                key={field.id}
                field={field}
                isToggling={togglingFieldId === field.id}
                onView={handleViewField}
                onEdit={handleEditField}
                onToggleStatus={handleToggleStatusClick}
                onEntryCode={handleEntryCodeClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toggle Field Status Modal */}
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

      {/* Entry Code Modal */}
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
