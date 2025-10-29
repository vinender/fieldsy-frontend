import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TestAmenities() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing direct axios call...');
      const response = await axios.get('http://localhost:5000/api/amenities?activeOnly=true', {
        headers: {
          'Accept': 'application/json',
        }
      });
      console.log('✅ Success:', response);
      setResult(response.data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError({
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Amenities API</h1>

      <button
        onClick={testFetch}
        style={{
          padding: '10px 20px',
          background: '#3A6B22',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Loading...' : 'Test Amenities API'}
      </button>

      {error && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#ffebee', borderRadius: '8px' }}>
          <h3>Error:</h3>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
          <h3>Success! Got {result.data?.length} amenities:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
