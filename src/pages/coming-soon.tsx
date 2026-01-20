import React from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function ComingSoon() {
    return (
        <>
            <Head>
                <title>Fieldsy - Coming Soon</title>
                <meta name="description" content="Fieldsy is coming soon. The best place to find private dog walking fields." />
            </Head>
            <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 to-green-700">
                {/* Background Overlay with Glassmorphism */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"></div>

                {/* Animated Background Shapes */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 p-8 max-w-2xl w-full mx-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl text-center transform hover:scale-105 transition-all duration-500">
                        {/* Logo Placeholder - You might want to use the actual logo */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-all duration-500">
                                <span className="text-4xl">🐕</span>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                            Coming Soon
                        </h1>

                        <p className="text-xl text-green-50 mb-8 font-light leading-relaxed">
                            We are building the ultimate platform for dog owners and field owners.
                            Get ready for safe, private, and fun adventures with your furry friends.
                        </p>



                        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-green-200/60">
                            &copy; {new Date().getFullYear()} Fieldsy. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
