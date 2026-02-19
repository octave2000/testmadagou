"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import FiltersBar from "./FiltersBar";
import FiltersFull from "./FiltersFull";
import { cleanParams } from "@/lib/utils";
import { setFilters, toggleFiltersFullOpen, toggleMapOpen } from "@/state";
import SearchMap from "./Map";
import Listings from "./Listings";
import { useTranslations } from "@/lib/i18n-client";

export const SearchClient = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen,
  );

  const isMapOpen = useAppSelector((state) => state.global.isMapOpen);
  const page = 1;
  const { t } = useTranslations();
  console.log("map", isMapOpen);
  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else {
          acc[key] = value === "any" ? null : value;
        }

        return acc;
      },
      {},
    );

    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        className="hidden md:flex w-full mx-auto px-5 mt-10  flex-col"
        style={{
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        <FiltersBar />
        <div className="flex justify-between flex-1 overflow-hidden gap-3 mb-5">
          <div
            className={`h-full overflow-auto transition-all duration-300 ease-in-out ${
              isFiltersFullOpen
                ? "w-3/12 opacity-100 visible"
                : "w-0 opacity-0 invisible"
            }`}
          >
            <FiltersFull />
          </div>

          <SearchMap page={page} />

          <div className="basis-1/4 overflow-y-auto">
            <Listings page={page} />
          </div>
        </div>
      </div>

      {/* MOBILE ONLY */}
      <div className="md:hidden w-full h-[calc(100vh_-_var(--navbar-height))] flex flex-col">
        {/* TOP TOGGLES */}
        <div className="flex gap-2 px-4 py-3 border-b">
          {/* Filters toggle */}
          <button
            onClick={() => dispatch(toggleFiltersFullOpen())}
            className="flex-1 rounded-lg border py-2 text-sm font-medium"
          >
            {t("filters.filters")}
          </button>

          {/* Map toggle */}
          <button
            onClick={() => dispatch(toggleMapOpen())}
            className="flex-1 rounded-lg border py-2 text-sm font-medium"
          >
            {t("filters.map")}
          </button>
        </div>

        {/* FILTERS (FULL SCREEN / SLIDE) */}
        {isFiltersFullOpen && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <FiltersFull />
          </div>
        )}

        {/* MAP (ACCORDION STYLE) */}
        {/* MAP (ACCORDION STYLE) */}

        {isMapOpen && (
          <div className="w-full h-96 md:hidden">
            <SearchMap isVisible={isMapOpen} page={page} />
          </div>
        )}

        {/* LISTINGS (ALWAYS VISIBLE) */}
        <div className="flex-1 overflow-y-auto px-4">
          <Listings page={page} />
        </div>
      </div>
    </>
  );
};

export default SearchClient;
