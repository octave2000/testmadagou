import {
  FiltersState,
  initialState,
  setFilters,
  toggleFiltersFullOpen,
} from "@/state";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { cleanParams, cn } from "@/lib/utils";
import { convertCurrencyAmount, formatCurrencyAmount } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  AmenityIcons,
  ListingLabelEnum,
  PropertyTypeIcons,
} from "@/lib/constants";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/i18n-client";
import { translateEnum } from "@/lib/i18n";

const FiltersFull = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const [localFilters, setLocalFilters] = useState(initialState.filters);
  const { t } = useTranslations();
  const getListingLabelText = (label: ListingLabelEnum) =>
    label === ListingLabelEnum.Sell
      ? t("header.buy")
      : translateEnum("listingLabels", label);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen,
  );
  const currency = useAppSelector((state) => state.global.currency);
  const maxPriceXaf = convertCurrencyAmount(
    localFilters.listingLabel === "night"
      ? 500
      : localFilters.listingLabel === "sell"
        ? 700000
        : 10000,
    "USD",
    "XAF",
  );
  const stepXaf = convertCurrencyAmount(
    localFilters.listingLabel === "night"
      ? 5
      : localFilters.listingLabel === "sell"
        ? 5000
        : 100,
    "USD",
    "XAF",
  );
  const priceRangeLabel =
    localFilters.listingLabel === "night"
      ? t("filters.priceRangeNightly")
      : localFilters.listingLabel === "sell"
        ? t("filters.priceRangeSale")
        : t("filters.priceRangeMonthly");

  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString(),
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  });

  const handleSubmit = () => {
    dispatch(setFilters(localFilters));
    updateURL(localFilters);
    dispatch(toggleFiltersFullOpen());
  };

  const handleReset = () => {
    setLocalFilters(initialState.filters);
    dispatch(setFilters(initialState.filters));
    updateURL(initialState.filters);
    dispatch(toggleFiltersFullOpen());
  };

  const handleAmenityChange = (amenity: AmenityEnum) => {
    setLocalFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          localFilters.location,
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`,
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setLocalFilters((prev) => ({
          ...prev,
          coordinates: [lng, lat],
        }));
      }
    } catch (err) {
      console.error("Error search location:", err);
    }
  };

  useEffect(() => {
    if (!isFiltersFullOpen) return;
    setLocalFilters(filters);
  }, [filters, isFiltersFullOpen]);

  if (!isFiltersFullOpen) return null;

  return (
    <div className="bg-white rounded-lg px-4 h-full overflow-auto pb-10">
      <div className="flex flex-col space-y-6">
        {/* Location */}
        <div>
          <h4 className="font-bold mb-2">{t("filters.location")}</h4>
          <div className="flex items-center">
            <Input
              placeholder={t("filters.enterLocation")}
              value={localFilters.location}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="rounded-l-xl rounded-r-none border-r-0"
            />
            <Button
              onClick={handleLocationSearch}
              className="rounded-r-xl rounded-l-none border-l-none border-black shadow-none border hover:bg-primary-700 hover:text-primary-50"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h4 className="font-bold mb-2">{t("filters.propertyType")}</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <div
                key={type}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer",
                  localFilters.propertyType === type
                    ? "border-black"
                    : "border-gray-200",
                )}
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    propertyType: type as PropertyTypeEnum,
                  }))
                }
              >
                <Icon className="w-6 h-6 mb-2" />
                <span>{translateEnum("propertyTypes", type)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Listing Label */}
        <div>
          <h4 className="font-bold mb-2">{t("filters.listingLabel")}</h4>
          <Select
            value={localFilters.listingLabel || "any"}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({ ...prev, listingLabel: value }))
            }
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder={t("filters.listingLabel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t("filters.anyListingLabel")}</SelectItem>
              {Object.values(ListingLabelEnum).map((label) => (
                <SelectItem key={label} value={label.toLowerCase()}>
                  {getListingLabelText(label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-bold mb-2">{priceRangeLabel}</h4>
          <Slider
            min={0}
            max={maxPriceXaf}
            step={stepXaf}
            value={[
              localFilters.priceRange[0] ?? 0,
              localFilters.priceRange[1] ?? maxPriceXaf,
            ]}
            onValueChange={(value: any) =>
              setLocalFilters((prev) => ({
                ...prev,
                priceRange: value as [number, number],
              }))
            }
          />
          <div className="flex justify-between mt-2">
            <span>
              {formatCurrencyAmount(localFilters.priceRange[0] ?? 0, currency)}
            </span>
            <span>
              {formatCurrencyAmount(
                localFilters.priceRange[1] ?? maxPriceXaf,
                currency,
              )}
            </span>
          </div>
        </div>

        {/* Beds and Baths */}
        <div className="flex gap-4">
          <div className="flex-1">
          <h4 className="font-bold mb-2">{t("filters.beds")}</h4>
          <Select
            value={localFilters.beds || "any"}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({ ...prev, beds: value }))
            }
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder={t("filters.beds")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t("filters.anyBedsLower")}</SelectItem>
              <SelectItem value="1">1+ {t("filters.beds")}</SelectItem>
              <SelectItem value="2">2+ {t("filters.beds")}</SelectItem>
              <SelectItem value="3">3+ {t("filters.beds")}</SelectItem>
              <SelectItem value="4">4+ {t("filters.beds")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <h4 className="font-bold mb-2">{t("filters.baths")}</h4>
          <Select
            value={localFilters.baths || "any"}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({ ...prev, baths: value }))
            }
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder={t("filters.baths")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t("filters.anyBathsLower")}</SelectItem>
              <SelectItem value="1">1+ {t("filters.baths")}</SelectItem>
              <SelectItem value="2">2+ {t("filters.baths")}</SelectItem>
              <SelectItem value="3">3+ {t("filters.baths")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

        {/* Square Feet */}
        <div>
          <h4 className="font-bold mb-2">{t("filters.squareFeet")}</h4>
          <Slider
            min={0}
            max={5000}
            step={100}
            value={[
              localFilters.squareFeet[0] ?? 0,
              localFilters.squareFeet[1] ?? 5000,
            ]}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                squareFeet: value as [number, number],
              }))
            }
            className="[&>.bar]:bg-primary-700"
          />
          <div className="flex justify-between mt-2">
            <span>
              {localFilters.squareFeet[0] ?? 0} {t("property.sqFt")}
            </span>
            <span>
              {localFilters.squareFeet[1] ?? 5000} {t("property.sqFt")}
            </span>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="font-bold mb-2">{t("filters.amenities")}</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
              <div
                key={amenity}
                className={cn(
                  "flex items-center space-x-2 p-2 border rounded-lg hover:cursor-pointer",
                  localFilters.amenities.includes(amenity as AmenityEnum)
                    ? "border-black"
                    : "border-gray-200",
                )}
                onClick={() => handleAmenityChange(amenity as AmenityEnum)}
              >
                <Icon className="w-5 h-5 hover:cursor-pointer" />
                <Label className="hover:cursor-pointer">
                  {translateEnum("amenities", amenity)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Available From */}
        <div>
          <h4 className="font-bold mb-2">{t("filters.availableFrom")}</h4>
          <Input
            type="date"
            value={
              localFilters.availableFrom !== "any"
                ? localFilters.availableFrom
                : ""
            }
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                availableFrom: e.target.value ? e.target.value : "any",
              }))
            }
            className="rounded-xl"
          />
        </div>

        {/* Apply and Reset buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary-700 text-white rounded-xl"
          >
            {t("filters.apply")}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            {t("common.resetFilters")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersFull;
