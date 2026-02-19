import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrencyCode } from "@/lib/currency";

export interface FiltersState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  listingLabel: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
  isFeatured?: boolean;
  isApproved?: boolean;
}

interface InitialStateTypes {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  isMapOpen: boolean;
  viewMode: "grid" | "list";
  currency: CurrencyCode;
}

export const initialState: InitialStateTypes = {
  filters: {
    location: "any",
    beds: "any",
    baths: "any",
    propertyType: "any",
    listingLabel: "any",
    amenities: [],
    availableFrom: "any",
    priceRange: [null, null],
    squareFeet: [null, null],
    coordinates: [11.52, 3.87],
  },
  isFiltersFullOpen: false,
  isMapOpen: false,
  viewMode: "grid",
  currency: "XAF",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    toggleMapOpen: (state) => {
      state.isMapOpen = !state.isMapOpen;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currency = action.payload;
    },
  },
});

export const {
  setFilters,
  toggleFiltersFullOpen,
  setViewMode,
  toggleMapOpen,
  setCurrency,
} = globalSlice.actions;

export default globalSlice.reducer;
