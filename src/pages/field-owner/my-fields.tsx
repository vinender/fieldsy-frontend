import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { UserLayout } from '@/components/layout/UserLayout';
import { useOwnerFields, useToggleFieldStatus } from '@/hooks';
import { FieldData } from '@/hooks/queries/useFieldQueries';
import { Eye, Edit, Power } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import  BackButton  from '@/components/common/BackButton';

export default function MyFieldsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [togglingFieldId, setTogglingFieldId] = useState<string | null>(null);

  // Fetch all fields owned by the user
  const { data: fields, isLoading: fetchingFields, refetch, error, isError } = useOwnerFields({
    enabled: !!user && user.role === 'FIELD_OWNER',
  });

  // Toggle field status mutation
  const toggleFieldStatusMutation = useToggleFieldStatus();

  useEffect(() => {
    // Redirect if not a field owner
    if (user && user.role !== 'FIELD_OWNER') {
      router.push('/');
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

  const handleToggleStatus = async (fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingFieldId(fieldId);
    try {
      await toggleFieldStatusMutation.mutateAsync(fieldId);
    } finally {
      setTogglingFieldId(null);
    }
  };

  if (fetchingFields) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-600">Loading fields...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="w-full mx-auto  px-4 sm:px-6 lg:px-8 xl:px-12 mt-24 py-8 min-h-screen">

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
            <button
              onClick={handleAddNewField}
              className="px-6 py-3 bg-green text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Add Your First Field
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {fields.map((field: FieldData) => (
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
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        field.isClaimed
                          ? 'bg-green text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {field.isClaimed ? 'Approved' : 'Pending'}
                    </span>
                    {field.isClaimed && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          field.isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {field.isActive ? 'Active' : 'Disabled'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{field.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {field.address}, {field.city}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-green font-bold text-lg">
                      £{field.price || field.pricePerDay}/hour
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleToggleStatus(field.id, e)}
                        disabled={togglingFieldId === field.id}
                        className={`p-2 rounded-full transition-all ${
                          field.isActive
                            ? 'text-green hover:bg-green hover:text-white'
                            : 'text-gray-400 hover:bg-gray-400 hover:text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={field.isActive ? 'Disable Field' : 'Enable Field'}
                      >
                        {togglingFieldId === field.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Power className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewField(field.id);
                        }}
                        className="p-2 text-green hover:bg-green hover:text-white rounded-full transition-all"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditField(field.id);
                        }}
                        className="p-2 text-green hover:bg-green hover:text-white rounded-full transition-all"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

// Force SSR for this authenticated page - prevents _next/data routing issues
export async function getServerSideProps() {
  return {
    props: {},
  };
}
