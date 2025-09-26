import { useState } from "react"
import { GetStaticProps } from "next"
import { Search } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Input } from "@/components/ui/input"
import { FAQList, type FAQItem } from "@/components/common/FAQList"

interface FAQPageProps {
  faqs: FAQItem[]
}

export default function FAQPage({ faqs }: FAQPageProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white overflow-x-hidden pt-24">
        <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-[80px] py-10 sm:py-12 md:py-16 xl:py-20">
          <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-[48px] font-[700] text-dark-green leading-tight sm:leading-[1.3] md:leading-[1.2] xl:leading-[60px]">
                Frequently Asked Questions
              </h1>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96 ml-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 border-gray-300 focus:border-green focus:ring-light-green/20"
                />
              </div>
            </div>

            <FAQList faqs={filteredFaqs} hideTitle variant="plain" />

            {/* No results message */}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-dark-green/60 text-base xl:text-[18px] font-[400]">
                  No questions found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            )}

            {/* Contact Support */}
            <div className="mt-16 text-center">
              <p className="text-dark-green/80 mb-4 text-base xl:text-[18px] font-[400]">
                Can't find what you're looking for?
              </p>
              <button 
                className="px-8 py-3 rounded-full text-white font-[600] bg-green hover:bg-light-green transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
  
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch FAQs at build time
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/faqs`)
    const data = await response.json()
    
    const faqs: FAQItem[] = data?.data?.faqs?.map((faq: any) => ({
      question: faq.question,
      answer: faq.answer
    })) || []

    return {
      props: {
        faqs,
      },
      // Revalidate every 2 hours
      revalidate: 7200,
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return {
      props: {
        faqs: [],
      },
      // Try again in 60 seconds if there was an error
      revalidate: 60,
    }
  }
}