import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

export default function Custom404() {
    const { data: session } = useSession();
    const userRole = session?.user?.role;

    return (
        <>
            <Head>
                <title>Page Not Found | Fieldsy</title>
                <meta name="description" content="The page you are looking for does not exist." />
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-cream px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full space-y-8 text-center bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                    <div className="relative w-48 h-48 mx-auto -mt-6 mb-2">
                        <div className="absolute inset-0 bg-[#e8f5e9] rounded-full opacity-50 blur-3xl"></div>
                        <Image
                            src="/faq-dog.png"
                            alt="Lost Dog"
                            width={200}
                            height={200}
                            className="object-contain relative z-10 mx-auto"
                        />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-8xl font-bold text-green tracking-tighter">404</h1>
                        <h2 className="text-3xl sm:text-4xl font-bold text-dark-green">Whoops! Area Restricted</h2>
                        <p className="text-gray-600 text-lg max-w-lg mx-auto leading-relaxed">
                            Looks like this field hasn't been fenced yet, or you've wandered a bit too far off the path.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 pt-4">
                        <Link href="/" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-green text-white font-bold text-base hover:bg-dark-green transition-all shadow-lg shadow-green/20 hover:shadow-green/30 transform hover:-translate-y-0.5">
                                Back to Home
                            </button>
                        </Link>

                        {userRole === 'DOG_OWNER' && (
                            <Link href="/fields" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto py-3.5 px-8 rounded-full border-2 border-green text-green font-bold text-base hover:bg-green/5 transition-all">
                                    Browse Fields
                                </button>
                            </Link>
                        )}

                        {userRole === 'FIELD_OWNER' && (
                            <Link href="/field-owner/my-fields" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto py-3.5 px-8 rounded-full border-2 border-green text-green font-bold text-base hover:bg-green/5 transition-all">
                                    My Fields
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
