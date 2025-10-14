import { useState } from "react"
import { Search } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Input } from "@/components/ui/input"
import { FAQPageList } from "@/components/common/FAQPageList"
import { ContactSupportModal } from "@/components/modal/ContactSupportModal"
import { useFAQs } from "@/hooks/queries/useFAQQueries"

export interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Fetch FAQs using React Query
  const { faqs, isLoading, isError } = useFAQs()

  // Filter FAQs based on search query - prioritize question matches
  const filteredFaqs = searchQuery.trim()
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs

  return (
    <>
      <Header />
      <div className="min-h-screen bg-cream/10 overflow-x-hidden pt-24">
        <div className="px-4  sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 xl:py-20">
          <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-dark-green leading-tight sm:leading-[1.3] md:leading-[1.2] xl:leading-[60px]">
                Frequently Asked Questions
              </h1>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96 ml-auto">
                <Search className="absolute left-4 top-1/2 fill-black  text-black transform -translate-y-1/2 w-5 h-5 " />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 border-gray-300 focus:border-green focus:ring-light-green/20"
                />
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
                <p className="mt-4 text-dark-green/60">Loading FAQs...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                <p className="text-red-600 font-semibold text-lg mb-2">
                  Error loading FAQs
                </p>
                <p className="text-red-600/80 text-base">
                  Please try again later or contact support.
                </p>
              </div>
            ) : (
              <>
                {/* Search Results Counter */}
                {searchQuery.trim() && filteredFaqs.length > 0 && (
                  <div className="mb-6">
                    <p className="text-dark-green/70 text-sm font-medium">
                      Found {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'} matching "{searchQuery}"
                    </p>
                  </div>
                )}

                {/* FAQ List or No Results Message */}
                {filteredFaqs.length > 0 ? (
                  <FAQPageList faqs={filteredFaqs} />
                ) : searchQuery.trim() ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <div className="mb-4">
                      <Search className="w-12 h-12 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-dark-green font-semibold text-lg mb-2">
                      No questions found
                    </p>
                    <p className="text-dark-green/60 text-base xl:text-[18px] font-[400]">
                      No questions found matching "{searchQuery}". Try a different search term.
                    </p>
                  </div>
                ) : faqs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <p className="text-dark-green/60 text-base xl:text-[18px] font-[400]">
                      No FAQs available at the moment.
                    </p>
                  </div>
                ) : null}
              </>
            )}

            {/* Contact Support */}
            <div className="mt-16 text-center">
              <p className="text-dark-green/80 mb-4 text-base xl:text-[18px] font-[400]">
                Can't find what you're looking for?
              </p>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-8 py-3 rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  )
}