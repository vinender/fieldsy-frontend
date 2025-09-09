'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { 
  useEarningsHistory, 
  useEarningsSummary, 
  formatCurrency, 
  formatTransactionDate,
  type Transaction 
} from '@/hooks/usePayouts';
import {
  useStripeAccountStatus,
  useCreateStripeAccount,
  useGetOnboardingLink,
  useStripeBalance
} from '@/hooks';

const EarningsHistory: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const itemsPerPage = 10;

  // Fetch data using React Query hooks
  const { 
    data: earningsData, 
    isLoading: isLoadingHistory, 
    error: historyError 
  } = useEarningsHistory({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter || undefined
  });

  // Get overall stats without filters for the count badges
  const { 
    data: overallStats
  } = useEarningsHistory({
    page: 1,
    limit: 1000, // Get all to calculate stats
    status: undefined
  }, {
    queryKey: ['earnings-history-stats'], // Different cache key
    select: (data) => ({
      completed: data?.transactions?.filter((t: any) => t.status === 'completed' || t.status === 'paid').length || 0,
      canceled: data?.transactions?.filter((t: any) => t.status === 'canceled').length || 0,
      failed: data?.transactions?.filter((t: any) => t.status === 'failed').length || 0,
    })
  });

  const { 
    data: summaryData, 
    isLoading: isLoadingSummary 
  } = useEarningsSummary('all');

  // Stripe Connect hooks
  const { data: accountStatus, refetch: refetchAccount } = useStripeAccountStatus();
  const createAccount = useCreateStripeAccount({
    onSuccess: () => refetchAccount()
  });
  const getOnboardingLink = useGetOnboardingLink();
  const { data: stripeBalance } = useStripeBalance({
    enabled: accountStatus?.data?.hasAccount && accountStatus?.data?.payoutsEnabled
  });

  // Check for success/refresh from Stripe redirect
  useEffect(() => {
    if (router.query.success === 'true' || router.query.refresh === 'true' || router.query.updated === 'true') {
      // Clear the query params from URL
      window.history.replaceState({}, document.title, '/field-owner/payouts');
      // Refresh account status
      refetchAccount();
    }
  }, [router.query, refetchAccount]);

  // Handle connect bank button click
  const handleConnectBank = async () => {
    try {
      setIsConnecting(true);
      
      // Check if account exists
      if (!accountStatus?.data?.hasAccount) {
        // Create Stripe Connect account first
        await createAccount.mutateAsync();
      }
      
      // Get onboarding link and redirect
      getOnboardingLink.mutate({});
    } catch (error) {
      console.error('Failed to connect bank:', error);
      setIsConnecting(false);
    }
  };

  const getStatusStyles = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-light-green/10',
          border: '',
          text: 'text-green',
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
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600',
          label: 'Pending'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600',
          label: 'Unknown'
        };
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
 
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  if (historyError) {
    return (
      <div className="min-h-screen bg-[#fffcf3] py-8 px-4 mt-28 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading earnings data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf3] py-8 px-4 mt-28 sm:px-6 lg:px-20">
      <div className="max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="space-y-4 mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#192215]">
            {accountStatus?.data?.hasAccount && accountStatus?.data?.payoutsEnabled ? 'Earnings History' : 'Manage Payouts'}
          </h1>
          
          {/* Total Earnings Card */}
          <div className="bg-[#f8f1d7] rounded-2xl p-5 sm:p-6 border border-black/5">
               <div className="flex  lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Icon based on account status */}
                    <div className="flex-shrink-0">
                      <img 
                        src={
                          accountStatus?.data?.hasAccount && accountStatus?.data?.payoutsEnabled 
                            ? '/connected.svg'
                            : accountStatus?.data?.hasAccount && !accountStatus?.data?.payoutsEnabled
                            ? '/wallet.svg'
                            : '/bank.svg'
                        }
                        alt="Account status"
                        className=" w-full h-full"
                      />
                    </div>
                    <div className="space-y-2">
                      {isLoadingSummary ? (
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-48"></div>
                      ) : (
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#192215]">
                          {accountStatus?.data?.hasAccount && accountStatus?.data?.payoutsEnabled 
                            ? `Total Earnings ${formatCurrency(summaryData?.totalEarnings || 0)}`
                            : accountStatus?.data?.hasAccount && !accountStatus?.data?.payoutsEnabled
                            ? 'Account Unable to Receive Payments'
                            : 'Connect your bank for payouts'}
                        </h2>
                      )}
                      <p className="text-base sm:text-lg text-gray-500 max-w-2xl">
                        {accountStatus?.data?.hasAccount && !accountStatus?.data?.payoutsEnabled
                          ? 'Your linked account is currently unable to accept customer payments.'
                          : 'Link your bank account securely to receive payouts directly. Fast, safe, and hassle-free transfers every time you get paid.'}
                      </p>
                    </div>
                  </div>

                  {/* Show different UI based on account connection status */}
                  {accountStatus?.data?.hasAccount && accountStatus?.data?.payoutsEnabled ? (
                    <div className="flex flex-col gap-2 items-start lg:items-end lg:self-center">
                      <button 
                        onClick={handleConnectBank}
                        disabled={isConnecting || createAccount.isPending || getOnboardingLink.isPending}
                        className="bg-green hover:bg-gray-700 transition-colors text-white font-semibold px-6 py-2.5 rounded-full whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Change Bank Account
                      </button>
                    </div>
                  ) : accountStatus?.data?.hasAccount && !accountStatus?.data?.payoutsEnabled ? (
                    <div className="flex flex-col sm:flex-row gap-2 items-start lg:items-center lg:self-center">
                      <button 
                        onClick={handleConnectBank}
                        disabled={isConnecting || createAccount.isPending || getOnboardingLink.isPending}
                        className="bg-white hover:bg-green-50 transition-colors text-[#3a6b22] border border-[#3a6b22] font-semibold px-6 py-2.5 rounded-full whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting || createAccount.isPending || getOnboardingLink.isPending ? 'Loading...' : 'Edit Account'}
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            setIsConnecting(true);
                            // Create new Stripe Connect account
                            await createAccount.mutateAsync();
                            // Get onboarding link and redirect
                            getOnboardingLink.mutate({});
                          } catch (error) {
                            console.error('Failed to create new account:', error);
                            setIsConnecting(false);
                          }
                        }}
                        disabled={isConnecting || createAccount.isPending || getOnboardingLink.isPending}
                        className="bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white font-semibold px-6 py-2.5 rounded-full whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting || createAccount.isPending || getOnboardingLink.isPending ? 'Loading...' : 'Link New Account'}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleConnectBank}
                      disabled={isConnecting || createAccount.isPending || getOnboardingLink.isPending}
                      className="bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white font-semibold px-6 py-3.5 rounded-full whitespace-nowrap self-start lg:self-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting || createAccount.isPending || getOnboardingLink.isPending ? 'Connecting...' : 'Connect Bank'}
                    </button>
                  )}
            
                </div>
            </div>
          </div>

        </div>

        {/* Status Filter Tabs - Only show when bank is connected */}
        {accountStatus?.data?.hasAccount && accountStatus?.data?.payoutsEnabled && (
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === '' 
                  ? 'bg-[#3a6b22] text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('paid')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'paid' 
                  ? 'bg-cream text-green' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed ({overallStats?.completed || 0})
            </button>
            <button
              onClick={() => handleStatusFilter('canceled')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'canceled' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Canceled ({overallStats?.canceled || 0})
            </button>
            <button
              onClick={() => handleStatusFilter('failed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'failed' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Failed ({overallStats?.failed || 0})
            </button>
          </div>
        )}

        {/* Transactions List - Only show when bank is connected */}
        {accountStatus?.data?.hasAccount && accountStatus?.data?.payoutsEnabled && (
          <>
          {isLoadingHistory ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="py-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {earningsData?.transactions && earningsData.transactions.length > 0 ? (
                earningsData.transactions.map((transaction, index) => {
                  const statusStyles = getStatusStyles(transaction.status);
                  return (
                    <React.Fragment key={transaction.id}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 py-4">
                        {/* Left side - Order details */}
                        <div className="space-y-2.5">
                          <div className="space-y-0.5">
                            <h3 className="text-lg font-bold text-[#192215]">
                              Order ID - {transaction.id}
                            </h3>
                            <p className="text-sm sm:text-base font-medium text-[#192215]">
                              Payment ID - {transaction.paymentId.slice(0, 12)}...
                            </p>
                            {transaction.fieldName && (
                              <p className="text-sm text-gray-600">
                                Field: {transaction.fieldName}
                              </p>
                            )}
                            {transaction.customerName && (
                              <p className="text-sm text-gray-600">
                                Customer: {transaction.customerName}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 opacity-80">
                            {formatTransactionDate(transaction.date)}
                          </p>
                        </div>

                        {/* Right side - Amount and status */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5">
                          <p className="text-lg font-bold text-[#3a6b22]">
                            {formatCurrency(transaction.amount)}
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
                      {index < earningsData.transactions.length - 1 && (
                        <div className="h-px bg-gray-300" />
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </div>
            {/*  */}
            {/* Pagination */}
            {earningsData && earningsData.pagination?.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, earningsData.pagination?.total || 0)} of{' '}
                  {earningsData.pagination?.total || 0} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, earningsData.pagination?.totalPages || 1))].map((_, i) => {
                      const pageNum = i + 1;
                      if ((earningsData.pagination?.totalPages || 1) <= 5) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              currentPage === pageNum
                                ? 'bg-[#3a6b22] text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      
                      // Smart pagination for many pages
                      if (currentPage <= 3) {
                        if (pageNum <= 4) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'bg-[#3a6b22] text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        if (pageNum === 5) {
                          return (
                            <span key="ellipsis" className="px-2 py-2">...</span>
                          );
                        }
                      }
                      
                      return null;
                    })}
                    
                    {(earningsData.pagination?.totalPages || 1) > 5 && currentPage > 3 && (
                      <>
                        <span className="px-2 py-2">...</span>
                        <button
                          onClick={() => handlePageChange(earningsData.pagination?.totalPages || 1)}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {earningsData.pagination?.totalPages || 1}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === earningsData.pagination?.totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === earningsData.pagination?.totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </>
        )}
      </div>

  );
};

export default EarningsHistory;