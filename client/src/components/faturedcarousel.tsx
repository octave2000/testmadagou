// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
// import Link from "next/link";
// import { formatEnumString } from "@/lib/utils";
// import { AmenityIcons } from "@/lib/constants";
// import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

// interface FeaturedCarouselProps {
//   properties: any[];
// }

// export default function FeaturedCarousel({
//   properties,
// }: FeaturedCarouselProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [randomProperties, setRandomProperties] = useState<any[]>([]);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);
//   const [direction, setDirection] = useState<"next" | "prev">("next");

//   // Get 3 random properties on mount
//   useEffect(() => {
//     if (properties && properties.length > 0) {
//       const shuffled = [...properties].sort(() => Math.random() - 0.5);
//       setRandomProperties(shuffled.slice(0, Math.min(3, properties.length)));
//     }
//   }, [properties]);

//   // Auto-advance carousel
//   useEffect(() => {
//     if (!isAutoPlaying || randomProperties.length === 0) return;

//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % randomProperties.length);
//     }, 5000); // Change every 5 seconds

//     return () => clearInterval(interval);
//   }, [isAutoPlaying, randomProperties.length]);

//   const goToNext = () => {
//     setDirection("next");
//     setCurrentIndex((prev) => (prev + 1) % randomProperties.length);
//     setIsAutoPlaying(false);
//   };

//   const goToPrevious = () => {
//     setDirection("prev");
//     setCurrentIndex(
//       (prev) => (prev - 1 + randomProperties.length) % randomProperties.length,
//     );
//     setIsAutoPlaying(false);
//   };

//   const goToSlide = (index: number) => {
//     setDirection(index > currentIndex ? "next" : "prev");
//     setCurrentIndex(index);
//     setIsAutoPlaying(false);
//   };

//   if (!randomProperties || randomProperties.length === 0) {
//     return (
//       <div className="w-full h-[600px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
//         <p className="text-gray-500">Loading featured properties...</p>
//       </div>
//     );
//   }

//   const currentProperty = randomProperties[currentIndex];

//   return (
//     <section className="min-h-screen w-full bg-white relative z-0  overflow-x-hidden">
//       <div
//         className="absolute inset-0 z-0 pointer-events-none"
//         style={{
//           backgroundImage: `
//             linear-gradient(to left, #D7EBF9 5%, #FFF1E3 70%, #FFF1E3 100%)
//           `,
//           backgroundSize: "100% 100%",
//         }}
//       />

//       {/* Subtle floating elements */}
//       <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
//         <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-float" />
//         <div className="absolute bottom-40 left-10 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl animate-float-delayed" />
//       </div>

//       <div className="relative z-10 pt-20   sm:pt-[50px] md:pt-[50px] px-4 sm:px-6 md:px-10 flex flex-col gap-6">
//         <div className="hidden md:flex justify-between items-center align-middle pt-10">
//           {/* Main heading with subtitle */}
//           <div className="text-center md:text-left mb-2">
//             <h1 className="text-2xl sm:text-4xl md:text-6xl font-medium tracking-tight text-gray-900 leading-[1.1]">
//               Find your next comfort
//             </h1>
//             <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2 max-w-2xl">
//               Discover premium properties tailored to your lifestyle. Your dream
//               home awaits.
//             </p>
//           </div>
//           <div className="flex items-center justify-center md:justify-start gap-6 mb-4 flex-wrap">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//               <span className="font-medium">1,234 Active Listings</span>
//             </div>
//             <div className="h-4 w-px bg-gray-300" />
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <svg
//                 className="w-4 h-4 text-blue-500"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//               </svg>
//               <span className="font-medium">4.9 Average Rating</span>
//             </div>
//             <div className="h-4 w-px bg-gray-300 hidden sm:block" />
//             <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
//               <svg
//                 className="w-4 h-4 text-blue-500"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                 />
//               </svg>
//               <span className="font-medium">50K+ Happy Clients</span>
//             </div>
//           </div>
//         </div>

//         {/* Main carousel section */}
//         <div className="flex flex-col md:flex-row gap-6 pt-8 w-full">
//           <div className="relative w-full md:w-[70%] group">
//             {/* Image with transition */}
//             <Carousel>
//               <CarouselContent>
//                 <CarouselItem>
//                   <div className="relative overflow-hidden rounded-xl h-[220px] sm:h-[350px] md:h-[600px]">
//                     <Image
//                       key={currentProperty.id}
//                       src={currentProperty.photoUrls?.[0] || "/b.jpg"}
//                       alt={currentProperty.name}
//                       width={1920}
//                       height={1080}
//                       className="w-full h-full object-cover "
//                     />

