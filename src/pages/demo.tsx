import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Bell, Menu, Download, Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, X } from 'lucide-react';

// Constants
const NAVIGATION_ITEMS = [
  { label: 'Home', href: '#', isActive: false },
  { label: 'About Us', href: '#', isActive: true },
  { label: 'Search Fields', href: '#', isActive: false },
  { label: 'How it works', href: '#', isActive: false },
  { label: "FAQ's", href: '#', isActive: false },
];

const STATISTICS = [
  { value: '500+', label: 'Early Access Signups' },
  { value: '200+', label: 'Private Fields Being Onboarded' },
  { value: '50+', label: 'Cities Covered Across the UK' },
  { value: '100%', label: 'Safe, Secure & Fenced Spaces' },
];

const WHAT_WE_DO_ITEMS = [
  { number: '01', title: 'Claim & Manage Fields', description: 'Get alerts for bookings, document updates, and field activity instantly.' },
  { number: '02', title: 'Track Field Usage', description: 'Monitor real-time occupancy and usage patterns for better field management.' },
  { number: '03', title: 'Document Management', description: 'Store and organize all field-related documents in one secure location.' },
  { number: '04', title: 'Team Coordination', description: 'Collaborate with team members and share updates in real-time.' },
  { number: '05', title: 'Booking Management', description: 'Handle bookings, payments, and customer communications effortlessly.' },
  { number: '06', title: 'Analytics & Insights', description: 'Access detailed reports and insights to optimize your field operations.' },
];

const WHY_FIELDSY_POINTS = [
  'Designed with compliance, transparency, and usability in mind',
  'Lightweight, mobile-friendly, and easy to use',
  'Scalable across teams, projects, and regions',
  'Built for the field, not just the office',
];

const FAQS = [
  {
    question: 'How do I book a field?',
    answer: 'Simply search by postcode or use your location, choose a field and time slot, and confirm your booking through our secure checkout. You\'ll receive instant confirmation via email and in the app.',
  },
  {
    question: 'How do I know what amenities are available?',
    answer: 'Each field listing includes detailed information about available amenities such as parking, water access, seating areas, and more.',
  },
  {
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes, you can cancel or reschedule your booking up to 24 hours before your scheduled time through your account dashboard.',
  },
  {
    question: 'Is it safe for all dog breeds?',
    answer: 'Yes, all our fields are fully fenced and secure, suitable for dogs of all sizes and breeds. Each field listing includes specific details about fencing height and security features.',
  },
];

