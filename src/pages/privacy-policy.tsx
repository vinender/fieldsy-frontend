import React from 'react';

const PrivacyPolicy = () => {
  const privacyData = [
    {
      title: "1. Who We Are",
      content: "Fieldsy connects dog owners with secure, private dog walking fields listed by landowners across the UK. This policy applies to all users of our platform."
    },
    {
      title: "2. What Information We Collect",
      hasSubsections: true,
      content: "We may collect the following information:",
      subsections: [
        {
          subtitle: "a. Information You Provide Directly",
          isList: true,
          items: [
            "Name, email address, and contact details",
            "Password (encrypted)",
            "Payment information (handled securely via third-party processors)",
            "Field listing details (if you're a landowner)",
            "Profile photo or dog info (optional)"
          ]
        },
        {
          subtitle: "b. Information Collected Automatically",
          isList: true,
          items: [
            "IP address and device data",
            "Location (via GPS if enabled)",
            "Pages viewed, actions taken, time on site",
            "Cookies and similar tracking technologies"
          ]
        }
      ]
    },
    {
      title: "3. How We Use Your Information",
      isList: true,
      content: "We use your data to:",
      items: [
        "Provide and manage bookings",
        "Process payments securely",
        "Communicate with you (notifications, updates)",
        "Improve our services and personalize your experience",
        "Enforce platform policies and prevent fraud"
      ]
    },
    {
      title: "4. Sharing Your Information",
      isList: true,
      content: "We do not sell your personal data. We may share limited data with:",
      items: [
        "Payment processors (e.g., Stripe, PayPal)",
        "Field owners (for confirmed bookings only)",
        "Service providers (hosting, analytics)",
        "Law enforcement or regulators if legally required"
      ]
    },
    {
      title: "5. How We Protect Your Data",
      content: "We use industry-standard encryption, secure servers, and access controls to protect your information. All payment data is handled through PCI-compliant processors."
    },
    {
      title: "6. Your Rights",
      isList: true,
      content: "As a UK user under the UK GDPR, you have the right to:",
      items: [
        "Access your personal data",
        "Request correction or deletion",
        "Withdraw consent at any time",
        "Object to or restrict processing",
        "Request a copy of your data (data portability)"
      ]
    },
    {
      title: "7. Data Retention",
      content: "We keep your data only as long as necessary to provide our services or as required by law."
    },
    {
      title: "8. Cookies",
      content: "Fieldsy uses cookies to enhance functionality and understand user behavior. You can manage cookie preferences through your browser settings."
    },
    {
      title: "9. Children's Privacy",
      content: "Fieldsy is intended for users aged 18 and older. We do not knowingly collect data from children."
    },
    {
      title: "10. Changes to This Policy",
      content: "We may update this policy to reflect changes in law or our services. We will notify users of significant updates via email or app notification."
    },
    {
      title: "11. Contact Us",
      content: `For any questions, contact us at:
📧 fieldsyz@gmail.com
📍 Camden Town, London NW1 0LT, United Kingdom`
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF3] font-sans">
      {/* Main Container */}
      <div className="w-full mx-auto px-4 sm:px-6 mt-20 lg:px-20 py-8 lg:py-10">
        
        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mt-[20px] mb-8 lg:mb-10">
          <button className="flex items-center justify-center w-12 h-12 bg-[#F8F1D7] rounded-full hover:bg-[#F0EAB9] transition-colors">
            <img src="/back.svg" alt="Arrow Left" className="w-6 h-6 text-dark-green object-contain" />
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-[29px] font-semibold text-dark-green drop-shadow-sm">
            Privacy Policy
          </h1>
        </div>

        {/* White Content Card */}
        <div className="bg-white rounded-3xl lg:rounded-[40px] shadow-[0px_14px_24px_0px_rgba(0,0,0,0.06)] p-6 sm:p-8 lg:p-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-xl lg:text-[20px] font-semibold text-[#0A2533] mb-2">
              Fieldsy Privacy Policy
            </h2>
            <div className="text-base lg:text-[16px] text-[#6B737D] leading-relaxed">
              <p className="mb-1">Effective Date: 24 Jun, 2025</p>
              <p>Fieldsy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal data when you use our website, mobile app, and services.</p>
            </div>
          </div>

          {/* Privacy Policy Sections */}
          <div className="space-y-8">
            {privacyData.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl lg:text-[20px] font-semibold text-[#0A2533]">
                  {section.title}
                </h3>
                
                {section.hasSubsections ? (
                  <>
                    <p className="text-base lg:text-[16px] text-[#6B737D] leading-[28px]">
                      {section.content}
                    </p>
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex} className="mt-3">
                        <p className="text-base lg:text-[16px] font-semibold text-dark-green leading-[28px] mb-1">
                          {subsection.subtitle}
                        </p>
                        {subsection.isList && (
                          <ul className="list-disc list-inside text-base lg:text-[16px] text-[#6B737D] leading-[28px] space-y-1 ml-2">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="ml-4">
                                <span className="ml-1">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </>
                ) : section.isList ? (
                  <>
                    <p className="text-base lg:text-[16px] text-[#6B737D] leading-[28px] mb-1">
                      {section.content}
                    </p>
                    <ul className="list-disc list-inside text-base lg:text-[16px] text-[#6B737D] leading-[28px] space-y-1 ml-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="ml-4">
                          <span className="ml-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-base lg:text-[16px] text-[#6B737D] leading-[28px] whitespace-pre-line">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;