//                     {/* Image overlay badge */}
//                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
//                       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//                       <span className="text-sm font-semibold text-gray-900">
//                         Featured Property
//                       </span>
//                     </div>

//                     {/* Navigation arrows */}
//                     <button
//                       onClick={goToPrevious}
//                       className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
//                     >
//                       <ChevronLeft className="w-5 h-5 text-gray-900" />
//                     </button>
//                     <button
//                       onClick={goToNext}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
//                     >
//                       <ChevronRight className="w-5 h-5 text-gray-900" />
//                     </button>

//                     {/* Dots indicator */}
//                     <div
//                       className="flex h-full transition-transform duration-700 ease-in-out"
//                       style={{
//                         transform: `translateX(-${currentIndex * 100}%)`,
//                       }}
//                     >
//                       {randomProperties.map((property) => (
//                         <div
//                           key={property.id}
//                           className="relative min-w-full h-full"
//                         >
//                           <Image
//                             src={property.photoUrls?.[0] || "/b.jpg"}
//                             alt={property.name}
//                             fill
//                             className="object-cover"
//                             priority
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </CarouselItem>
//               </CarouselContent>
//             </Carousel>
//           </div>

//           {/* Property details card - animated */}
//           <div
//             key={`details-${currentProperty.id}`}
//             className="bg-white w-full md:w-[30%] rounded-xl px-4 sm:px-6 py-6 text-base sm:text-lg md:text-xl flex flex-col gap-y-6 sm:gap-y-8 h-auto md:h-[600px] shadow-lg animate-fade-in"
//           >
//             <div className="flex justify-between items-start flex-wrap gap-2">
//               <div>
//                 <p className="text-gray-900 font-semibold text-base sm:text-lg mb-1">
//                   {currentProperty.name}
//                 </p>
//                 <p className="text-gray-600 text-sm sm:text-base">
//                   {currentProperty.location?.city},{" "}
//                   {currentProperty.location?.country}
//                 </p>
//               </div>
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                 Available
//               </span>
//             </div>

//             <div className="flex justify-between text-center gap-2 sm:gap-4">
//               <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
//                 <span className="font-bold text-2xl sm:text-3xl text-gray-900">
//                   {currentProperty.beds}
//                 </span>
//                 <span className="text-xs sm:text-sm text-gray-600 tracking-wide">
//                   Beds
//                 </span>
//               </div>

//               <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
//                 <span className="font-bold text-2xl sm:text-3xl text-gray-900">
//                   {currentProperty.baths}
//                 </span>
//                 <span className="text-xs sm:text-sm text-gray-600 tracking-wide">
//                   Baths
//                 </span>
//               </div>

//               <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
//                 <span className="font-bold text-2xl sm:text-3xl text-gray-900">
//                   {currentProperty.squareFeet}
//                 </span>
//                 <span className="text-xs sm:text-sm text-gray-600 tracking-wide">
//                   Sqft
//                 </span>
//               </div>
//             </div>

//             <div className="flex flex-wrap justify-between items-center gap-3 py-4 border-t border-gray-100">
//               <div>
//                 <p className="text-xs text-gray-500 mb-1">Price</p>
//                 <p className="text-xl sm:text-2xl font-bold text-gray-900">
//                   CFA{" "}
//                   {currentProperty.pricePerMonth?.toLocaleString() ||
//                     currentProperty.priceTotal?.toLocaleString()}
//                 </p>
//               </div>
//               {currentProperty.pricePerMonth && (
//                 <div className="text-right">
//                   <p className="text-xs text-gray-500 mb-1">Per Month</p>
//                   <p className="text-base sm:text-lg font-semibold text-gray-700">
//                     CFA {currentProperty.pricePerMonth.toLocaleString()}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <p>
//               <div>
//                 <h2 className="text-xl font-semibold my-3">
//                   Property Amenities
//                 </h2>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
//                   {currentProperty.amenities
//                     .slice(0, 4)
//                     .map((amenity: AmenityEnum) => {
//                       const Icon =
//                         AmenityIcons[amenity as AmenityEnum] || HelpCircle;
//                       return (
//                         <div
//                           key={amenity}
//                           className="flex flex-col items-center border border-gray-200 hover:border-primary-300 rounded-xl py-6 px-3 transition-all hover:shadow-md group"
//                         >
//                           <Icon className="w-4 h-4 mb-2 text-gray-600 group-hover:text-primary-600 transition-colors" />
//                           <span className="text-xs sm:text-sm text-center text-gray-700 group-hover:text-gray-900 font-medium">
//                             {formatEnumString(amenity)}
//                           </span>
//                         </div>
//                       );
//                     })}
//                 </div>
//               </div>
//             </p>
//             <Link href={`/search/${currentProperty.id}`}>
//               <Button className="py-5 sm:py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 sm:px-8 text-base sm:text-lg shadow-lg w-full cursor-pointer transition-all duration-300 hover:shadow-xl">
//                 Check Full Details
//               </Button>
//             </Link>
//           </div>
//         </div>

