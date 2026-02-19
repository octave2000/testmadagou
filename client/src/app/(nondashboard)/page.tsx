"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Search,
  MapPin,
  Bed,
  Bath,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Building2,
  Home,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { PropertySkeleton } from "@/components/property-skeleton";
import { DEFAULT_PROPERTY_PAGE_SIZE, PropertyTypeIcons } from "@/lib/constants";
import FeaturedCarousel from "@/components/faturedcarousel";
import { useTranslations } from "@/lib/i18n-client";
import { translateEnum } from "@/lib/i18n";
import { Property } from "@/types/prismaTypes";

export default function ApartmentListingPage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(16);
  const { t } = useTranslations();
  const { data: authUser } = useGetAuthUserQuery();
  const isTenantUser = authUser?.userRole === "tenant";
  const canShowFavoriteButton = !authUser || isTenantUser;
  const { data: tenant } = useGetTenantQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId || !isTenantUser,
  });
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();

  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery({
    isFeatured: true,
    isApproved: true,
    page: 1,
    limit: DEFAULT_PROPERTY_PAGE_SIZE,
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getFeaturedCount = (width: number) => {
      if (width >= 1024) return 18; // 4 full rows on lg with col-span items
      if (width >= 768) return 10; // 3 rows on md (4 cols)
      return 5; // fewer items on small screens
    };

    const updateFeaturedCount = () =>
      setFeaturedCount(getFeaturedCount(window.innerWidth));

    updateFeaturedCount();
    window.addEventListener("resize", updateFeaturedCount);
    return () => window.removeEventListener("resize", updateFeaturedCount);
  }, []);

  const isFavorite = (propertyId: number) =>
    tenant?.favorites?.some((fav: Property) => fav.id === propertyId) || false;

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) {
      router.push("/signin");
      return;
    }
    if (!authUser?.cognitoInfo?.userId || !isTenantUser) return;

    if (isFavorite(propertyId)) {
      await removeFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
      return;
    }

    await addFavorite({
      cognitoId: authUser.cognitoInfo.userId,
      propertyId,
    });
  };

  if (isError) {
    return (
      <div className="text-center py-20 text-gray-500">{t("home.error")}</div>
    );
  }

  const stats = [
    {
      label: t("home.stats.activeListings"),
      value: "10,000+",
      icon: Building2,
    },
    { label: t("home.stats.happyClients"), value: "50,000+", icon: Users },
    { label: t("home.stats.citiesCovered"), value: "100+", icon: MapPin },
    { label: t("home.stats.successRate"), value: "98%", icon: TrendingUp },
  ];

  const features = [
    {
      icon: Shield,
      title: t("home.features.verifiedTitle"),
      description: t("home.features.verifiedDesc"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: t("home.features.instantTitle"),
      description: t("home.features.instantDesc"),
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Heart,
      title: t("home.features.favoritesTitle"),
      description: t("home.features.favoritesDesc"),
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "First-time Buyer",
      content:
        "Found my dream apartment in just 2 weeks! The process was incredibly smooth.",
      rating: 5,
      image: "/api/placeholder/80/80",
    },
    {
      name: "Michael Chen",
      role: "Property Investor",
      content:
        "Best platform for finding investment properties. The data and insights are invaluable.",
      rating: 5,
      image: "/api/placeholder/80/80",
    },
    {
      name: "Emma Davis",
      role: "Renter",
      content:
        "The verification process gave me confidence. No scams, just quality listings.",
      rating: 5,
      image: "/api/placeholder/80/80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdfaf6]/10">
      {/* Hero Section with Parallax */}
      <FeaturedCarousel
        properties={properties || []}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavoriteToggle}
        showFavoriteButton={canShowFavoriteButton}
      />

      {/* Featured Properties */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {t("home.featuredTitle")}
              </h2>
              <p className="text-xl text-gray-600">
                {t("home.featuredSubtitle")}
              </p>
            </div>
            <Link href="/search">
              <button className="flex items-center md:gap-2  py-1 px-6 md:py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all group">
                {t("home.viewAll")}
                <ArrowRight className=" w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {isLoading || !properties ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: featuredCount }).map((_, i) => (
                <PropertySkeleton key={i} />
              ))}
            </div>
          ) : (
            <BentoGrid className="w-full">
              {properties.slice(0, featuredCount).map((item, i) => (
                <BentoGridItem
                  key={i}
                  listing={item}
                  isFavorite={isFavorite(item.id)}
                  onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                  showFavoriteButton={canShowFavoriteButton}
                  className={
                    i === 0 || i === 6 || i === 10 || i === 12
                      ? "md:col-span-2"
                      : ""
                  }
                />
              ))}
            </BentoGrid>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t("home.whyTitle")}
            </h2>
            <p className="text-xl text-gray-600">{t("home.whySubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0  opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                />
                <div
                  className={`w-full h-16 rounded-xl  flex items-center  justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <div className="w-full items-center flex justify-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.browseTitle")}
            </h2>
            <p className="text-xl text-gray-600">{t("home.browseSubtitle")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <Link
                href={`/search?propertyType=${type}`}
                key={type}
                className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-xl  flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-black" />
                </div>
                <div className="text-sm font-semibold text-gray-900 text-center">
                  {translateEnum("propertyTypes", type)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/*<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied property seekers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {testimonial.content}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold  mb-6">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-xl  mb-10">{t("home.ctaSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl">
                {t("home.ctaAction")}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
