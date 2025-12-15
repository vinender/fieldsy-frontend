import { useState, useEffect } from "react"
import { Facebook, Twitter, Youtube, Instagram, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { ContactSupportModal } from "@/components/modal/ContactSupportModal"

export function Footer() {
  const { data: session } = useSession();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Track client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userRole = isMounted ? session?.user?.role : undefined;

  return (
    <>
    <footer className="bg-dark-green text-white px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px]">
      <div className="mx-auto w-full   py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr] gap-8 xl:gap-16">
          {/* Company Information */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-start">
              <Image className='object-contain w-32 h-10 sm:w-42 sm:h-12' src='/logo/logo-cream.png' alt="Fieldsy logo" width={168} height={48}/>
            </div>
            <p className="text-white/60 leading-6 sm:leading-7 lg:leading-[28px] font-normal text-sm sm:text-base lg:text-[18px]">
              Fieldsy helps UK dog owners find and book secure, private walking fields nearby with GPS search, instant booking, and verified, fully fenced locations.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-white/80 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-white/80 hover:text-white cursor-pointer" />
              <Youtube className="w-5 h-5 text-white/80 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-white/80 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-light-green text-lg sm:text-xl xl:text-[24px] leading-8 sm:leading-10 lg:leading-[40px] font-semibold">Quick Links</h3>
            <ul className="flex flex-col gap-4 text-sm sm:text-base lg:text-[18px] leading-6 sm:leading-8 lg:leading-[32px] font-normal">
              <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="text-white/80 hover:text-white transition-colors">How It Works</Link></li>
              {userRole === 'FIELD_OWNER' ? (
                <li><Link href="/field-owner/dashboard" className="text-white/80 hover:text-white transition-colors">Field Owner</Link></li>
              ) : (
                <li><Link href="/fields" className="text-white/80 hover:text-white transition-colors">Dog Owner</Link></li>
              )}
            </ul>
          </div>

          {/* Other Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-light-green text-lg sm:text-xl xl:text-[24px] leading-8 sm:leading-10 lg:leading-[40px] font-semibold">Other Links</h3>
            <ul className="flex flex-col gap-4 text-sm sm:text-base lg:text-[18px] leading-6 sm:leading-8 lg:leading-[32px] font-normal">
              <li><Link href="/faqs" className="text-white/80 hover:text-white transition-colors">FAQ&apos;s</Link></li>
              <li><Link href="/terms-conditions" className="text-white/80 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-light-green text-lg sm:text-xl xl:text-[24px] leading-8 sm:leading-10 lg:leading-[40px] font-semibold">Contact Links</h3>
            <ul className="flex flex-col gap-4 text-sm sm:text-base lg:text-[18px] leading-6 sm:leading-8 lg:leading-[32px] font-normal">
              <li className="flex items-start sm:items-center space-x-3">
                <img src="/footer/call.svg" alt="Call" width={40} height={40} className="w-10 h-10" />
                <a href="tel:+448546354582" className="text-white/80 break-all sm:break-normal hover:text-white transition-colors">
                  +44 854 635 4582
                </a>
              </li>
              <li className="flex items-start sm:items-center space-x-3">
                <img src="/footer/msg.svg" alt="Email" width={40} height={40} className="w-10 h-10" />
                <a href="mailto:fieldsyz@gmail.com" className="text-white/80 break-all sm:break-normal hover:text-white transition-colors">
                  fieldsyz@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <img src="/footer/gps.svg" alt="Location" width={40} height={40} className="w-10 h-10" />
                <span className="text-white/80 text-sm sm:text-base">Camden Town, London NW1 OLT, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-white/80 text-sm sm:text-base">
            © Copyright 2025. Fieldsy. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>

    {/* Contact Support Modal */}
    <ContactSupportModal
      isOpen={isContactModalOpen}
      onClose={() => setIsContactModalOpen(false)}
    />
    </>
  )
} 
