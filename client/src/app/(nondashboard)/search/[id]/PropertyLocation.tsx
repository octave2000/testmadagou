import { useGetPropertyQuery } from "@/state/api";
import { Compass, MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef } from "react";
import { useTranslations } from "@/lib/i18n-client";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const PropertyLocationSkeleton = () => {
  return (
    <div className="py-8 sm:py-12 md:py-16 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-48 mb-4" />

      {/* Desktop layout */}
      <div className="hidden sm:flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>
      </div>

      <div className="relative h-[250px] sm:h-[350px] md:h-[400px] rounded-xl bg-gray-200 shadow-md" />
    </div>
  );
};

const PropertyLocation = ({ propertyId }: PropertyDetailsProps) => {
  const { t } = useTranslations();
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (isLoading || isError || !property) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/octave100/cmj2ee2lk001i01qt0njbgx4h",
      center: [
        property.location.coordinates.longitude,
        property.location.coordinates.latitude,
      ],
      zoom: 14,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const marker = new mapboxgl.Marker()
      .setLngLat([
        property.location.coordinates.longitude,
        property.location.coordinates.latitude,
      ])
      .addTo(map);

    const markerElement = marker.getElement();
    const path = markerElement.querySelector("path[fill='#3FB1CE']");
    if (path) path.setAttribute("fill", "#000000");

    return () => map.remove();
  }, [property, isError, isLoading]);

  if (isLoading) return <PropertyLocationSkeleton />;
  if (isError || !property) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t("common.notFound")}
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 md:py-16">
      <h3 className="text-xl sm:text-2xl font-semibold text-primary-800 dark:text-primary-100 mb-4">
        {t("property.mapAndLocation")}
      </h3>

      {/* Desktop layout */}
      <div className="hidden sm:flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex items-center text-gray-600 text-sm md:text-base">
          <MapPin className="w-4 h-4 mr-2 text-gray-700 flex-shrink-0" />
          <span className="font-medium">{t("property.propertyAddress")}:</span>
          <span className="ml-2 font-semibold text-gray-900">
            {property.location?.address || t("property.addressNotAvailable")}
          </span>
        </div>
        <a
          href={`https://maps.google.com/?q=${property.location.coordinates.latitude},${property.location.coordinates.longitude}&z=16`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors group text-sm md:text-base"
        >
          <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          {t("property.getDirections")}
        </a>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden space-y-3 mb-4">
        <div className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
          <MapPin className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-600 mb-1">
              {t("property.propertyAddress")}
            </p>
            <p className="font-semibold text-gray-900">
              {property.location?.address ||
                property.location?.city ||
                t("property.addressNotAvailable")}
            </p>
          </div>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            property.location?.address || "",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors active:scale-95 transform"
        >
          <Compass className="w-5 h-5" />
          {t("property.getDirections")}
        </a>
      </div>

      {/* Map Container */}
      <div
        className="relative h-[250px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-200 group"
        ref={mapContainerRef}
      >
        {/* Optional overlay for better UX */}
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-xl" />
      </div>

      {/* Mobile helper text */}
      <p className="sm:hidden text-xs text-gray-500 mt-3 text-center">
        {t("property.useTwoFingers")}
      </p>
    </div>
  );
};

export default PropertyLocation;