const FOOTER_LINKS = {
  quick: [
    { label: 'Why Choose Us', href: '#' },
    { label: 'How It Works', href: '#' },
    { label: 'Field Owners', href: '#' },
    { label: 'Dog Owners', href: '#' },
  ],
  other: [
    { label: "FAQ's", href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

// Image constants with fallbacks
const IMAGES = {
  logo: 'https://via.placeholder.com/130x52/568035/ffffff?text=Fieldsy',
  userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=52&h=52&fit=crop',
  heroImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=585&h=440&fit=crop',
  dogWithBanner: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
  teamPhotos: [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=69&h=69&fit=crop',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=69&h=69&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=69&h=69&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=69&h=69&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=69&h=69&fit=crop',
  ],
  whoWeAreCenter: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=490&h=479&fit=crop',
  loveByPaws: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=312&h=219&fit=crop',
  whyFieldsy: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=585&h=558&fit=crop',
};

// Components
const NavigationItem = ({ item }) => (
  <a
    href={item.href}
    className={`text-[15px] transition-all duration-200 ${
      item.isActive
        ? 'font-bold text-[#3A6B22]'
        : 'font-semibold text-dark-green opacity-70 hover:opacity-100'
    }`}
  >
    {item.label}
  </a>
);

const StatisticItem = ({ stat, index, total }) => (
  <>
    <div className="text-center">
      <h3 className="text-[32px] sm:text-[48px] lg:text-[68px] font-normal text-[#212d1b] leading-tight">
        {stat.value}
      </h3>
      <p className="text-[14px] sm:text-[16px] lg:text-[18px] text-dark-green opacity-70 max-w-[200px] mx-auto">
        {stat.label}
      </p>
    </div>
    {index < total - 1 && (
      <div className="hidden sm:block w-px h-[60px] lg:h-[111px] bg-[#e6ebf2]" />
    )}
  </>
);

const WhatWeDoCard = ({ item }) => (
  <div className="flex flex-col gap-5">
    <div className="w-14 h-14 bg-[#8FB366] rounded-[10px] flex items-center justify-center">
      <span className="text-[24px] font-bold text-white">{item.number}</span>
    </div>
    <div>
      <h3 className="text-[20px] lg:text-[24px] font-semibold text-dark-green mb-2.5">
        {item.title}
      </h3>
      <p className="text-[16px] lg:text-[18px] text-dark-green opacity-70 leading-relaxed">
        {item.description}
      </p>
    </div>
  </div>
);

const FaqItem = ({ faq, index, expandedFaq, setExpandedFaq }) => {
  const isExpanded = expandedFaq === index;

  return (
    <div>
      {isExpanded ? (
        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#F8F1D7] shadow-[0px_20px_39px_-1px_rgba(0,44,66,0.03)] transition-all duration-300">
          <div className="flex justify-between items-start gap-4 sm:gap-[46px]">
            <div className="flex-1">
              <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0a2533] mb-2.5">
                {faq.question}
              </h3>
              <p className="text-[14px] sm:text-[16px] text-[#6b737d] leading-relaxed">
                {faq.answer}
              </p>
            </div>
            <button
              className="flex-shrink-0 mt-1 p-1"
              onClick={() => setExpandedFaq(-1)}
              aria-label="Collapse FAQ"
            >
              <ChevronUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#8FB366]" />
            </button>
          </div>
        </div>
      ) : (
        <button
          className="w-full flex justify-between items-center cursor-pointer hover:opacity-80 transition-all duration-200 py-2 text-left"
          onClick={() => setExpandedFaq(index)}
          aria-label={`Expand ${faq.question}`}
        >
          <h3 className="text-[16px] sm:text-[18px] font-medium text-[#0a2533] pr-4">
            {faq.question}
          </h3>
          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-[#8FB366] flex-shrink-0" />
        </button>
      )}
    </div>
  );
};

export default function AboutUs() {
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFCF3]">
      {/* Header */}
      <header className="bg-white shadow-[0px_5px_34px_0px_rgba(0,0,0,0.08)] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="w-[100px] sm:w-[130px] h-[40px] sm:h-[52px] bg-[#568035] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">Fieldsy</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {NAVIGATION_ITEMS.map((item, index) => (
                <NavigationItem key={index} item={item} />
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="relative w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-full bg-[#F8F1D7] flex items-center justify-center">
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-dark-green" />
              </button>
              <button className="relative w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-full bg-[#F8F1D7] flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-dark-green" />
                <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 bg-blood-red rounded-full text-white text-[8px] sm:text-[10px] flex items-center justify-center">
                  2
                </span>
              </button>
              <img
                src={IMAGES.userAvatar}
                alt="User"
                className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-full object-cover"
              />
              <button
                className="lg:hidden p-2"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-6 h-6 text-dark-green" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="text-xl font-bold text-dark-green">Menu</span>
              <button onClick={toggleMobileMenu} aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4 space-y-4">
              {NAVIGATION_ITEMS.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`text-lg py-2 ${
                    item.isActive
                      ? 'font-bold text-[#3A6B22]'
                      : 'text-dark-green opacity-70'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 py-6 lg:py-10">
        <h1 className="text-[24px] sm:text-[29px] font-semibold text-dark-green">About Us</h1>
      </div>

      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 pb-12 lg:pb-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
          <div className="flex-1">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-[#212d1b] leading-tight mb-4">
              All-in-One Platform for Smarter Field Operations
            </h2>
            <p className="text-[16px] lg:text-[18px] text-dark-green opacity-70 leading-relaxed mb-8 lg:mb-10">
              Fieldsy brings every aspect of field operations into a single, easy-to-use platform. From property claims and terrain tracking to team coordination and document management—we help you digitize, streamline, and scale your fieldwork with confidence. No more juggling spreadsheets, paperwork, or disconnected tools. With Fieldsy, everything you need is at your fingertips, wherever the field takes you.
            </p>
            <button className="bg-[#8FB366] text-white px-6 lg:px-7 py-3 lg:py-3.5 rounded-full flex items-center gap-2.5 hover:bg-[#7da055] transition-colors">
              <span className="font-bold text-[14px] lg:text-[16px]">Download App</span>
              <Download className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
          <div className="w-full lg:w-[585px] h-[300px] sm:h-[400px] lg:h-[440px] rounded-[20px] lg:rounded-[40px] overflow-hidden">
            <img
              src={IMAGES.heroImage}
              alt="Field operations"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 pb-12 lg:pb-20">
        <div className="flex flex-wrap justify-center sm:justify-between items-center gap-8">
          {STATISTICS.map((stat, index) => (
            <StatisticItem
              key={index}
              stat={stat}
              index={index}
              total={STATISTICS.length}
            />
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-12 lg:py-20 mb-12 lg:mb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent rounded-[20px] lg:rounded-[40px]" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 text-center">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-[#212d1b] mb-6 lg:mb-8">
            Our Mission
          </h2>
          <p className="text-[20px] sm:text-[26px] lg:text-[32px] text-[#212d1b] leading-relaxed max-w-[1129px] mx-auto">
            At Fieldsy, we're on a mission to simplify field data management for{' '}
            <span className="font-semibold text-[#3A6B22]">
              modern real estate, infrastructure, and surveying professionals
            </span>
            . Our platform bridges the gap between on-ground teams and digital operations—bringing clarity, control, and collaboration into one place.
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 pb-12 lg:pb-20">
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-[34px] items-center justify-between">
          {/* Card 1 */}
          <div className="bg-white rounded-[20px] lg:rounded-[32px] p-6 w-full xl:w-[362px] h-auto xl:h-[479px] shadow-[0px_6px_50px_0px_rgba(0,0,0,0.03)] border border-[rgba(219,215,196,0.34)]">
            <h3 className="text-[20px] lg:text-[24px] font-bold text-dark-green mb-2.5">
              Who We Are
            </h3>
            <p className="text-[16px] lg:text-[18px] text-dark-green opacity-70 leading-relaxed mb-6">
              We're a passionate team of developers, designers, and industry experts who understand the challenges of fieldwork. With years of experience in geospatial technologies, real estate insights, and user-focused software, we've built Fieldsy to meet the real needs of professionals working in dynamic environments.
            </p>
            <div className="flex -space-x-4">
              {IMAGES.teamPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Team member ${index + 1}`}
                  className="w-[50px] h-[50px] lg:w-[69px] lg:h-[69px] rounded-full border-2 border-white"
                />
              ))}
            </div>
          </div>

          {/* Center Image */}
          <div className="w-full xl:w-[490px] h-[300px] sm:h-[400px] xl:h-[479px] rounded-[20px] lg:rounded-[32px] overflow-hidden order-first xl:order-none">
            <img
              src={IMAGES.whoWeAreCenter}
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[20px] lg:rounded-[32px] p-6 w-full xl:w-[360px] h-auto xl:h-[479px] shadow-[0px_6px_50px_0px_rgba(0,0,0,0.03)] border border-[rgba(219,215,196,0.34)]">
            <div className="w-full h-[200px] lg:h-[219px] rounded-[20px] overflow-hidden mb-6">
              <img
                src={IMAGES.loveByPaws}
                alt="Dogs playing"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-[20px] lg:text-[24px] font-bold text-dark-green mb-2">
              Loved by Paws and People Alike
            </h3>
            <p className="text-[16px] lg:text-[18px] text-dark-green opacity-70 leading-relaxed">
              From tail wags to five-star ratings—Fieldsy is the go-to space for dog lovers to connect, explore, and book safe outdoor spots with ease.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="bg-[#F8F1D7] py-12 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20">
          <div className="text-center mb-8 lg:mb-[50px]">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-dark-green mb-4">
              What We Do
            </h2>
            <p className="text-[16px] lg:text-[18px] text-dark-green leading-relaxed max-w-[1000px] mx-auto">
              At Fieldsy, we empower field teams and property managers with the tools they need to work smarter—not harder. Our platform is designed to bring structure, visibility, and control to on-ground operations across real estate, infrastructure, land surveying, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
            {WHAT_WE_DO_ITEMS.map((item, index) => (
              <WhatWeDoCard key={index} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Fieldsy Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
          <div className="w-full lg:w-[585px] h-[300px] sm:h-[400px] lg:h-[558px] rounded-[20px] lg:rounded-[40px] overflow-hidden">
            <img
              src={IMAGES.whyFieldsy}
              alt="Why Fieldsy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-[#212d1b] mb-4">
              Why Fieldsy?
            </h2>
            <p className="text-[16px] lg:text-[18px] text-dark-green opacity-70 leading-relaxed mb-6 lg:mb-8">
              Choosing Fieldsy means choosing a smarter, more connected way to manage everything that happens on the ground.
            </p>

            <div className="space-y-3 mb-6 lg:mb-8">
              {WHY_FIELDSY_POINTS.map((point, index) => (
                <div key={index} className="flex items-start sm:items-center gap-4">
                  <div className="w-2 h-2 bg-[#8FB366] rounded-full flex-shrink-0 mt-1.5 sm:mt-0" />
                  <p className="text-[16px] lg:text-[18px] text-dark-green">{point}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#8FB36633] to-transparent p-4 lg:p-5 border-l-[5px] border-[#8FB366]">
              <h3 className="text-[20px] lg:text-[24px] font-semibold text-dark-green mb-2.5">
                Let's Build the Future of Field Intelligence
              </h3>
              <p className="text-[16px] lg:text-[18px] text-dark-green opacity-70 leading-relaxed">
                Fieldsy is more than a tool—it's a platform for innovation and transformation in field operations. We're constantly evolving with feedback, and we're here to help you work smarter on-site, every day.
              </p>
            </div>

            <button className="bg-[#8FB366] text-white px-6 lg:px-7 py-3 lg:py-3.5 rounded-full flex items-center gap-2.5 hover:bg-[#7da055] transition-colors mt-8 lg:mt-10">
              <span className="font-bold text-[14px] lg:text-[16px]">Download App</span>
              <Download className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#F8F1D7] py-12 lg:py-20 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 relative">
          <div className="flex flex-col xl:flex-row gap-8 lg:gap-20 items-start">
            {/* FAQ Content */}
            <div className="w-full xl:max-w-[634px] bg-[#FFFCF3] rounded-[20px] p-6 lg:p-8 border border-[#e6ebf2] shadow-[0px_20px_39px_-1px_rgba(0,44,66,0.03)]">
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-semibold text-[#0a2533] text-center mb-6 capitalize">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4 lg:space-y-6">
                {FAQS.map((faq, index) => (
                  <FaqItem
                    key={index}
                    faq={faq}
                    index={index}
                    expandedFaq={expandedFaq}
                    setExpandedFaq={setExpandedFaq}
                  />
                ))}
              </div>
            </div>

            {/* Download App CTA with Vector Background */}
            <div className="relative flex-1 w-full">
              {/* Vector Background - Hidden on mobile for better performance */}
              <div className="hidden xl:block absolute -top-10 -right-20 w-[732px] h-[616px] opacity-30">
                <svg viewBox="0 0 732 616" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0 0C0 0 366 154 366 308C366 462 732 616 732 616H0V0Z"
                    fill="#8FB366"
                    fillOpacity="0.2"
                  />
                </svg>
              </div>

              {/* Small decorative circle */}
              <div className="hidden xl:block absolute top-16 right-32 w-10 h-10 bg-[#8FB366] rounded-full opacity-60" />

              {/* Download Card */}
              <div className="bg-[#8FB366] rounded-[20px] lg:rounded-[27px] p-8 lg:p-12 relative overflow-hidden mt-0 xl:mt-8">
                {/* Dog Image */}
                <div className="absolute -top-6 lg:-top-12 right-0 w-[200px] lg:w-[263px] h-[140px] lg:h-[176px] opacity-50 lg:opacity-100">
                  <img
                    src={IMAGES.dogWithBanner}
                    alt="Dog with banner"
                    className="w-full h-full object-contain rotate-[0.262deg]"
                  />
                </div>

                <div className="relative z-10 max-w-[480px]">
                  <h2 className="text-[32px] sm:text-[40px] lg:text-[45px] font-bold text-white leading-tight mb-6">
                    Download The<br />Fieldsy App Today!
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-[#101624] text-white px-4 lg:px-6 py-3 lg:py-4 rounded-full flex items-center justify-center gap-3 hover:bg-dark-green transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                      </svg>
                      <span className="text-sm text-left">
                        Get it on<br />
                        <strong>Google Play</strong>
                      </span>
                    </button>
                    <button className="bg-[#101624] text-white px-4 lg:px-6 py-3 lg:py-4 rounded-full flex items-center justify-center gap-3 hover:bg-dark-green transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                      </svg>
                      <span className="text-sm text-left">
                        Download on the<br />
                        <strong>App Store</strong>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-green text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20 py-12 lg:py-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
            {/* Logo and Description */}
            <div className="md:col-span-2 xl:col-span-1">
              <div className="w-[120px] lg:w-[150px] h-[48px] lg:h-[60px] bg-[#568035] rounded-lg flex items-center justify-center mb-5">
                <span className="text-white font-bold text-lg lg:text-xl">Fieldsy</span>
              </div>
              <p className="text-[16px] lg:text-[18px] opacity-70 leading-relaxed mb-6 lg:mb-8">
                Fieldsy helps UK dog owners find and book secure, private walking fields nearby with GPS search, instant booking, and verified, fully fenced locations.
              </p>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-8 h-8 bg-[#F8F1D7] rounded-full flex items-center justify-center hover:bg-[#e6deb3] transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-dark-green" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-[20px] lg:text-[24px] font-semibold text-[#8FB366] mb-2.5">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.quick.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[16px] lg:text-[18px] opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other Links */}
            <div>
              <h3 className="text-[20px] lg:text-[24px] font-semibold text-[#8FB366] mb-2.5">
                Other Links
              </h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.other.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[16px] lg:text-[18px] opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-[20px] lg:text-[24px] font-semibold text-[#8FB366] mb-5">
                Contact Info
              </h3>
              <div className="space-y-6 lg:space-y-8">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#F8F1D7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-dark-green" />
                  </div>
                  <span className="text-[16px] lg:text-[18px] opacity-70">+1 854 635 4582</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#F8F1D7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-dark-green" />
                  </div>
                  <span className="text-[16px] lg:text-[18px] opacity-70 break-all">
                    fieldsyz@gmail.com
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 bg-[#F8F1D7] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-dark-green" />
                  </div>
                  <div>
                    <p className="text-[16px] lg:text-[18px] opacity-70">Camden Town, London</p>
                    <p className="text-[16px] lg:text-[18px] opacity-70">NW1 0LT, United Kingdom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-12 pt-4 border-t border-[#729c50]">
            <p className="text-center text-[14px] lg:text-[16px] opacity-50">
              © Copyright 2025. Fieldsy. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}