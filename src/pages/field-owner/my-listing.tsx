import React, { useMemo } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useOwnerField } from '@/hooks';
import FieldDetailsScreen from '@/components/fields/FieldDetailsScreen';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { fieldQueryKeys } from '@/hooks/queries/useFieldQueries';

export default function MyListingPage() {
  const { user } = useAuth();
  const { data: field, isLoading } = useOwnerField({ enabled: !!user });
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosClient.patch(`/fields/${id}/toggle-status`);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fieldQueryKeys.ownerField() });
      if (variables) queryClient.invalidateQueries({ queryKey: fieldQueryKeys.fieldDetails(variables) });
    },
  });

  const headerContent = useMemo(() => {
    if (!field) return null;
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-dark-green">My Listing</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{field.isActive ? 'Enabled' : 'Disabled'}</span>
          <Switch
            checked={!!field.isActive}
            onCheckedChange={() => field?.id && toggleMutation.mutate(field.id)}
          />
        </div>
      </div>
    );
  }, [field, toggleMutation]);

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-600">Loading your field...</p>
        </div>
      </UserLayout>
    );
  }

  if (!field) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No listing found. Please add your field first.</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <FieldDetailsScreen
        field={field}
        isPreview={true}
        showReviews={false}
        headerContent={headerContent}
      />
    </UserLayout>
  );
}