//         {/* Bottom trust indicators */}
//         <div className="flex items-center justify-center gap-8 mt-12 flex-wrap opacity-60">
//           <div className="text-center">
//             <p className="text-2xl font-bold text-gray-900">5M+</p>
//             <p className="text-xs text-gray-600">Properties Listed</p>
//           </div>
//           <div className="h-8 w-px bg-gray-300" />
//           <div className="text-center">
//             <p className="text-2xl font-bold text-gray-900">100+</p>
//             <p className="text-xs text-gray-600">Cities Covered</p>
//           </div>
//           <div className="h-8 w-px bg-gray-300" />
//           <div className="text-center">
//             <p className="text-2xl font-bold text-gray-900">24/7</p>
//             <p className="text-xs text-gray-600">Support Available</p>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%,
//           100% {
//             transform: translateY(0px);
//           }
//           50% {
//             transform: translateY(-20px);
//           }
//         }
//         @keyframes float-delayed {
//           0%,
//           100% {
//             transform: translateY(0px);
//           }
//           50% {
//             transform: translateY(-30px);
//           }
//         }
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }
//         .animate-float-delayed {
//           animation: float-delayed 8s ease-in-out infinite;
//         }
//         .animate-fade-in {
//           animation: fade-in 0.5s ease-out;
//         }
//       `}</style>
//     </section>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HelpCircle, Heart } from "lucide-react";
import Link from "next/link";
import { translateEnum } from "@/lib/i18n";
import { AmenityIcons } from "@/lib/constants";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "@/lib/i18n-client";
import { useAppSelector } from "@/state/redux";
import { formatCurrencyAmount } from "@/lib/currency";
import {
  getPriceUnitTranslationKey,
  getPrimaryPriceAmount,
} from "@/lib/property-pricing";
import { PropertyWithStatus } from "@/types/api";

interface FeaturedCarouselProps {
  properties: any[];
  isFavorite?: (propertyId: number) => boolean;
  onFavoriteToggle?: (propertyId: number) => void;
  showFavoriteButton?: boolean;
}

