import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { FieldCard } from "@/components/fields/FieldCard"
import { FilterSection } from "@/components/fields/FilterSection"
import { MapPin, ChevronDown } from "lucide-react"

// Mock data matching Figma design
const mockFields = [
  {
    id: "1",
    name: "Green Meadows Field",
    location: "Bristol BS31 1JA",
    distance: "5km away",
    price: 18,
    priceUnit: "hour",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
    amenities: ["Secure fencing", "Water Access", "Shelter"],
    owner: "Owner",
  },
  {
    id: "2",
    name: "Barkside Paddock",
    location: "Bristol BS35 1JA",
    distance: "3km away",
    price: 10,
    priceUnit: "30 mins",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    amenities: ["Large dog area", "Water", "Waste Disposal"],
    owner: "Owner",
  },
  {
    id: "3",
    name: "Wagging Woods Field",
    location: "Bristol BS35 2JA",
    distance: "8km away",
    price: 20,
    priceUnit: "hour",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
    amenities: ["Secure fencing", "Water Access", "Shelter"],
    owner: "Owner",
  },
  {
    id: "4",
    name: "The Happy Hound Pasture",
    location: "Bristol BS31 1JA",
    distance: "10km away",
    price: 12,
    priceUnit: "hour",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1601758123927-4f7acc7c1177?w=400&h=300&fit=crop",
    amenities: ["Secure fencing", "Water Access", "Shelter"],
    owner: "Owner",
  },
  {
    id: "5",
    name: "Zoomies Zone",
    location: "Bristol BS35 2JA",
    distance: "7km away",
    price: 19,
    priceUnit: "hour",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=300&fit=crop",
    amenities: ["Secure fencing", "Water Access", "Toilet"],
    owner: "Owner",
  },
  {
    id: "6",
    name: "Quiet Paws Retreat",
    location: "Bristol BS31 2JA",
    distance: "12km away",
    price: 16,
    priceUnit: "hour",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    amenities: ["Secure fencing", "Water Access", "Shelter"],
    owner: "Owner",
  },
  {
    id: "7",
    name: "Tailspin Turf",
    location: "Bristol BS35 3JA",
    distance: "15km away",
    price: 22,
    priceUnit: "hour",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1601758174493-45d0a4d3e407?w=400&h=300&fit=crop",
    amenities: ["Dog agility equipment", "Restrooms", "Toilet"],
    owner: "Owner",
  },
  {
    id: "8",
    name: "River's Run Free Field",
    location: "Bristol BS31 3JA",
    distance: "9km away",
    price: 24,
    priceUnit: "hour",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&h=300&fit=crop",
    amenities: ["Secure fencing", "Water Access", "Toilet"],
    owner: "Owner",
  },
  {
    id: "9",
    name: "Green Meadows Field",
    location: "Bristol BS35 4JA",
    distance: "14km away",
    price: 14,
    priceUnit: "hour",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=300&fit=crop",
    amenities: ["Secure fencing", "Water Access", "Shelter"],
    owner: "Owner",
  }
]

export default function SearchFieldsPage() {
  const [fields] = useState(mockFields)
  const [likedFields, setLikedFields] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("relevance")
  const [location, setLocation] = useState("Bristol BS37 8QZ, United Kingdom")
  const [currentPage, setCurrentPage] = useState(1)

  const handleLike = (fieldId: string) => {
    setLikedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#fffcf3] pt-[100px]">
        {/* Search Bar Section */}
        <div className="px-[80px] py-4">
          <div className="bg-white rounded-[12px] px-4 py-3 flex items-center gap-3 shadow-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 outline-none text-[14px] text-[#192215]"
              placeholder="Enter location..."
            />
            <button className="text-[13px] text-[#3a6b22] font-medium hover:text-[#2a5b12] mr-2">
              Use My Location
            </button>
            <button className="px-5 py-2 bg-[#3a6b22] text-white text-[13px] rounded-full font-medium hover:bg-[#2a5b12] transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-[80px] pb-8">
          <div className="flex gap-6">
            {/* Left Sidebar - Filters */}
            <div className="w-[260px] flex-shrink-0">
              <FilterSection onFiltersChange={() => {}} />
            </div>

            {/* Right Content - Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-[20px] font-semibold text-[#192215]">
                  Over 135 results
                </h1>
                
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-600">Sort By</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-[13px] focus:outline-none focus:border-[#3a6b22]"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Rating</option>
                      <option value="distance">Distance</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Fields Grid - 4 columns as per Figma */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {fields.map(field => (
                  <FieldCard
                    key={field.id}
                    {...field}
                    isLiked={likedFields.includes(field.id)}
                    onLike={() => handleLike(field.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-1 mb-8">
                <button className="px-3 py-1 text-[12px] text-gray-600 hover:text-[#3a6b22]">
                  Back
                </button>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`w-7 h-7 text-[12px] rounded ${
                      currentPage === 1
                        ? 'bg-[#3a6b22] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    1
                  </button>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 text-[12px] rounded ${
                        currentPage === page
                          ? 'bg-[#3a6b22] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button className="px-3 py-1 text-[12px] text-gray-600 hover:text-[#3a6b22]">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}