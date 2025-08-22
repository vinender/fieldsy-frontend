'use client';

import React from 'react';

interface Transaction {
  orderId: string;
  paymentId: string;
  date: string;
  amount: string;
  status: 'completed' | 'refunded' | 'failed';
}

const EarningsHistory: React.FC = () => {
  const transactions: Transaction[] = [
    {
      orderId: '#TX4524',
      paymentId: '401737441305',
      date: 'Jan 26, 2024 at 10:30 AM',
      amount: '$30.47',
      status: 'completed'
    },
    {
      orderId: '#GF4574',
      paymentId: '98765456487',
      date: 'Jan 21, 2024 at 11:30 AM',
      amount: '$64.12',
      status: 'refunded'
    },
    {
      orderId: '#MX1245',
      paymentId: '5645454545',
      date: 'Jan 15, 2024 at 02:12 PM',
      amount: '$16.72',
      status: 'failed'
    },
    {
      orderId: '#AK1234',
      paymentId: '16545855456',
      date: 'Jan 26, 2024 at 10:30 AM',
      amount: '$20.79',
      status: 'completed'
    },
    {
      orderId: '#WS4585',
      paymentId: '54451254551',
      date: 'Jan 12, 2024 at 10:30 AM',
      amount: '$19.47',
      status: 'completed'
    },
    {
      orderId: '#LM4578',
      paymentId: '5645165454',
      date: 'Jan 02, 2024 at 10:30 AM',
      amount: '$35.12',
      status: 'completed'
    }
  ];

  const getStatusStyles = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          border: 'border-green-200',
          text: 'text-green-700',
          label: 'Completed'
        };
      case 'refunded':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-200',
          text: 'text-orange-600',
          label: 'Refunded'
        };
      case 'failed':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-600',
          label: 'Failed'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf3] py-8 px-4 sm:px-6 lg:px-20">
      <div className="max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="space-y-4 mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#192215]">
            Earnings History
          </h1>
          
          {/* Total Earnings Card */}
          <div className="bg-[#f8f1d7] rounded-2xl p-5 sm:p-6 border border-black/5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#192215]">
                  Total Earnings $70,856
                </h2>
                <p className="text-base sm:text-lg text-gray-500 max-w-2xl">
                  Link your bank account securely to receive payouts directly. Fast, safe, and hassle-free transfers every time you get paid.
                </p>
              </div>
              <button className="bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white font-semibold px-6 py-3.5 rounded-full whitespace-nowrap self-start lg:self-center">
                Connect Bank
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const statusStyles = getStatusStyles(transaction.status);
            return (
              <React.Fragment key={transaction.orderId}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 py-4">
                  {/* Left side - Order details */}
                  <div className="space-y-2.5">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-[#192215]">
                        Order ID - {transaction.orderId}
                      </h3>
                      <p className="text-sm sm:text-base font-medium text-[#192215]">
                        Payment ID- {transaction.paymentId}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 opacity-80">
                      {transaction.date}
                    </p>
                  </div>

                  {/* Right side - Amount and status */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5">
                    <p className="text-lg font-bold text-[#3a6b22]">
                      {transaction.amount}
                    </p>
                    <span 
                      className={`
                        ${statusStyles.bg} 
                        ${statusStyles.text} 
                        border ${statusStyles.border}
                        px-4 py-1.5 
                        rounded-full 
                        text-xs sm:text-sm 
                        font-medium
                        whitespace-nowrap
                      `}
                    >
                      {statusStyles.label}
                    </span>
                  </div>
                </div>
                
                {/* Divider */}
                {index < transactions.length - 1 && (
                  <div className="h-px bg-gray-300" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EarningsHistory;