export default function FeaturedCarousel({
  properties,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = false,
}: FeaturedCarouselProps) {
  const [randomProperties, setRandomProperties] = useState<any[]>([]);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const { t } = useTranslations();
  const currency = useAppSelector((state) => state.global.currency);

  // Get 3 random properties on mount
  useEffect(() => {
    if (properties && properties.length > 0) {
      const shuffled = [...properties].sort(() => Math.random() - 0.5);
      setRandomProperties(shuffled.slice(0, Math.min(3, properties.length)));
    }
  }, [properties]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!randomProperties || randomProperties.length === 0) {
    return (
      <div className="w-full h-[520px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-gray-500">{t("carousel.loadingFeatured")}</p>
      </div>
    );
  }

  const currentProperty = randomProperties[current];
  const currentPropertyStatus = currentProperty as PropertyWithStatus;
  const priceAmount = getPrimaryPriceAmount(currentPropertyStatus);
  const priceLabel = formatCurrencyAmount(priceAmount, currency);
  const priceUnitKey = getPriceUnitTranslationKey(currentPropertyStatus);
  const priceUnitLabel = priceUnitKey
    ? priceUnitKey === "property.forSale"
      ? t("header.buy")
      : t(priceUnitKey)
    : "";

  return (
    <section className="min-h-screen w-full bg-white relative z-0 overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(135deg,rgba(253,250,246,1)_0%,rgba(220,234,245,1)_100%)]"></div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10  pt-[25px] md:pt-[25px] px-4  md:px-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center align-middle pt-6 md:pt-10 gap-6">
          {/* Main heading with subtitle */}
          <div className="text-center md:text-left mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-gray-900 leading-[1.1]">
              {t("carousel.title")}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2 max-w-2xl mx-auto md:mx-0">
              {t("carousel.subtitle")}
            </p>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-6 mb-4 flex-wrap w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">
                1,234 {t("carousel.activeListings")}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">
                4.9 {t("carousel.averageRating")}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-medium">
                50K+ {t("carousel.happyClients")}
              </span>
            </div>
          </div>
        </div>

        {/* Main carousel section */}
        <div className="flex flex-col md:flex-row gap-6 pt-8 w-full">
          <div className="relative w-full md:w-[70%]">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {randomProperties.map((property) => (
                  <CarouselItem key={property.id}>
                    <div className="relative overflow-hidden rounded-xl h-[200px] sm:h-[320px] md:h-[520px]">
                      <Image
                        src={property.photoUrls?.[0] || "/b.jpg"}
                        alt={property.name}
                        fill
                        className="object-cover"
                        priority
                      />

                      {/* Image overlay badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-gray-900">
                          {t("carousel.featuredProperty")}
                        </span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white" />
              <CarouselNext className="right-4 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white" />
            </Carousel>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {randomProperties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === current
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={t("carousel.goToSlide", { index: index + 1 })}
                />
              ))}
            </div>
          </div>

          {/* Property details card - animated */}
          <div
            key={`details-${currentProperty.id}`}
            className="bg-white w-full md:w-[30%] rounded-xl px-4 sm:px-6 py-6 text-base sm:text-lg md:text-xl flex flex-col gap-y-6 sm:gap-y-8 h-auto md:h-[520px] shadow-lg animate-fade-in"
          >
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <p className="text-gray-900 font-semibold text-base sm:text-lg mb-1">
                  {currentProperty.name}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {currentProperty.location?.city},{" "}
                  {currentProperty.location?.country}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {showFavoriteButton && (
                  <button
                    type="button"
                    className="bg-white border border-gray-200 hover:bg-gray-50 rounded-full p-2 transition-colors"
                    onClick={() => onFavoriteToggle?.(currentProperty.id)}
                    aria-label={t("dashboard.favorites")}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorite?.(currentProperty.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t("carousel.available")}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="font-bold text-2xl sm:text-3xl text-gray-900">
                  {currentProperty.beds}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 tracking-wide">
                  {t("filters.beds")}
                </span>
              </div>

              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="font-bold text-2xl sm:text-3xl text-gray-900">
                  {currentProperty.baths}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 tracking-wide">
                  {t("filters.baths")}
                </span>
              </div>

              <div className="flex flex-col items-center flex-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="font-bold text-2xl sm:text-3xl text-gray-900">
                  {currentProperty.squareFeet}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 tracking-wide">
                  {t("property.sqFt")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 py-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {t("carousel.price")}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {priceLabel}
                  {priceUnitKey ? (
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      {priceUnitLabel}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold my-3">
                {t("property.propertyAmenities")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {currentProperty.amenities
                  .slice(0, 4)
                  .map((amenity: AmenityEnum) => {
                    const Icon =
                      AmenityIcons[amenity as AmenityEnum] || HelpCircle;
                    return (
                      <div
                        key={amenity}
                        className="flex flex-col items-center border border-gray-200 hover:border-primary-300 rounded-xl py-6 px-3 transition-all hover:shadow-md group"
                      >
                        <Icon className="w-4 h-4 mb-2 text-gray-600 group-hover:text-primary-600 transition-colors" />
                        <span className="text-xs sm:text-sm text-center text-gray-700 group-hover:text-gray-900 font-medium">
                          {translateEnum("amenities", amenity)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <Link href={`/search/${currentProperty.id}`}>
              <Button className="py-5 sm:py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 sm:px-8 text-base sm:text-lg shadow-lg w-full cursor-pointer transition-all duration-300 hover:shadow-xl">
                {t("carousel.checkFullDetails")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom trust indicators */}
        <div className="flex items-center justify-center gap-8 mt-12 flex-wrap opacity-60">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">5M+</p>
            <p className="text-xs text-gray-600">
              {t("carousel.propertiesListed")}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">100+</p>
            <p className="text-xs text-gray-600">
              {t("carousel.citiesCovered")}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">24/7</p>
            <p className="text-xs text-gray-600">
              {t("carousel.supportAvailable")}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}
