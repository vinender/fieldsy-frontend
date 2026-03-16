import { toast } from 'sonner';

export default function TestToast() {
  const fireOne = (type: 'success' | 'info' | 'error' | 'warning') => {
    toast.dismiss();
    const messages = {
      success: 'Booking confirmed successfully!',
      info: 'Your booking is being processed...',
      error: 'Payment failed. Please try again.',
      warning: 'Field closes in 30 minutes',
    };
    toast[type](messages[type]);
  };

  const fireRapid = () => {
    toast.dismiss();
    toast.success('First notification');
    setTimeout(() => {
      toast.dismiss();
      toast.info('Second notification');
    }, 1500);
    setTimeout(() => {
      toast.dismiss();
      toast.warning('Third notification');
    }, 3000);
    setTimeout(() => {
      toast.dismiss();
      toast.error('Fourth notification');
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 pt-24">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Toast Test Page</h1>

        <button onClick={() => fireOne('success')} className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
          Success Toast
        </button>
        <button onClick={() => fireOne('error')} className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
          Error Toast
        </button>
        <button onClick={() => fireOne('info')} className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Info Toast
        </button>
        <button onClick={() => fireOne('warning')} className="w-full px-4 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors">
          Warning Toast
        </button>

        <hr className="my-4" />

        <button onClick={fireRapid} className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
          Rapid Fire (4 toasts, 1.5s apart)
        </button>
      </div>
    </div>
  );
}
