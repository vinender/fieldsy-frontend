import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Shield, Clock, Users } from "lucide-react"
import { HeroSection } from "@/components/home/HeroSection"

export default function HomePage() {
  const features = [
    {
      icon: MapPin,
      title: "Find Fields Near You",
      description: "Discover dog-friendly fields in your area with our easy search"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All fields are vetted for safety and properly fenced"
    },
    {
      icon: Clock,
      title: "Book Instantly",
      description: "Reserve your time slot with just a few clicks"
    },
    {
      icon: Users,
      title: "Community Reviews",
      description: "Read reviews from other dog owners to find the perfect field"
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Dog Field Marketplace?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to find and book the perfect field for your furry friend
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <feature.icon className="mx-auto h-12 w-12 text-primary" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Give Your Dog the Freedom They Deserve?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of happy dog owners who have found their perfect field
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg">Get Started Today</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}