import { GetStaticPaths, GetStaticProps } from 'next';
import SearchResults from '../index';
import { FieldsResponse } from '@/hooks/queries/useFieldQueries';

interface PageProps {
  initialFieldsData: FieldsResponse | null;
  initialPage: number;
}

export default SearchResults;

export const getStaticPaths: GetStaticPaths = async () => {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  let totalPages = 1;

  try {
    const res = await fetch(`${API}/fields/active?page=1&limit=12`);
    if (res.ok) {
      const data = await res.json();
      totalPages = data.pagination?.totalPages || 1;
    }
  } catch {
    // Fallback to 1 page if API is down
  }

  const paths = [];
  for (let i = 2; i <= totalPages; i++) {
    paths.push({ params: { page: String(i) } });
  }

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  const page = parseInt(params?.page as string, 10) || 1;

  // Page 1 should use /fields route
  if (page <= 1) {
    return { redirect: { destination: '/fields', permanent: true } };
  }

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  let initialFieldsData: FieldsResponse | null = null;

  try {
    const res = await fetch(`${API}/fields/active?page=${page}&limit=12`);
    if (res.ok) {
      initialFieldsData = await res.json();
    }
  } catch {
    // Build-time fetch failed; client will fetch on mount
  }

  // If the page has no data (beyond last page), return 404
  if (!initialFieldsData || !initialFieldsData.data || initialFieldsData.data.length === 0) {
    return { notFound: true };
  }

  return {
    props: { initialFieldsData, initialPage: page },
    revalidate: 300, // Regenerate every 5 minutes
  };
};
