import { toast } from 'sonner';

export default function TestToast() {
  const fireAll = () => {
    toast.success('Booking cancelled successfully');
    toast.info('Refund will be processed within 5-10 business days');
    toast.error('Failed to send cancellation email');
  };

  const fireOne = (type: 'success' | 'info' | 'error' | 'warning') => {
    toast.dismiss();
    const messages = {
      success: 'Booking cancelled successfully',
      info: 'Refund will be processed within 5-10 business days',
      error: 'Failed to send cancellation email',
      warning: 'Your session is about to expire',
    };
    toast[type](messages[type]);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 20, fontSize: 24 }}>Toast Test</h1>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={fireAll}
          style={{
            padding: '12px 24px',
            background: '#3A6B22',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          Fire 3 Rapid
        </button>
        <button onClick={() => fireOne('success')} style={{ padding: '12px 24px', background: '#166534', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
          Success
        </button>
        <button onClick={() => fireOne('info')} style={{ padding: '12px 24px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
          Info
        </button>
        <button onClick={() => fireOne('error')} style={{ padding: '12px 24px', background: '#991b1b', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
          Error
        </button>
        <button onClick={() => fireOne('warning')} style={{ padding: '12px 24px', background: '#a16207', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
          Warning
        </button>
      </div>
    </div>
  );
}
