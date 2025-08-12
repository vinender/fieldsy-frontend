import React from 'react';
import { ChevronLeft } from 'lucide-react';

const TermsConditions = () => {
  const termsData = [
    {
      title: "1. About Fieldsy",
      content: "Fieldsy connects dog owners with private, secure dog walking fields offered by landowners. Users can search, book, and review fields, while landowners can list, manage, and earn from their land."
    },
    {
      title: "2. User Accounts",
      isList: true,
      content: [
        "You must be 18+ to create an account.",
        "All information provided must be accurate and up-to-date.",
        "You are responsible for maintaining the security of your account and password."
      ]
    },
    {
      title: "3. Booking Fields (For Dog Owners)",
      isList: true,
      content: [
        "You agree to follow the field owner's rules and the booking time strictly.",
        "Payment must be made in full at the time of booking.",
        "Fields are intended for private, non-commercial use unless otherwise agreed upon.",
        "Always pick up after your dog and leave the field as you found it."
      ]
    },
    {
      title: "4. Listing Fields (For Landowners)",
      isList: true,
      content: [
        "You must have legal rights to list the field for use.",
        "Your listing must include accurate information about fencing, access, pricing, and availability.",
        "Fieldsy reserves the right to review, edit, or reject any listing that doesn't meet platform standards.",
        "Landowners are responsible for ensuring the safety, cleanliness, and accessibility of their fields."
      ]
    },
    {
      title: "5. Payments & Fees",
      isList: true,
      content: [
        "Fieldsy securely processes payments on behalf of field owners.",
        "A small service fee may apply to each transaction.",
        "Landowners will receive payouts via the selected method (e.g., bank transfer, PayPal).",
        "All earnings must be reported in accordance with local tax laws."
      ]
    },
    {
      title: "6. Cancellations & Refunds",
      isList: true,
      content: [
        "Users can cancel up to 24 hours before the booking for a full refund.",
        "Late cancellations may not be eligible for a refund.",
        "Landowners can set custom cancellation policies, which must be clearly stated in the listing."
      ]
    },
    {
      title: "7. Field Access & Conduct",
      isList: true,
      content: [
        "Fieldsy is not responsible for the condition of the field or the behavior of users.",
        "Aggressive or unsafe behavior by dogs or humans may result in account suspension.",
        "Trespassing outside of the booked time is strictly prohibited."
      ]
    },
    {
      title: "8. Liability",
      isList: true,
      content: [
        "Users enter fields at their own risk.",
        "Fieldsy is not liable for any injury, damage, or loss resulting from bookings, dog behavior, or field conditions.",
        "Field owners must have appropriate insurance for their land use."
      ]
    },
    {
      title: "9. Platform Rules",
      isList: true,
      content: [
        "No illegal activity is permitted on or through Fieldsy.",
        "Do not use the platform to harass, spam, or misrepresent others.",
        "Violation of these terms may lead to account termination."
      ]
    },
    {
      title: "10. Changes to Terms",
      content: "We may update these Terms at any time. Continued use of Fieldsy after changes means you accept the updated Terms."
    },
    {
      title: "11. Contact Us",
      content: `For any questions, contact us at:
📧 fieldsyz@gmail.com
📍 Camden Town, London NW1 0LT, United Kingdom`
    }
  ];

  return (
    <div className="min-h-screen  bg-[#FFFCF3] mt-20 font-sans">
      {/* Main Container */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-8 lg:py-10">
        
        {/* Back Button and Title */}
        <div className="flex items-center mt-[20px]  gap-4 mb-8 lg:mb-10">
          <button className="flex items-center justify-center w-12 h-12 bg-[#F8F1D7] rounded-full hover:bg-[#F0EAB9] transition-colors">
            <img src="/back.svg" alt="Arrow Left" className="w-6 h-6 text-dark-green object-contain" />
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-[29px] font-semibold text-dark-green drop-shadow-sm">
            Terms & Conditions
          </h1>
        </div>

        {/* White Content Card */}
        <div className="bg-white rounded-3xl lg:rounded-[40px] shadow-[0px_14px_24px_0px_rgba(0,0,0,0.06)] p-6 sm:p-8 lg:p-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-xl lg:text-[20px] font-semibold text-[#0A2533] mb-2">
              Fieldsy – Terms & Conditions
            </h2>
            <div className="text-base lg:text-[16px] text-[#6B737D] leading-relaxed">
              <p className="mb-1">Effective Date: 24 Jun, 2025</p>
              <p>Welcome to Fieldsy! These Terms & Conditions ("Terms") govern your use of the Fieldsy platform (website and mobile app). By using Fieldsy, you agree to be bound by these Terms.</p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {termsData.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl lg:text-[20px] font-semibold text-[#0A2533]">
                  {section.title}
                </h3>
                {section.isList ? (
                  <ul className="list-disc list-inside text-base lg:text-[16px] text-[#6B737D] leading-[28px] space-y-1 ml-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="ml-4">
                        <span className="ml-1">{item}</span>
                      </li>
                    ))}
                  </ul>
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

export default TermsConditions;