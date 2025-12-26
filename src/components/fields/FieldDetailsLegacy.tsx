import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Shield, BadgeCheck, ChevronDown, ChevronRight, CheckCircle, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useFieldReviews } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { LoginPromptModal } from '@/components/modal/LoginPromptModal';
import { useSession } from 'next-auth/react';
import FieldMapWrapper from '@/components/common/FieldMapWrapper';
import { useToggleFavorite, useFavoriteStatus } from '@/hooks/useFavorites';
import BackButton from '@/components/common/BackButton';
import { getAmenityIcon, getAmenityLabel } from '@/config/amenities.config';
import OwnerInformation from '@/components/fields/OwnerInformation';
import FieldLocation from '@/components/fields/FieldLocation';
import { AmenityIcon, ICON_COLORS } from '@/components/ui/AmenityIcon';
import { useFieldProperties } from '@/hooks/api/useFieldOptions';
import { RatingStars } from '@/components/common/RatingStars';
import { formatRating, formatOpeningHours } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';


interface FieldDetailsLegacyProps {
  field: any;
  isSubmitted?: boolean;
  isPreview?: boolean;
  headerContent?: React.ReactNode;
  showReviews?: boolean;
  showOwnerInfo?: boolean;
  showClaimField?: boolean;
}

export default function FieldDetailsLegacy({ field, isSubmitted = false, isPreview = false, headerContent, showReviews = true, showOwnerInfo = true, showClaimField = true }: FieldDetailsLegacyProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');
  const [rulesOpen, setRulesOpen] = useState(true);  // Expanded by default
  const [bookingOpen, setBookingOpen] = useState(false);  // Collapsed by default
  const [showFullDescription, setShowFullDescription] = useState(false);  // For description truncation

  // In preview mode, treat as claimed to show all sections
  const isClaimed = field?.isClaimed || isSubmitted || isPreview || false;
  const ownerImg = field?.owner?.image
  // Favorite status and toggle
  const fieldId = field?.id || field?._id;
  const { data: isFavorited } = useFavoriteStatus(fieldId);
  const toggleFavoriteMutation = useToggleFavorite(fieldId);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(isFavorited || false);
  }, [isFavorited]);

  // Auto-scroll to reviews section if hash is #reviews
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#reviews' && reviewsRef.current) {
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [field?.id]); // Run when field data is loaded

  const handleToggleFavorite = async () => {
    if (isSubmitted || isPreview) return; // Disabled in preview mode
    if (!session) {
      setLoginModalMessage('Please login or sign up to save your favorite fields');
      setShowLoginModal(true);
      return;
    }

    try {
      const result = await toggleFavoriteMutation.mutateAsync();
      setIsLiked(result.isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Fetch field properties to map slugs to labels
  const { data: fieldPropertiesData } = useFieldProperties();
  const fieldProperties = fieldPropertiesData?.data || {};

  // Fetch reviews at the top level (hooks must not be called conditionally)
  const { data: reviewsResp } = useFieldReviews(fieldId);
  const reviewsData = reviewsResp?.data || { reviews: [], stats: { averageRating: 0, totalReviews: 0, ratingDistribution: {} } };
  const reviews = reviewsData.reviews || [];
  const reviewStats = reviewsData.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: {} };

  // Helper function to get label from slug
  const getFieldPropertyLabel = (category: string, slug: string) => {
    if (!slug || !fieldProperties[category]) return slug;

    const option = fieldProperties[category]?.find((opt: any) => opt.value === slug);
    return option?.label || slug;
  };

  // Helper to get field type label
  const getFieldTypeLabel = (type: string) => {
    if (!type) return 'Not specified';
    const typeMap: { [key: string]: string } = {
      'soft-grass': 'Soft Grass',
      'walking-path': 'Walking Path',
      'wood-chips': 'Wood Chips',
      'artificial-grass': 'Artificial Grass',
      'mixed-terrain': 'Mixed Terrain',
      'post-and-wire': 'Post and Wire',
      'wooden-panel': 'Wooden Panel',
      'fully-enclosed-field-fencing': 'Fully Enclosed Field Fencing',
      'metal-rail': 'Metal Rail',
      'PRIVATE': 'Private',
      'PUBLIC': 'Public',
      'TRAINING': 'Training'
    };
    return typeMap[type] || type;
  };

  const specifications: { label: string; value: string }[] = [
    {
      label: 'Field Size',
      value: field?.size ? getFieldPropertyLabel('fieldSize', field.size) : 'Not specified'
    },
    {
      label: 'Fence type & size',
      value: field?.fenceType
        ? `${getFieldPropertyLabel('fenceType', field.fenceType)}${field?.fenceSize ? ' - ' + getFieldPropertyLabel('fenceSize', field.fenceSize) : ''}`
        : 'Not specified'
    },
    {
      label: 'Terrain Type',
      value: field?.type ? getFieldTypeLabel(field.terrainType) : 'Not specified'
    },
    {
      label: 'Surface type',
      value: field?.surfaceType ? getFieldPropertyLabel('surfaceType', field.surfaceType) : 'Not specified'
    },
    {
      label: 'Max Dogs',
      value: field?.maxDogs ? `${field.maxDogs} dogs allowed` : 'Not specified'
    },
    {
      label: 'Opening Days',
      value: field?.operatingDays?.[0]
        ? getFieldPropertyLabel('openingDays', field.operatingDays[0])
        : 'Not specified'
    },
    {
      label: 'Opening Hours',
      value: field?.openingTime && field?.closingTime
        ? formatOpeningHours(field.openingTime, field.closingTime)
        : 'Not specified'
    },
  ];

  const fieldImages = field?.images && field.images.length > 0 ? field.images : [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504826260979-242151ee45b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
  ];

  const defaultDescription = "A peaceful, green field ideal for off-leash play and zoomies. Fully fenced, with drinking water, shaded rest spots, and safe access. Perfect for morning walks or weekend meetups.";
  const descriptionText = field?.description?.trim() || defaultDescription;
  const DESCRIPTION_TRUNCATE_CHAR_LIMIT = 220;
  const shouldTruncateDescription = descriptionText.length > DESCRIPTION_TRUNCATE_CHAR_LIMIT;


  const communityRules = [
    'Dogs must be leashed when entering and exiting the park',
    'Make sure the gate is safe and secure before bringing your dog in',
    'Never enter a park before your booking starts/after it finishes',
    'Leave less',
    'Pick up after your dogs! Leave the spot as it was when you arrived',
    'Always review and abide by spot specific rules',
    'Prices attendant should restrooms are not available on site',
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF3] mt-12 xl:mt-32 w-full">

      <div className="max-w-[1920px] mx-auto">
        {headerContent && (
          <div className="px-4 lg:px-20 pb-2">{headerContent}</div>
        )}

        {/* Back Button with Claim Field label for unclaimed fields */}
        {!isClaimed && !isSubmitted && showClaimField && (
          <div className="px-4 lg:px-20 pb-4">
            <BackButton
              label="Claim Field"
              showLabel={true}
              variant="cream"
              size="lg"
            />
          </div>
        )}

        <main className="px-4 lg:px-20 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12 lg:items-stretch">
            <div className="w-full lg:w-[45%] xl:w-[50%] 2xl:w-[45%] lg:flex-shrink-0">
              <div className="h-full flex flex-col space-y-4 lg:sticky lg:top-24">
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {fieldImages?.slice(0, 4).map((img: string, index: number) => {
                    const isLastImage = index === 3;
                    const hasMoreImages = fieldImages.length > 4;
                    const showMoreButton = isLastImage && hasMoreImages;
                    const remainingCount = fieldImages.length - 4;
                    const isImageLoaded = imagesLoaded[index];

                    return (
                      <button
                        key={index}
                        type="button"
                        className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative"
                        onClick={() => { setCurrentImageIndex(index); setLightboxOpen(true); }}
                        aria-label={`Open image ${index + 1}`}
                      >
                        {/* Skeleton loader */}
                        {!isImageLoaded && (
                          <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
                        )}
                        <Image
                          src={img}
                          alt={`Field view ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          priority={index === 0}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          onLoad={() => setImagesLoaded(prev => ({ ...prev, [index]: true }))}
                          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${showMoreButton ? 'brightness-75' : ''} ${!isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {showMoreButton && isImageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                            <span className="text-white text-2xl font-semibold">
                              +{remainingCount}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {isClaimed && (
                  <FieldMapWrapper
                    address={field?.address || field?.streetAddress}
                    city={field?.city}
                    state={field?.state || field?.county}
                    zipCode={field?.zipCode || field?.postalCode}
                    fieldName={field?.name || field?.fieldName || 'Field Location'}
                    latitude={field?.latitude}
                    longitude={field?.longitude}
                    height="384px"
                    className="flex-grow"
                  />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-6 lg:min-h-0 lg:min-w-0 overflow-hidden">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                  <div className="flex items-baseline flex-wrap gap-2 min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-semibold text-dark-green truncate max-w-full">
                      {field?.name || field?.fieldName || 'Field'}
                    </h1>
                    <span className="text-xl lg:text-2xl text-dark-green">•</span>
                    <span className="text-xl lg:text-[24px]">
                      <span className="font-bold text-[#3A6B22]">£{field?.price30min || field.price || 0}</span>
                      <span className="font-light text-[16px] text-gray-500">/dog/30min</span>
                    </span>
                  </div>
                  <button
                    onClick={isSubmitted || isPreview ? undefined : handleToggleFavorite}
                    disabled={isSubmitted || isPreview || toggleFavoriteMutation.isPending}
                    className="mt-2 w-10 sm:mt-0 p-2 bg-white/20 backdrop-blur rounded-full border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {isLiked ? (
                      <img src="/field-details/saved-heart.svg" alt="Saved" className="w-5 h-5" />
                    ) : (
                      <img src="/field-details/gray-heart.svg" alt="Saved" className="w-5 h-5" />

                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <FieldLocation
                    field={field}
                    className="flex items-center text-sm lg:text-base text-dark-green min-w-0 flex-1"
                    iconClassName="w-5 h-5 text-[#8FB366] mr-1"
                    textClassName="truncate"
                    showDistance={true}
                  />
                  <div className="flex w-16 sm:w-auto items-center bg-dark-green text-white px-2 py-1 rounded-md flex-shrink-0 gap-1">
                    {/* <RatingStars
                    rating={field?.averageRating || 0}
                    size={14}
                    activeColor="#FFDD57"
                    inactiveColor="rgba(255,255,255,0.35)"
                    className="gap-[2px]"
                  /> */}
                    <img src='/star.svg' />
                    <span className="text-sm font-semibold">{formatRating(field?.averageRating || 0).toFixed(1)}</span>
                  </div>
                </div>

              </div>

              <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
                {(field?.amenities || []).map((amenity: any, index: number) => {
                  // Handle both new format (with iconUrl) and legacy format (string)
                  let iconPath: string;
                  let label: string;

                  if (typeof amenity === 'object' && amenity !== null) {
                    // New format from database: { label: string, iconUrl: string }
                    if (amenity.iconUrl && amenity.label) {
                      iconPath = amenity.iconUrl;
                      label = amenity.label;
                    } else {
                      // Legacy object format
                      const amenityStr = amenity?.label || amenity?.name || amenity?.value || '';
                      if (!amenityStr) return null;
                      const amenitySlug = amenityStr.toLowerCase().replace(/\s+/g, '-');
                      iconPath = getAmenityIcon(amenitySlug);
                      label = getAmenityLabel(amenitySlug);
                    }
                  } else if (typeof amenity === 'string') {
                    // Legacy string format
                    const amenitySlug = amenity.toLowerCase().replace(/\s+/g, '-');
                    iconPath = getAmenityIcon(amenitySlug);
                    label = getAmenityLabel(amenitySlug);
                  } else {
                    return null;
                  }

                  return (
                    <div key={index} className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2">
                      <div className="w-4 h-4 mr-2 flex-shrink-0">
                        <AmenityIcon
                          src={iconPath}
                          alt={label}
                          color={ICON_COLORS.black}
                          size={16}
                        />
                      </div>
                      <span className="text-sm text-dark-green">{label}</span>
                    </div>
                  );
                })}
              </div>

              {isClaimed && field?.owner && showOwnerInfo && (
                <OwnerInformation
                  owner={{
                    id: field?.ownerId || field?.owner?._id || field?.owner?.id || field?.userId,
                    name: field?.ownerName || field?.owner?.name,
                    email: field?.owner?.email,
                    isVerified: field?.owner?.isVerified,
                    createdAt: field?.joinedOn || field?.owner?.createdAt,
                    profileImage: ownerImg || field?.owner?.image
                  }}
                  fieldId={field?._id || field?.id}
                  showMessage={!isSubmitted}
                />
              )}

              {!isClaimed && !isSubmitted && showClaimField && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={isSubmitted ? undefined : () => router.push(`/fields/claim-field-form?field_id=${field?.id}`)}
                    className="flex-1 w-full bg-[#3A6B22] text-white font-semibold py-4 rounded-[70px] hover:bg-[#2e5519] transition"
                  >
                    Claim This Field
                  </button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button aria-label="What does claim mean" className="w-12 h-12 rounded-full border border-[#8FB366] text-green bg-white flex items-center justify-center">
                        <img src="/field-details/info.svg" alt="Info" className="w-5 h-5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-2xl p-8 bg-white">
                      <DialogTitle className="text-2xl md:text-[29px] font-[600] text-dark-green mb-2">What Does "Claim This Field" Mean?</DialogTitle>
                      <p className="text-gray-400 text-[15px] font-[400] mb-6">If you're the rightful owner or manager of a field already listed on Fieldsy, "Claim This Field" allows you to take control of the listing. Once claimed and verified, you'll be able to:</p>
                      <div className="space-y-4">
                        {["Edit field details and photos", "Manage bookings and messages", "Track earnings from your dashboard", "Set availability and pricing"].map((text) => (
                          <div key={text} className="flex items-start gap-3  ">
                            <CheckCircle className="w-8 h-8 text-white fill-light-green rounded-full " />
                            <span className="text-dark-green text-[500] text-[16px]">{text}</span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg text-dark-green mb-2">Description</h3>
                <div className="text-dark-green leading-relaxed break-words">
                  <p className={`${!showFullDescription && shouldTruncateDescription ? 'line-clamp-2 sm:line-clamp-3' : ''}`}>
                    {descriptionText}
                  </p>
                  {shouldTruncateDescription && (
                    <button
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="mt-2 text-[#3A6B22] font-semibold underline hover:opacity-80 transition-opacity"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-dark-green mb-3">Field Specifications</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 overflow-x-auto">
                  {specifications.map((row) => (
                    <div key={row.label} className="flex items-start justify-between text-sm gap-4">
                      <span className="text-gray-600 flex-shrink-0">{row.label}</span>
                      <span className="font-medium text-dark-green text-right min-w-0 break-words">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>


              <h3 className="font-bold text-lg text-dark-green ">Other Details</h3>


              {/* Map for unclaimed fields only - claimed fields show map on left */}
              {!isClaimed && !isSubmitted && (
                <FieldMapWrapper
                  address={field?.address || field?.streetAddress}
                  city={field?.city}
                  state={field?.state || field?.county}
                  zipCode={field?.zipCode || field?.postalCode}
                  fieldName={field?.name || field?.fieldName || 'Field Location'}
                  latitude={field?.latitude}
                  longitude={field?.longitude}
                  height="300px"
                  className=""
                />
              )}

              {/* Other details and actions - Show for claimed fields OR in preview mode */}
              {(isClaimed || isSubmitted) && (
                <div className="space-y-2">
                  {/* Slot Duration Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 gap-2">
                    <div className="flex items-center gap-2">
                      <img src="/field-details/availablity.svg" alt="slot duration" className="w-5 h-5" />
                      <span className="text-dark-green font-medium ">Availability</span>
                    </div>

                    <button
                      onClick={(isSubmitted || isPreview) ? undefined : () => {
                        if (!session) {
                          router.push('/login');
                        } else {
                          router.push(`/fields/book-field?id=${field?._id || field?.id}`);
                        }
                      }}
                      className={`font-semibold ${(isSubmitted || isPreview) ? 'text-green/60 cursor-default' : 'text-green hover:underline cursor-pointer'}`}
                      disabled={isSubmitted || isPreview}
                    >
                      Find availability time
                    </button>
                    {/* <div className="text-[#3A6B22] font-semibold">
                    {field?.minBookingDuration || field?.bookingDuration || '30 min'}
                  </div> */}
                  </div>

                  {/* Rules Collapsible */}
                  <div className="bg-white border border-gray-200 rounded-xl">
                    <button
                      className={`w-full flex items-center justify-between px-4 py-3  w-full ${rulesOpen ? 'border-b' : ''}`}
                      onClick={() => setRulesOpen(!rulesOpen)}
                    >
                      <div className="flex items-center gap-2">
                        <img src="/field-details/rules.svg" alt="rules" className="w-5 h-5" />
                        <span className="text-dark-green font-medium "> Rules</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
                    </button>



                    {rulesOpen && (
                      <div className="px-4 pb-4 space-y-2">
                        <span className="text-dark-green font-[700] text-[24px]  ">Host Rules</span>

                        {/* Host rules cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">

                          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-3">
                            <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                              <img src="/field-details/clock.svg" alt="clock" className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[16px] font-[700] text-dark-green">Minimum visit duration per booking</p>
                              <p className="text-sm font-medium text-dark-green">
                                {/* {field?.minBookingDuration || '30'} */}
                                30 min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-3">
                            <div className="w-10 h-10 border rounded-xl bg-white flex items-center justify-center">
                              <img src="/field-details/pet.svg" alt="pet" className="w-6 h-6 " />
                            </div>
                            <div>
                              <p className="text-[16px] font-[700] text-dark-green">Max dogs per booking</p>
                              <p className="text-sm font-medium text-dark-green">{field?.maxDogs || 4} Dogs</p>
                            </div>
                          </div>
                        </div>

                        {/* Community safety rules list */}
                        <h4 className="font-[700] text-[24px] text-dark-green mb-2">
                          {field?.rules ? 'Community safety rules' : 'Community safety rules'}
                        </h4>
                        <div className="space-y-3">
                          {(() => {
                            let rulesToDisplay: string[] = [];

                            if (field?.rules) {
                              // If rules is an array
                              if (Array.isArray(field.rules)) {
                                // Check if array has a single string element
                                if (field.rules.length === 1 && typeof field.rules[0] === 'string') {
                                  const rulesText = field.rules[0];
                                  // Check if text contains newlines (new format)
                                  if (rulesText.includes('\n')) {
                                    // Split by newlines
                                    rulesToDisplay = rulesText
                                      .split('\n')
                                      .filter((rule: string) => rule.trim().length > 0)
                                      .map((rule: string) => rule.trim());
                                  } else if (rulesText.includes('.')) {
                                    // Old format: Split by periods
                                    rulesToDisplay = rulesText
                                      .split(/\.(?:\s+|$)/)  // Split by period followed by whitespace or end
                                      .filter((rule: string) => rule.trim().length > 0)
                                      .map((rule: string) => {
                                        // Clean up the rule text and ensure proper formatting
                                        let cleanRule = rule.trim();
                                        // Add period back if it doesn't end with punctuation
                                        if (!/[.!?]$/.test(cleanRule)) {
                                          cleanRule += '.';
                                        }
                                        return cleanRule;
                                      });
                                  } else {
                                    // Single rule without period or newline
                                    rulesToDisplay = [rulesText.trim()];
                                  }
                                } else {
                                  // Use array as is, but still check each element
                                  rulesToDisplay = field.rules.flatMap((rule: any) => {
                                    if (typeof rule === 'string') {
                                      // Check for newlines first
                                      if (rule.includes('\n')) {
                                        return rule
                                          .split('\n')
                                          .filter((r: string) => r.trim().length > 0)
                                          .map((r: string) => r.trim());
                                      } else if (rule.includes('.')) {
                                        // If this array element contains multiple sentences, split it
                                        return rule
                                          .split(/\.(?:\s+|$)/)
                                          .filter((r: string) => r.trim().length > 0)
                                          .map((r: string) => {
                                            let cleanRule = r.trim();
                                            if (!/[.!?]$/.test(cleanRule)) {
                                              cleanRule += '.';
                                            }
                                            return cleanRule;
                                          });
                                      }
                                    }
                                    return rule;
                                  });
                                }
                              }
                              // If rules is a string
                              else if (typeof field.rules === 'string') {
                                // Check if text contains newlines (new format)
                                if (field.rules.includes('\n')) {
                                  // Split by newlines
                                  rulesToDisplay = field.rules
                                    .split('\n')
                                    .filter((rule: string) => rule.trim().length > 0)
                                    .map((rule: string) => rule.trim());
                                } else {
                                  // Old format: Split by periods
                                  rulesToDisplay = field.rules
                                    .split(/\.(?:\s+|$)/)  // Split by period followed by whitespace or end
                                    .filter((rule: string) => rule.trim().length > 0)
                                    .map((rule: string) => {
                                      let cleanRule = rule.trim();
                                      // Add period back if it doesn't end with punctuation
                                      if (!/[.!?]$/.test(cleanRule)) {
                                        cleanRule += '.';
                                      }
                                      return cleanRule;
                                    });
                                }
                              }
                            }

                            // Use community rules as fallback if no field rules
                            if (rulesToDisplay.length === 0) {
                              rulesToDisplay = communityRules;
                            }

                            return rulesToDisplay.map((rule: string, index: number) => (
                              <div key={index} className="flex items-start gap-3">
                                <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                                <p className="text-sm text-dark-green leading-relaxed break-words whitespace-pre-wrap">{rule}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking Policies (Collapsible) */}
                  <div className="bg-white border border-gray-200 rounded-xl">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3"
                      onClick={() => setBookingOpen(!bookingOpen)}
                    >
                      <div className="flex items-center gap-2">
                        <img src="/field-details/policy.svg" alt="policy" className="w-5 h-5" />
                        <span className="text-dark-green font-medium">Booking Policies</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${bookingOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {bookingOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        {(() => {
                          let policiesToDisplay: string[] = [];

                          // Parse cancellation policy if available
                          if (field?.cancellationPolicy) {
                            if (typeof field.cancellationPolicy === 'string') {
                              // Check if text contains newlines (new format)
                              if (field.cancellationPolicy.includes('\n')) {
                                // Split by newlines
                                const policies = field.cancellationPolicy
                                  .split('\n')
                                  .filter((policy: string) => policy.trim().length > 0)
                                  .map((policy: string) => policy.trim());
                                policiesToDisplay.push(...policies);
                              } else {
                                // Old format: Split by periods to get individual policies
                                const policies = field.cancellationPolicy
                                  .split(/\.(?:\s+|$)/)
                                  .filter((policy: string) => policy.trim().length > 0)
                                  .map((policy: string) => {
                                    let cleanPolicy = policy.trim();
                                    if (!/[.!?]$/.test(cleanPolicy)) {
                                      cleanPolicy += '.';
                                    }
                                    return cleanPolicy;
                                  });
                                policiesToDisplay.push(...policies);
                              }
                            }
                          }

                          // Add instant booking policy if defined
                          if (field?.instantBooking !== undefined) {
                            policiesToDisplay.push(
                              field.instantBooking
                                ? 'Instant booking is enabled. You will be instantly confirmed for any booking you request.'
                                : 'Booking does not requires host approval. You will receive confirmation once the booking is confirmed.'
                            );
                          }

                          // Add buffer time policy
                          policiesToDisplay.push(
                            `Only one booking is allowed at a time with a ${field?.bufferTime || 30} min buffer between all bookings to ensure dogs in separate bookings do not meet.`
                          );

                          // Add booking policies if field has them
                          if (field?.bookingPolicies) {
                            if (Array.isArray(field.bookingPolicies)) {
                              // Handle array of policies
                              field.bookingPolicies.forEach((policy: any) => {
                                if (typeof policy === 'string') {
                                  // Check for newlines first
                                  if (policy.includes('\n')) {
                                    const splitPolicies = policy
                                      .split('\n')
                                      .filter((p: string) => p.trim().length > 0)
                                      .map((p: string) => p.trim());
                                    policiesToDisplay.push(...splitPolicies);
                                  } else if (policy.includes('.')) {
                                    // Old format: Split if contains multiple sentences
                                    const splitPolicies = policy
                                      .split(/\.(?:\s+|$)/)
                                      .filter((p: string) => p.trim().length > 0)
                                      .map((p: string) => {
                                        let cleanPolicy = p.trim();
                                        if (!/[.!?]$/.test(cleanPolicy)) {
                                          cleanPolicy += '.';
                                        }
                                        return cleanPolicy;
                                      });
                                    policiesToDisplay.push(...splitPolicies);
                                  } else {
                                    policiesToDisplay.push(policy);
                                  }
                                }
                              });
                            } else if (typeof field.bookingPolicies === 'string') {
                              // Check if text contains newlines (new format)
                              if (field.bookingPolicies.includes('\n')) {
                                const policies = field.bookingPolicies
                                  .split('\n')
                                  .filter((policy: string) => policy.trim().length > 0)
                                  .map((policy: string) => policy.trim());
                                policiesToDisplay.push(...policies);
                              } else {
                                // Old format: Split string by periods
                                const policies = field.bookingPolicies
                                  .split(/\.(?:\s+|$)/)
                                  .filter((policy: string) => policy.trim().length > 0)
                                  .map((policy: string) => {
                                    let cleanPolicy = policy.trim();
                                    if (!/[.!?]$/.test(cleanPolicy)) {
                                      cleanPolicy += '.';
                                    }
                                    return cleanPolicy;
                                  });
                                policiesToDisplay.push(...policies);
                              }
                            }
                          }

                          // Add default policies if no specific field data
                          if (policiesToDisplay.length <= 1) {
                            policiesToDisplay.push(
                              'Visits can be moved or cancelled up to 2 hours before a visit.',
                              'Visits can be extended and dogs can be added throughout the visit.'
                            );
                          }

                          // Remove duplicates while preserving order
                          const uniquePolicies = [...new Set(policiesToDisplay)];

                          return uniquePolicies.map((policy: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <img src="/field-details/tick.svg" alt="tick" className="w-5 h-5 mt-0.5" />
                              <p className="text-sm text-dark-green leading-relaxed break-words whitespace-pre-wrap">{policy}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isClaimed && !isSubmitted && !isPreview && (
                <div className="space-y-3">
                  <button
                    onClick={isSubmitted ? undefined : () => {
                      if (!session) {
                        router.push('/login');
                      } else {
                        router.push(`/fields/book-field?id=${field?._id || field?.id}`);
                      }
                    }}
                    className="w-full bg-[#3A6B22] text-white font-semibold py-4 rounded-[70px] hover:bg-[#2e5519] transition"
                  >
                    Book Now
                  </button>
                </div>
              )}


            </div>

          </div>
          {/* Reviews section - only show for claimed fields */}
          {showReviews && !isSubmitted && isClaimed && (
            <div id="reviews" ref={reviewsRef} className={`mt-12 lg:mt-16 scroll-mt-32 ${showReviews ? 'w-full' : 'max-w-2xl'}`}>
              {/* Reviews & Ratings Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-dark-green">Reviews & Ratings</h2>
              </div>

              {/* Summary row: only if there are reviews */}
              {reviewStats.totalReviews > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Left: Reviews summary box (legacy style) */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="text-dark-green font-semibold text-sm mb-4">Reviews</div>
                    <div className="flex gap-6">
                      {/* Average score */}
                      <div className="w-36 bg-black flex flex-col items-left justify-center rounded-xl p-4">
                        <div className="text-4xl font-bold text-white">{formatRating(reviewStats.averageRating || 0).toFixed(1)}</div>
                        <div className="flex items-center mt-2">
                          <RatingStars rating={reviewStats.averageRating || 0} size={16} />
                        </div>
                        <div className="text-xs text-gray-200 mt-2">{reviewStats.totalReviews} Reviews</div>
                      </div>
                      {/* Rating bars */}
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const dist = (reviewStats.ratingDistribution as Record<number, number>) || {} as Record<number, number>;
                          const count = dist[stars] || 0;
                          const percentage = reviewStats.totalReviews > 0 ? Math.round((count / reviewStats.totalReviews) * 100) : 0;
                          return (
                            <div key={stars} className="flex items-center mb-2">
                              <span className="text-sm text-gray-600 w-10">{stars} Star</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3 overflow-hidden">
                                <div className="bg-[#FFDD57] h-full rounded-full" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Review button removed - reviews now only submitted from booking details in My Bookings page */}
                </div>
              )}

              {/* Review Cards or only leave-review when none */}
              {reviews.length > 0 ? (
                <div className="space-y-6 bg-transparent">
                  {reviews.map((review: any, index: number) => (
                    <div key={review.id || index} className="bg-transparent rounded-[30px] p-6 border border-yellow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center w-full">
                          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 overflow-hidden">
                            {review.user?.image ? (
                              <img src={review.user.image} alt={review.user?.name || 'User'} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className='flex justify-between w-full'>
                            <div className='flex flex-col'>
                              <h4 className="font-semibold text-[#090F1F]">{review.user?.name || 'User'}</h4>
                              {review.createdAt && (
                                <div className="text-xs text-gray-500 mt-">{format(new Date(review.createdAt), 'MMM d, yyyy')}</div>
                              )}
                            </div>

                            <div className="flex items-center mt-1">
                              <RatingStars rating={review.rating || 0} size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border flex flex-col justify-between border-gray-200 rounded-2xl p-6">
                  <p className="text-gray-600 text-sm text-center">No reviews yet. Be the first to book and review this field!</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {lightboxOpen && (
        <ImageLightbox images={fieldImages} open={lightboxOpen} initialIndex={currentImageIndex} onOpenChange={setLightboxOpen} />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginModalMessage}
      />
    </div>
  );
}
