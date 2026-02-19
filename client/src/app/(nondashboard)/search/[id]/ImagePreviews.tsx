"use client";
import { useGetPropertyQuery } from "@/state/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "@/lib/i18n-client";

const ImagePreviewsSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 max-w-7xl mx-auto px-4">
        {/* Main Preview Skeleton */}
        <div className="relative w-full aspect-[16/9] bg-gray-200 rounded-xl" />

        {/* Thumbnails Skeleton */}
        <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="relative aspect-square bg-gray-200 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ImagePreviews = ({ propertyId }: PropertyDetailsProps) => {
  const { t } = useTranslations();
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    data: property,
    isLoading,
    isError,
  } = useGetPropertyQuery(propertyId);

  useEffect(() => {
    if (property?.photoUrls?.length) {
      setImages(property.photoUrls);
    }
  }, [property]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, currentImageIndex, images.length]);

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) return <ImagePreviewsSkeleton />;
  if (isError || !property || images.length === 0)
    return (
      <div className="text-center py-12 text-gray-500">
        {t("common.notFound")}
      </div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
          {/* Main Preview */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl group">
            <Image
              src={images[currentImageIndex]}
              alt={t("property.imageAlt", {
                index: currentImageIndex + 1,
              })}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={t("common.previousImage")}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={t("common.nextImage")}
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {t("common.viewAll")}
            </button>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-scroll">
            {images.map((image, index) => (
              <div
                key={image}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "relative aspect-square  rounded-lg border-2 transition-all duration-200",
                  index === currentImageIndex
                    ? "border-primary-600 ring-2 ring-primary-500 scale-95"
                    : "border-transparent hover:border-gray-300 hover:scale-95",
                )}
              >
                <Image
                  src={image}
                  alt={t("property.thumbnailAlt", { index: index + 1 })}
                  fill
                  className="object-cover"
                />
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-primary-600/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
            aria-label={t("common.closeFullscreen")}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 text-white px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Image
              src={images[currentImageIndex]}
              alt={t("property.imageAlt", {
                index: currentImageIndex + 1,
              })}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
                aria-label={t("common.previousImage")}
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
                aria-label={t("common.nextImage")}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                    index === currentImageIndex
                      ? "border-white scale-110"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={image}
                    alt={t("property.thumbnailAlt", { index: index + 1 })}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreviews;
