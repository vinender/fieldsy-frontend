import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Lock, User } from 'lucide-react';

export const BypassComingSoon = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleBypass = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please enter both username and password');
            return;
        }

        setIsVerifying(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/settings/verify-access`, {
                username,
                password
            });

            if (response.data.success) {
                toast.success('Access granted! Whitelisting your IP...');
                // Reload the page after a short delay to let the IP sync
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error: any) {
            console.error('Bypass failed:', error);
            const message = error.response?.data?.message || 'Invalid credentials or verification failed';
            toast.error(message);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-white">
            {/* Subtle background decorative shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="relative z-10 p-4 max-w-md w-full">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-2xl text-center">
                    {/* Logo */}
                    <div className="mb-10 flex justify-center">
                        <Image
                            src="/logo/logo.svg"
                            alt="Fieldsy Logo"
                            width={200}
                            height={80}
                            className="object-contain w-[180px] h-auto"
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Coming Soon
                    </h1>

                    <p className="text-lg text-gray-600 mb-10 font-light leading-relaxed">
                        We're putting the finishing touches on Fieldsy.
                        The ultimate playground for your furry friends is almost ready!
                    </p>

                    {/* Authentication Form */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 mb-6 text-gray-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-semibold tracking-wider uppercase">Private Access Only</span>
                        </div>

                        <form onSubmit={handleBypass} className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isVerifying}
                                className="w-full bg-[#1A3A35] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#132b27] transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    'Bypass & Access Site'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-10 text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Fieldsy Platform. Secure internal environment.
                    </div>
                </div>
            </div>
        </div>
    );
};
