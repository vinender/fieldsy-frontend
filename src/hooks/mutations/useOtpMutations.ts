import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import axiosClient from '@/lib/api/axios-client';
import { toast } from 'sonner';

// Types for OTP mutations
export interface RegisterWithOtpData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
  role?: string;
}

export interface ResendOtpData {
  email: string;
  type: 'SIGNUP' | 'RESET_PASSWORD' | 'EMAIL_VERIFICATION' | 'SOCIAL_LOGIN';
}

export interface LoginWithOtpCheckData {
  email: string;
  password: string;
  // Note: role is no longer sent - backend returns user's role from database
}

export interface RequestPasswordResetData {
  email: string;
}

export interface ResetPasswordData {
  resetToken: string;
  newPassword: string;
}

// Hook for registration with OTP
export function useRegisterWithOtp(
  options?: Omit<UseMutationOptions<any, Error, RegisterWithOtpData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: RegisterWithOtpData) => {
      try {
        const response = await axiosClient.post('/auth/otp/register', data);
        return response.data;
      } catch (error: any) {
        // Log the error for debugging but prevent runtime error
        if (process.env.NODE_ENV === 'development') {
          console.log('Registration API error:', error?.response?.status);
        }
        // Return a rejected promise with the error for React Query to handle
        return Promise.reject(error);
      }
    },
    onSuccess: (result, variables) => {
      toast.success('Registration successful! Please check your email for verification code.');
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';

      // Show specific error messages
      if (errorMessage.includes('An account already exists with this email as a')) {
        // Extract the role from the error message for a clearer toast
        const roleMatch = errorMessage.match(/as a ([^.]+)/);
        const existingRole = roleMatch ? roleMatch[1] : 'different role';
        toast.error(`An account already exists with this email . Each email can only have one account.`);
      } else if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        toast.error(`Account already exists. Please sign in instead.`);
      } else if (errorMessage.includes('phone number')) {
        toast.error('This phone number is already registered.');
      } else if (errorMessage.includes('Google/Apple')) {
        toast.error('This email is already registered with social login. Please use the Google/Apple sign in button.');
      } else {
        toast.error(errorMessage);
      }

      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for verifying OTP
export function useVerifyOtp(
  options?: Omit<UseMutationOptions<any, Error, VerifyOtpData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      try {
        const response = await axiosClient.post('/auth/otp/verify-signup', data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Verify OTP API error:', error?.response?.status);
        }
        return Promise.reject(error);
      }
    },
    onSuccess: (result, variables) => {
      toast.success('Email verified successfully!');
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('OTP verification error:', error);
      console.log('Error response data:', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid or expired code';

      // Show specific error messages for common OTP errors
      if (errorMessage.toLowerCase().includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Invalid OTP. Please check and try again.');
      } else {
        toast.error(errorMessage);
      }

      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });
  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}


// Hook for resending OTP
export function useResendOtp(
  options?: Omit<UseMutationOptions<any, Error, ResendOtpData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: ResendOtpData) => {
      try {
        const response = await axiosClient.post('/auth/otp/resend-otp', data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Resend OTP API error:', error?.response?.status);
        }
        return Promise.reject(error);
      }
    },
    onSuccess: (result, variables) => {
      toast.success('Verification code sent successfully!');
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Resend OTP error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resend code';
      toast.error(errorMessage);
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });
  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for login with OTP check
export function useLoginWithOtpCheck(
  options?: Omit<UseMutationOptions<any, Error, LoginWithOtpCheckData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: LoginWithOtpCheckData) => {
      try {
        const response = await axiosClient.post('/auth/otp/login', data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Login API error:', error?.response?.status);
        }
        return Promise.reject(error);
      }
    },
    onSuccess: (result, variables) => {
      toast.success('Login successful!');
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Login error:', error);
      const response = error?.response;
      const errorMessage = response?.data?.message || error?.message || 'Invalid email or password';
      
      // Check if email verification is required (don't show error toast for this)
      if (response?.status === 403 && response?.data?.data?.requiresVerification) {
        toast.info("Please verify your email first. We've sent you a verification code.");
      } else if (errorMessage.includes('social login')) {
        toast.error('This account uses social login. Please use the social login button.');
      } else {
        toast.error(errorMessage);
      }
      
      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });
  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for requesting password reset
export function useRequestPasswordReset(
  options?: Omit<UseMutationOptions<any, Error, RequestPasswordResetData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: RequestPasswordResetData) => {
      try {
        const response = await axiosClient.post('/auth/otp/forgot-password', data);
        return response.data;
      } catch (error: any) {
        // Extract error details for better handling
        const statusCode = error?.response?.status;
        const errorMessage = error?.response?.data?.message;

        // Log only unexpected errors in development
        if (process.env.NODE_ENV === 'development' && statusCode !== 404) {
          console.log('Password reset API error:', statusCode, errorMessage);
        }

        // Throw a formatted error that React Query can handle
        throw {
          statusCode,
          message: errorMessage || error.message || 'Failed to send reset code',
          originalError: error
        };
      }
    },
    onSuccess: () => {
      toast.success('Password reset code sent! Check your email.');
    },
    onError: (error: any) => {
      const statusCode = error.statusCode || error.response?.status;
      const errorMessage = error.message || error.response?.data?.message;

      // Only log unexpected errors to console
      if (statusCode !== 404 && process.env.NODE_ENV === 'development') {
        console.error('Password reset request error:', error);
      }

      if (statusCode === 404) {
        toast.error('Email address not registered. Please sign up first.');
      } else {
        toast.error(errorMessage || 'Failed to send reset code');
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for verifying password reset OTP
export function useVerifyPasswordResetOtp(
  options?: Omit<UseMutationOptions<any, Error, VerifyOtpData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      try {
        const response = await axiosClient.post('/auth/otp/verify-reset-otp', data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Verify reset OTP API error:', error?.response?.status);
        }
        return Promise.reject(error);
      }
    },
    onSuccess: (result, variables) => {
      toast.success('OTP verified successfully!');
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Reset OTP verification error:', error);
      console.log('Error response data:', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid or expired OTP';

      // Show specific error messages for common OTP errors
      if (errorMessage.toLowerCase().includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Invalid OTP. Please check and try again.');
      } else {
        toast.error(errorMessage);
      }

      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for resetting password with OTP
export function useResetPasswordWithOtp(
  options?: Omit<UseMutationOptions<any, Error, ResetPasswordData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      try {
        const response = await axiosClient.post('/auth/otp/reset-password', data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Reset password API error:', error?.response?.status);
        }
        return Promise.reject(error);
      }
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
    },
    onError: (error: any) => {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Hook for verifying social login OTP
export function useVerifySocialLoginOtp(
  options?: Omit<UseMutationOptions<any, Error, VerifyOtpData>, 'mutationFn'>
) {
  const mutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      try {
        const response = await axiosClient.post('/auth/otp/verify-social-login', data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Verify social login OTP API error:', error?.response?.status);
        }
        return Promise.reject(error);
      }
    },
    onSuccess: (result, variables) => {
      toast.success('Email verified successfully!');
      if (options?.onSuccess) {
        options.onSuccess(result, variables, {} as any);
      }
    },
    onError: (error: any, variables) => {
      console.error('Social login OTP verification error:', error);
      console.log('Error response data:', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid or expired code';

      // Show specific error messages for common OTP errors
      if (errorMessage.toLowerCase().includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Invalid OTP. Please check and try again.');
      } else {
        toast.error(errorMessage);
      }

      if (options?.onError) {
        options.onError(error, variables, {} as any);
      }
    },
    ...options,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}