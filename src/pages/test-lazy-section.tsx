import { LazySection } from "@/components/common/LazySection"

export default function TestLazySection() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen bg-blue-500 flex items-center justify-center">
        <h1 className="text-4xl text-white">Scroll down to see lazy sections</h1>
      </div>
      
      <LazySection
        minHeight="400px"
        rootMargin="50px"
        animation="fade"
        delay={100}
      >
        <div className="py-20 bg-green-500">
          <h2 className="text-4xl text-white text-center">Fade Animation Section</h2>
        </div>
      </LazySection>
      
      <LazySection
        minHeight="400px"
        rootMargin="50px"
        animation="slideUp"
        delay={100}
      >
        <div className="py-20 bg-red-500">
          <h2 className="text-4xl text-white text-center">Slide Up Animation Section</h2>
        </div>
      </LazySection>
      
      <LazySection
        minHeight="400px"
        rootMargin="50px"
        animation="scale"
        delay={100}
      >
        <div className="py-20 bg-purple-500">
          <h2 className="text-4xl text-white text-center">Scale Animation Section</h2>
        </div>
      </LazySection>
      
      <div className="h-screen bg-gray-500 flex items-center justify-center">
        <h1 className="text-4xl text-white">End of page</h1>
      </div>
    </div>
  )
}