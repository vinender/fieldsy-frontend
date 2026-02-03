import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { UserLayout } from '@/components/layout/UserLayout';
import FieldDetailsScreen from '@/components/fields/FieldDetailsScreen';

interface FieldDetailsPageProps {
  fieldId: string;
  fieldData?: any;
}

export default function FieldDetailsPage({ fieldId, fieldData }: FieldDetailsPageProps) {
  return (
    <UserLayout>
      <FieldDetailsScreen fieldId={fieldId} initialData={fieldData} />
    </UserLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const allPaths: { params: { field_id: string } }[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    // Fetch all fields in batches to pre-build every page
    while (hasMore) {
      const response = await fetch(`${API}/fields?page=${page}&limit=${limit}`);
      const data = await response.json();
      const fields = data?.data || [];

      for (const field of fields) {
        const fieldId = field.fieldId || field._id || field.id;
        if (fieldId) {
          allPaths.push({ params: { field_id: fieldId } });
        }
      }

      hasMore = fields.length === limit;
      page++;
    }

    return {
      paths: allPaths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching field paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const fieldId = params?.field_id as string;

  try {
    // Fetch field details at build time
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fields/${fieldId}`
    );



    if (!response.ok) {
      return {
        notFound: true,
      };
    }

    const data = await response.json();

    return {
      props: {
        fieldId,
        fieldData: data?.data || null,
      },
      // Revalidate every 30 minutes
      revalidate: 1800,
    };
  } catch (error) {
    console.error('Error fetching field details:', error);
    return {
      props: {
        fieldId,
        fieldData: null,
      },
      // Try again in 60 seconds if there was an error
      revalidate: 60,
    };
  }
};

