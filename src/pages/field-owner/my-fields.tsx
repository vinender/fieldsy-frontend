import React, { useEffect, useState, useRef } from 'react';
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
import { FieldStatusBadges } from '@/components/field-owner/FieldStatusBadges';
import { Eye, Edit, KeyRound, Info } from 'lucide-react';

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
      {show && (
        <span className="fixed z-50 px-3 py-2 text-xs font-normal normal-case tracking-normal leading-relaxed text-white bg-gray-900 rounded-lg shadow-lg max-w-[220px] whitespace-normal"
          style={{
            top: ref.current ? ref.current.getBoundingClientRect().bottom + 8 : 0,
            left: ref.current ? ref.current.getBoundingClientRect().left + ref.current.offsetWidth / 2 : 0,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          {text}
        </span>
      )}
    </span>
  );
}

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
        {/* Header - only show back button when there are fields */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-4">
          {hasFields ? (
            <BackButton showLabel={true} size='lg' label='My Fields' />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-semibold text-dark-green">My Fields</h1>
          )}
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
          /* Fields Table */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Field</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Dogs</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        Entry Code
                        <InfoTooltip text="A code shared with guests to access your field on the day of their booking." />
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        Status
                        <InfoTooltip text="Shows if your field is Draft, Pending Approval, or Approved by admin." />
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1 justify-center">
                        Enabled
                        <InfoTooltip text="Toggle to make your field visible to dog owners and accept bookings." />
                      </span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fields.map((field: FieldData) => {
                    const isSubmitted = Boolean(field.isSubmitted);
                    const isApproved = field.isApproved !== undefined ? field.isApproved : field.isClaimed;

                    return (
                      <tr
                        key={field.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Field Name + Image */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {field.images && field.images.length > 0 ? (
                                <img src={field.images[0]} alt={field.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                              )}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{field.name}</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{field.city}</div>
                          <div className="text-xs text-gray-500">{field.zipCode}</div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {(field.price30min && field.price30min > 0) ? (
                              <>
                                <div className="font-medium text-gray-900">£{field.price30min.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">per 30min/dog</div>
                              </>
                            ) : (field.price1hr && field.price1hr > 0) ? (
                              <>
                                <div className="font-medium text-gray-900">£{field.price1hr.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">per 1hr/dog</div>
                              </>
                            ) : field.price > 0 ? (
                              <>
                                <div className="font-medium text-gray-900">£{field.price.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">per dog</div>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">Not set</span>
                            )}
                          </div>
                        </td>

                        {/* Max Dogs */}
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {field.maxDogs || '—'}
                        </td>

                        {/* Entry Code */}
                        <td className="px-4 py-3">
                          {isSubmitted ? (
                            <button
                              onClick={(e) => handleEntryCodeClick(field, e)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                              title="Manage Entry Code"
                            >
                              <KeyRound className="w-4 h-4" />
                              <span className="text-xs">{field.entryCode || 'Set code'}</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <FieldStatusBadges
                            isSubmitted={isSubmitted}
                            isActive={field.isActive}
                            isApproved={isApproved}
                            isClaimed={field.isClaimed}
                            variant="card"
                            hideActiveStatus
                          />
                        </td>

                        {/* Enable/Disable Toggle */}
                        <td className="px-4 py-3 text-center">
                          {isSubmitted && isApproved ? (
                            <button
                              onClick={(e) => handleToggleStatusClick(field, e)}
                              disabled={togglingFieldId === field.id}
                              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                              style={{ backgroundColor: field.isActive ? '#3A6B22' : '#d1d5db' }}
                              title={field.isActive ? 'Disable Field' : 'Enable Field'}
                            >
                              {togglingFieldId === field.id ? (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <Spinner size="xs" />
                                </span>
                              ) : (
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    field.isActive ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {isSubmitted && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleViewField(field.id); }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditField(field.id); }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
