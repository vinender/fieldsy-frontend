import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar, Star, Shield } from "lucide-react"
import { PlacesAutocomplete } from "@/components/ui/places-autocomplete"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image/Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-light-cream via-white to-cream" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-light-green rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

      <div className="relative z-10 mx-auto w-full px-4 sm:px-6 xl:px-8 py-24">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center xl:text-left">
            <div className="inline-flex items-center rounded-full bg-cream px-4 py-2 text-sm font-medium text-green mb-6">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Trusted by 10,000+ dog owners
            </div>
            
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold text-dark-green leading-tight">
              Find the Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green to-light-green"> Field </span>
              for Your Dog
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 w-full">
              Book safe, secure, and spacious fields where your furry friend can run, 
              play, and explore freely. From private gardens to professional training grounds.
            </p>

            {/* Search Bar */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-2 w-full relative">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 py-3 border-r border-gray-200 relative">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <PlacesAutocomplete
                    placeholder="Enter postcode or location"
                    className="w-full outline-none text-gray-700"
                    recentSearches={[
                      { title: "Sunny Paws Reserve", subtitle: "South London · 4 km away" },
                      { title: "Whispering Pines", subtitle: "Northfield · 6 km away" },
                      { title: "The Bark Yard", subtitle: "East Kent · 2.5 km away" },
                      { title: "Green Meadows Field", subtitle: "Kent TN25 · 3.1 km away" },
                      { title: "Doggie Dunes", subtitle: "Coastal Downs · 7 km away" },
                      { title: "Muddy Tails Trail", subtitle: "Riverbank · 5.5 km away" },
                    ]}
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-3 border-r border-gray-200">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <Input
                    type="text"
                    placeholder="Date & Time" 
                    className="border-0 shadow-none px-0 focus:ring-0 rounded-none"
                  />
                </div>
                <Button className="px-8 h-12">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
              <Link href="/fields">
                <Button className="w-full sm:w-auto h-12">
                  Browse All Fields
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full sm:w-auto h-12">
                  List Your Field
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 w-full">
              <div>
                <div className="text-3xl font-bold text-dark-green">500+</div>
                <div className="text-sm text-gray-600">Available Fields</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-dark-green">4.9/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-dark-green">24/7</div>
                <div className="text-sm text-gray-600">Booking Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop"
                alt="Happy dog running in a field"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-dark-green">Verified Locations</div>
                  <div className="text-sm text-gray-600">All fields inspected</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float animation-delay-2000">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green" />
                </div>
                <div>
                  <div className="font-semibold text-dark-green">100% Secure</div>
                  <div className="text-sm text-gray-600">Safe for all dogs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}