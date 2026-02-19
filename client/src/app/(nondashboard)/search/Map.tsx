"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesPaginatedQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";
import { useDispatch } from "react-redux";
import { setFilters } from "@/state";
import { useTranslations } from "@/lib/i18n-client";
import { t as translate } from "@/lib/i18n";
import { DEFAULT_PROPERTY_PAGE_SIZE } from "@/lib/constants";
import { CurrencyCode, formatCurrencyAmount } from "@/lib/currency";
import {
  getPriceUnitTranslationKey,
  getPrimaryPriceAmount,
} from "@/lib/property-pricing";
import { PropertyWithStatus } from "@/types/api";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

type SearchMapProps = {
  isVisible?: boolean;
  page: number;
};

const SearchMap = ({ isVisible, page }: SearchMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const filters = useAppSelector((state) => state.global.filters);
  const currency = useAppSelector((state) => state.global.currency);
  const filtersRef = useRef(filters);
  const [isMapReady, setIsMapReady] = useState(false);
  const approvedFilters = { ...filters, isApproved: true };
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen,
  );
  const {
    data: propertiesResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetPropertiesPaginatedQuery({
    ...approvedFilters,
    page,
    limit: DEFAULT_PROPERTY_PAGE_SIZE,
  });
  const properties = propertiesResponse?.data ?? [];
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    if (!mapRef.current || !isVisible) return;
    requestAnimationFrame(() => {
      mapRef.current?.resize();
    });
  }, [isVisible]);

  // Resize map when filters panel opens/closes
  useEffect(() => {
    if (!mapRef.current) return;
    const timer = setTimeout(() => {
      mapRef.current?.resize();
    }, 300); // Match the transition duration
    return () => clearTimeout(timer);
  }, [isFiltersFullOpen]);

  useEffect(() => {
    if (mapRef.current) return;
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/octave100/cmj2ee2lk001i01qt0njbgx4h",
      center: filters.coordinates || [-74.5, 40],
      zoom: 9,
    });

    const map = mapRef.current;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const target = e.originalEvent?.target as HTMLElement | null;
      if (target?.closest(".mapboxgl-marker, .mapboxgl-popup")) return;

      const features = mapRef.current?.queryRenderedFeatures(e.point);
      if (features?.length) return;

      const { lng, lat } = e.lngLat;
      dispatch(
        setFilters({
          ...filtersRef.current,
          coordinates: [lng, lat],
        }),
      );

      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 9,
      });
    };

    const handleMapLoad = () => {
      setIsMapReady(true);
      requestAnimationFrame(() => {
        map.resize();
      });
    };

    map.on("click", handleMapClick);
    map.on("load", handleMapLoad);

    return () => {
      map.off("click", handleMapClick);
      map.off("load", handleMapLoad);
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (
      !mapRef.current ||
      !isMapReady ||
      isLoading ||
      isError ||
      !propertiesResponse
    )
      return;

    const markers: mapboxgl.Marker[] = [];
    const groupByCoordinate = new Map<string, Property[]>();

    properties.forEach((property) => {
      const { longitude, latitude } = property.location.coordinates;
      const key = `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
      const group = groupByCoordinate.get(key) ?? [];
      group.push(property);
      groupByCoordinate.set(key, group);
    });

    const offsetMetaById = new Map<string, { index: number; total: number }>();
    groupByCoordinate.forEach((group) => {
      const sortedGroup = [...group].sort((a, b) =>
        String(a.id).localeCompare(String(b.id)),
      );
      const total = sortedGroup.length;
      sortedGroup.forEach((property, index) => {
        offsetMetaById.set(String(property.id), { index, total });
      });
    });

    properties.forEach((property) => {
      const meta = offsetMetaById.get(String(property.id));
      const markerOffset = getMarkerOffset(meta?.index ?? 0, meta?.total ?? 1);
      const marker = createPropertyMarker(
        property,
        mapRef.current!,
        markerOffset,
        currency,
      );
      markers.push(marker);
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [
    properties,
    isLoading,
    isError,
    isMapReady,
    propertiesResponse,
    currency,
  ]);

  useEffect(() => {
    if (!mapRef.current || !filters.coordinates) return;
    mapRef.current.flyTo({
      center: filters.coordinates,
      zoom: 9,
    });
  }, [filters.coordinates]);

  return (
    <div className="basis-5/12 grow relative rounded-xl w-full h-full">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "100%", // Ensures it takes full height
        }}
      />
      {(isLoading || isFetching) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
          {t("common.loading")}
        </div>
      )}
      {(isError || !propertiesResponse) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 text-center">
          {t("toasts.fetchPropertiesFailed")}
        </div>
      )}
    </div>
  );
};

const MAX_MARKERS_PER_RING = 8;
const BASE_OFFSET_RADIUS_PX = 18;
const OFFSET_RADIUS_STEP_PX = 12;

const getMarkerOffset = (index: number, total: number): [number, number] => {
  if (total <= 1) return [0, 0];

  const ring = Math.floor(index / MAX_MARKERS_PER_RING);
  const indexInRing = index % MAX_MARKERS_PER_RING;
  const remaining = total - ring * MAX_MARKERS_PER_RING;
  const positionsInRing = Math.min(remaining, MAX_MARKERS_PER_RING);
  const angle = (2 * Math.PI * indexInRing) / positionsInRing;
  const radius = BASE_OFFSET_RADIUS_PX + ring * OFFSET_RADIUS_STEP_PX;

  return [
    Math.round(radius * Math.cos(angle)),
    Math.round(radius * Math.sin(angle)),
  ];
};

const createPropertyMarker = (
  property: Property,
  map: mapboxgl.Map,
  offset: [number, number],
  currency: CurrencyCode,
) => {
  const propertyStatus = property as PropertyWithStatus;
  const priceAmount = getPrimaryPriceAmount(propertyStatus);
  const priceLabel = formatCurrencyAmount(priceAmount, currency);
  const priceUnitKey = getPriceUnitTranslationKey(propertyStatus);
  const priceUnitLabel = priceUnitKey
    ? priceUnitKey === "property.forSale"
      ? translate("header.buy")
      : translate(priceUnitKey)
    : "";
  const marker = new mapboxgl.Marker()
    .setOffset(offset)
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude,
    ])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              ${priceLabel}
              <span class="marker-popup-price-unit">${priceUnitLabel}</span>
            </p>
          </div>
        </div>
        `,
      ),
    )
    .addTo(map);

  return marker;
};

export default SearchMap;
