import { Facebook, Twitter, Youtube, Instagram, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-red-400 px-20 text-white">
      <div className="mx-auto w-full px-4 sm:px-6 xl:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-dark-green rounded-full"></div>
              </div>
              <span className="text-xl font-bold">Fieldsy</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
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
            <h3 className="text-light-green font-semibold">Quick Links</h3>
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
            <h3 className="text-light-green font-semibold">Other Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">FAQ&apos;s</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-light-green font-semibold">Contact Info</h3>
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