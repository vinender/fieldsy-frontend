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
    // Fetch the most popular/recent fields to pre-build
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/fields?limit=50&sortBy=views&sortOrder=desc`
    );
    const data = await response.json();
    
    const paths = data?.data?.map((field: any) => ({
      params: { field_id: field._id || field.id },
    })) || [];

    return {
      paths,
      // Use 'blocking' to server-render pages on-demand if the path doesn't exist
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/fields/${fieldId}`
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

