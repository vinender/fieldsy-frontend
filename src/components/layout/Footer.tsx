import { Facebook, Twitter, Youtube, Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-dark-green px-20 text-white">
      <div className="mx-auto w-full px-4 sm:px-6 xl:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="flex flex-col justify-evenly space-y-4">
            <div className="flex items-center justify-between  space-x-2">
       
              <img className='object-contain w-42 h-42' src='/logo/logo-cream.png'/>
            </div>
            <p className="text-white  leading-[28px] font-[400] text-[18px] ">
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
          <div className="space-y-4">
            <h3 className="text-light-green xl:text-[24px] leading-[40px] font-[600]">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Why Choose Us</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Field Owners</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Dog Owners</a></li>
            </ul>
          </div>

          {/* Other Links */}
          <div className="space-y-4">
          <h3 className="text-light-green xl:text-[24px] leading-[40px] font-[600]">Other Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">FAQ&apos;s</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
          <h3 className="text-light-green xl:text-[24px] leading-[40px] font-[600]">Contact Links</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-light-green rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80">+1 854 635 4582</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-light-green rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80">fieldsyz@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-light-green rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80">Camden Town, London NW1 OLT, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/80">
            © Copyright 2025. Fieldsy. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 