import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
const prisma = new PrismaClient();

type ListingLabelValue = "Monthly" | "Night" | "Sell";

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const MINIO_INTERNAL_BASE_URL =
  process.env.MINIO_INTERNAL_BASE_URL ||
  process.env.AWS_ENDPOINT ||
  "http://192.168.208.3:9000";

const MINIO_PUBLIC_BASE_URL =
  process.env.MINIO_PUBLIC_BASE_URL ||
  "https://amazing-vaughan-b73k91.eu1.hubfly.app";

const rewriteMinioUrl = (url: string): string => {
  const normalizedInternalBaseUrl = MINIO_INTERNAL_BASE_URL.replace(/\/+$/, "");
  const normalizedPublicBaseUrl = MINIO_PUBLIC_BASE_URL.replace(/\/+$/, "");

  if (
    !normalizedInternalBaseUrl ||
    !normalizedPublicBaseUrl ||
    !url.startsWith(normalizedInternalBaseUrl)
  ) {
    return url;
  }

  return `${normalizedPublicBaseUrl}${url.slice(normalizedInternalBaseUrl.length)}`;
};

const parsePositiveInt = (value: unknown): number | null => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.floor(parsed);
};

const parseNonNegativeInt = (value: unknown): number | null => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
};

const applyMainImageIndex = (
  photoUrls: string[],
  mainImageIndexInput: unknown,
): { photoUrls: string[]; error: string | null } => {
  const rawValue = Array.isArray(mainImageIndexInput)
    ? mainImageIndexInput[0]
    : mainImageIndexInput;

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return { photoUrls, error: null };
  }

  const parsedIndex = parseNonNegativeInt(rawValue);
  if (parsedIndex === null) {
    return {
      photoUrls,
      error: "mainImageIndex must be a non-negative integer",
    };
  }

  if (photoUrls.length === 0) {
    return {
      photoUrls,
      error: "Cannot set mainImageIndex when no photos are provided",
    };
  }

  if (parsedIndex >= photoUrls.length) {
    return {
      photoUrls,
      error: `mainImageIndex must be between 0 and ${photoUrls.length - 1}`,
    };
  }

  if (parsedIndex === 0) {
    return { photoUrls, error: null };
  }

  const reorderedPhotoUrls = [...photoUrls];
  const mainImageUrl = reorderedPhotoUrls[parsedIndex];
  reorderedPhotoUrls.splice(parsedIndex, 1);
  reorderedPhotoUrls.unshift(mainImageUrl);

  return { photoUrls: reorderedPhotoUrls, error: null };
};

const parsePagination = (req: Request) => {
  const shouldPaginate =
    req.query.page !== undefined || req.query.limit !== undefined;
  const page = parsePositiveInt(req.query.page) ?? 1;
  const limit = parsePositiveInt(req.query.limit) ?? 20;
  const offset = (page - 1) * limit;

  return { shouldPaginate, page, limit, offset };
};

const parseNullableNumber = (value: unknown): number | null => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseStringArrayInput = (value: unknown): string[] => {
  if (value === undefined || value === null) {
    return [];
  }

  const inputValues = Array.isArray(value) ? value : [value];

  return inputValues
    .flatMap((entry) => {
      if (typeof entry === "string") {
        return entry.split(",");
      }
      return [];
    })
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const normalizeListingLabel = (value: unknown): ListingLabelValue | null => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (typeof rawValue !== "string") {
    return null;
  }

  const normalized = rawValue.trim().toLowerCase();
  if (
    normalized === "monthly" ||
    normalized === "monthl" ||
    normalized === "month" ||
    normalized === "permonth" ||
    normalized === "per_month"
  ) {
    return "Monthly";
  }

  if (
    normalized === "night" ||
    normalized === "nightly" ||
    normalized === "pernight" ||
    normalized === "per_night"
  ) {
    return "Night";
  }

  if (
    normalized === "sell" ||
    normalized === "sale" ||
    normalized === "forsale" ||
    normalized === "for_sale"
  ) {
    return "Sell";
  }

  return null;
};

const isAnyFilter = (value: unknown): boolean => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return (
    typeof rawValue === "string" && rawValue.trim().toLowerCase() === "any"
  );
};

const inferListingLabel = (pricing: {
  pricePerMonth: number | null;
  pricePerNight: number | null;
  priceTotal: number | null;
}): ListingLabelValue | null => {
  if (pricing.pricePerNight !== null) {
    return "Night";
  }
  if (pricing.pricePerMonth !== null) {
    return "Monthly";
  }
  if (pricing.priceTotal !== null) {
    return "Sell";
  }
  return null;
};

const normalizePricingForListingLabel = (
  listingLabel: ListingLabelValue,
  pricing: {
    pricePerMonth: number | null;
    pricePerNight: number | null;
    priceTotal: number | null;
  },
): {
  pricePerMonth: number | null;
  pricePerNight: number | null;
  priceTotal: number | null;
  error: string | null;
} => {
  if (listingLabel === "Monthly") {
    if (pricing.pricePerMonth === null) {
      return {
        pricePerMonth: null,
        pricePerNight: null,
        priceTotal: null,
        error: "Monthly listings require pricePerMonth",
      };
    }

    return {
      pricePerMonth: pricing.pricePerMonth,
      pricePerNight: null,
      priceTotal: null,
      error: null,
    };
  }

  if (listingLabel === "Night") {
    if (pricing.pricePerNight === null) {
      return {
        pricePerMonth: null,
        pricePerNight: null,
        priceTotal: null,
        error: "Night listings require pricePerNight",
      };
    }

    return {
      pricePerMonth: null,
      pricePerNight: pricing.pricePerNight,
      priceTotal: null,
      error: null,
    };
  }

  if (pricing.priceTotal === null) {
    return {
      pricePerMonth: null,
      pricePerNight: null,
      priceTotal: null,
      error: "Sell listings require priceTotal",
    };
  }

  return {
    pricePerMonth: null,
    pricePerNight: null,
    priceTotal: pricing.priceTotal,
    error: null,
  };
};

async function getGeocodeData(locationData: {
  latitude?: string | number | null;
  longitude?: string | number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}): Promise<{
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}> {
  // Make mutable copies
  let { latitude, longitude, address, city, state, country, postalCode } =
    locationData;

  let finalLatitude = 0;
  let finalLongitude = 0;

  if (latitude && longitude) {
    finalLatitude =
      typeof latitude === "string" ? parseFloat(latitude) : Number(latitude);
    finalLongitude =
      typeof longitude === "string" ? parseFloat(longitude) : Number(longitude);

    const reverseGeocodingUrl = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams(
      {
        lat: finalLatitude.toString(),
        lon: finalLongitude.toString(),
        format: "jsonv2",
        zoom: "18",
      },
    ).toString()}`;
    console.log(reverseGeocodingUrl);

    try {
      const reverseGeocodingResponse = await axios.get(reverseGeocodingUrl, {
        headers: {
          "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com)",
        },
      });

      const addressDetails = reverseGeocodingResponse.data?.address;
      if (addressDetails) {
        address =
          addressDetails.road || addressDetails.house_number
            ? `${addressDetails.house_number || ""} ${
                addressDetails.road || ""
              }`.trim()
            : null;
        city =
          addressDetails.city ||
          addressDetails.town ||
          addressDetails.village ||
          addressDetails.hamlet ||
          null;
        state = addressDetails.state || null;
        country = addressDetails.country || null;
        postalCode = addressDetails.postcode || null;
      }
    } catch (geoError) {
      console.error("Reverse geocoding failed:", geoError);
    }
  } else {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address ?? "",
        city: city ?? "",
        country: country ?? "",
        postalcode: postalCode ?? "",
        format: "json",
        limit: "1",
      },
    ).toString()}`;
    try {
      const geocodingResponse = await axios.get(geocodingUrl, {
        headers: {
          "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com)",
        },
      });
      if (geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat) {
        finalLongitude = parseFloat(geocodingResponse.data[0].lon);
        finalLatitude = parseFloat(geocodingResponse.data[0].lat);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  }

  return {
    latitude: finalLatitude,
    longitude: finalLongitude,
    address: address ?? null,
    city: city ?? null,
    state: state ?? null,
    country: country ?? null,
    postalCode: postalCode ?? null,
  };
}

export const getProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { shouldPaginate, page, limit, offset } = parsePagination(req);
    const {
      favoriteIds,
      priceMin,
      priceMax,
      buyPriceMin,
      buyPriceMax,
      nightPriceMin,
      nightPriceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
      listingLabel,
      label,
      isFeatured,
      isApproved,
      isDenied,
      isPending,
      isSuperFeatured,
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];
    if (isFeatured) {
      whereConditions.push(Prisma.sql`p."isFeatured" = ${Boolean(isFeatured)}`);
    }
    if (isApproved) {
      whereConditions.push(Prisma.sql`p."isApproved" = 'Approved'`);
    }
    if (isDenied) {
      whereConditions.push(Prisma.sql`p."isApproved" = 'Denied'`);
    }
    if (isPending) {
      whereConditions.push(Prisma.sql`p."isApproved" = 'Pending'`);
    }
    if (isSuperFeatured) {
      whereConditions.push(
        Prisma.sql`p."isSuperFeatured" = ${Boolean(isSuperFeatured)}`,
      );
    }
    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`,
      );
    }

    const listingLabelFilterValue = listingLabel ?? label;
    if (listingLabelFilterValue && !isAnyFilter(listingLabelFilterValue)) {
      const normalizedListingLabel = normalizeListingLabel(
        listingLabelFilterValue,
      );

      if (!normalizedListingLabel) {
        res.status(400).json({
          message: "Invalid listing label. Use one of: monthly, night, sell",
        });
        return;
      }

      whereConditions.push(
        Prisma.sql`p."listingLabel" = ${normalizedListingLabel}::"ListingLabel"`,
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`,
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`,
      );
    }

    if (buyPriceMin) {
      whereConditions.push(
        Prisma.sql`p."priceTotal" >= ${Number(buyPriceMin)}`,
      );
    }

    if (buyPriceMax) {
      whereConditions.push(
        Prisma.sql`p."priceTotal" <= ${Number(buyPriceMax)}`,
      );
    }

    if (nightPriceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerNight" >= ${Number(nightPriceMin)}`,
      );
    }

    if (nightPriceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerNight" <= ${Number(nightPriceMax)}`,
      );
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`,
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`,
      );
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`,
      );
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = parseStringArrayInput(amenities);
      if (amenitiesArray.length > 0) {
        whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
      }
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? availableFrom : null;
      if (availableFromDate) {
        const date = new Date(availableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l
              WHERE l."propertyId" = p.id
              AND l."startDate" <= ${date.toISOString()}
            )`,
          );
        }
      }
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInKilometers = 100;
      const degrees = radiusInKilometers / 111; // Converts kilometers to degrees

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`,
      );
    }

    const completeQuery = Prisma.sql`
      SELECT
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location,
        json_build_object(
          'id', m.id,
          'cognitoId', m."cognitoId",
          'name', m.name,
          'email', m.email,
          'phoneNumber', m."phoneNumber"
        ) as manager
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      JOIN "Manager" m ON p."managerCognitoId" = m."cognitoId"

      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
      ORDER BY p.id DESC
      ${
        shouldPaginate
          ? Prisma.sql`LIMIT ${limit} OFFSET ${offset}`
          : Prisma.empty
      }
    `;

    const properties = await prisma.$queryRaw(completeQuery);

    if (shouldPaginate) {
      const countQuery = Prisma.sql`
        SELECT COUNT(*)::int as total
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
        JOIN "Manager" m ON p."managerCognitoId" = m."cognitoId"
        ${
          whereConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
            : Prisma.empty
        }
      `;
      const countResult =
        await prisma.$queryRaw<{ total: number }[]>(countQuery);
      const total = countResult[0]?.total ?? 0;
      res.json({
        data: properties,
        pagination: {
          page,
          limit,
          total,
          totalPages: total ? Math.ceil(total / limit) : 0,
        },
      });
      return;
    }

    res.json(properties);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving properties: ${error.message}` });
  }
};

export const getProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
        manager: true,
      },
    });

    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      managerCognitoId,
      mainImageIndex: mainImageIndexInput,
      mainPhotoIndex: mainPhotoIndexInput,
      primaryImageIndex: primaryImageIndexInput,
      listingLabel: listingLabelInput,
      label: labelInput,
      ...propertyData
    } = req.body;

    const parsedPricePerMonth = parseNullableNumber(propertyData.pricePerMonth);
    const parsedPricePerNight = parseNullableNumber(propertyData.pricePerNight);
    const parsedPriceTotal = parseNullableNumber(propertyData.priceTotal);

    const rawListingLabelInput = listingLabelInput ?? labelInput;
    const explicitListingLabel =
      rawListingLabelInput !== undefined
        ? normalizeListingLabel(rawListingLabelInput)
        : null;

    if (rawListingLabelInput !== undefined && !explicitListingLabel) {
      res.status(400).json({
        message: "Invalid label. Use one of: monthly, night, sell",
      });
      return;
    }

    const listingLabel =
      explicitListingLabel ??
      inferListingLabel({
        pricePerMonth: parsedPricePerMonth,
        pricePerNight: parsedPricePerNight,
        priceTotal: parsedPriceTotal,
      });

    if (!listingLabel) {
      res.status(400).json({
        message:
          "Unable to determine listing label. Provide label/listingLabel or one pricing field",
      });
      return;
    }

    const normalizedPricing = normalizePricingForListingLabel(listingLabel, {
      pricePerMonth: parsedPricePerMonth,
      pricePerNight: parsedPricePerNight,
      priceTotal: parsedPriceTotal,
    });

    if (normalizedPricing.error) {
      res.status(400).json({ message: normalizedPricing.error });
      return;
    }

    const uploadedPhotoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        if (!uploadResult.Location) {
          throw new Error("S3 upload completed without a file URL");
        }

        return rewriteMinioUrl(uploadResult.Location);
      }),
    );

    const selectedMainImageIndexInput =
      mainImageIndexInput ?? mainPhotoIndexInput ?? primaryImageIndexInput;
    const reorderedPhotoUrlsResult = applyMainImageIndex(
      uploadedPhotoUrls,
      selectedMainImageIndexInput,
    );

    if (reorderedPhotoUrlsResult.error) {
      res.status(400).json({ message: reorderedPhotoUrlsResult.error });
      return;
    }

    const photoUrls = reorderedPhotoUrlsResult.photoUrls;

    const geocodeData = await getGeocodeData({
      latitude,
      longitude,
      address,
      city,
      state,
      country,
      postalCode,
    });

    // create location
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${geocodeData.address}, ${geocodeData.city}, ${geocodeData.state}, ${geocodeData.country}, ${geocodeData.postalCode}, ST_SetSRID(ST_MakePoint(${geocodeData.longitude}, ${geocodeData.latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    const parsedAmenities = parseStringArrayInput(propertyData.amenities);
    const parsedHighlights = parseStringArrayInput(propertyData.highlights);

    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities: parsedAmenities,
        highlights: parsedHighlights,
        isPetsAllowed:
          propertyData.isPetsAllowed === "true" ||
          propertyData.isPetsAllowed === true,
        isParkingIncluded:
          propertyData.isParkingIncluded === "true" ||
          propertyData.isParkingIncluded === true,
        listingLabel,
        pricePerMonth: normalizedPricing.pricePerMonth,
        pricePerNight: normalizedPricing.pricePerNight,
        priceTotal: normalizedPricing.priceTotal,
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        isApproved: "Pending",
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (err: any) {
    console.error(err.message);
    res
      .status(500)
      .json({ message: `Error creating property: ${err.message}` });
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      managerCognitoId,
      existingPhotos,
      mainImageIndex: mainImageIndexInput,
      mainPhotoIndex: mainPhotoIndexInput,
      primaryImageIndex: primaryImageIndexInput,
      listingLabel: listingLabelInput,
      label: labelInput,
      ...propertyData
    } = req.body;

    const files = req.files as Express.Multer.File[];

    const existingProperty = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: { location: true },
    });

    if (!existingProperty) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    // Handle Photos
    const newUploadedUrls = await Promise.all(
      (files || []).map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        if (!uploadResult.Location) {
          throw new Error("S3 upload completed without a file URL");
        }

        return rewriteMinioUrl(uploadResult.Location);
      }),
    );

    let finalPhotoUrls = existingProperty.photoUrls;

    if (existingPhotos !== undefined) {
      finalPhotoUrls = Array.isArray(existingPhotos)
        ? existingPhotos
        : typeof existingPhotos === "string"
          ? [existingPhotos]
          : [];
    }

    // Filter out empty strings if any found their way in
    finalPhotoUrls = [
      ...finalPhotoUrls
        .filter((url: string) => url.length > 0)
        .map((url: string) => rewriteMinioUrl(url)),
      ...newUploadedUrls,
    ];

    const selectedMainImageIndexInput =
      mainImageIndexInput ?? mainPhotoIndexInput ?? primaryImageIndexInput;
    const reorderedPhotoUrlsResult = applyMainImageIndex(
      finalPhotoUrls,
      selectedMainImageIndexInput,
    );

    if (reorderedPhotoUrlsResult.error) {
      res.status(400).json({ message: reorderedPhotoUrlsResult.error });
      return;
    }

    finalPhotoUrls = reorderedPhotoUrlsResult.photoUrls;

    // Handle Location Update
    const isLocationUpdate =
      address ||
      city ||
      state ||
      country ||
      postalCode ||
      latitude ||
      longitude;

    if (isLocationUpdate) {
      const geocodeData = await getGeocodeData({
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        address: address ?? existingProperty.location.address,
        city: city ?? existingProperty.location.city,
        state: state ?? existingProperty.location.state,
        country: country ?? existingProperty.location.country,
        postalCode: postalCode ?? existingProperty.location.postalCode,
      });

      const updatePayload: any = {
        address: geocodeData.address,
        city: geocodeData.city,
        state: geocodeData.state,
        country: geocodeData.country,
        postalCode: geocodeData.postalCode,
      };

      if (geocodeData.latitude !== 0 && geocodeData.longitude !== 0) {
        await prisma.$executeRaw`
          UPDATE "Location"
          SET address = ${geocodeData.address},
              city = ${geocodeData.city},
              state = ${geocodeData.state},
              country = ${geocodeData.country},
              "postalCode" = ${geocodeData.postalCode},
              coordinates = ST_SetSRID(ST_MakePoint(${geocodeData.longitude}, ${geocodeData.latitude}), 4326)
          WHERE id = ${existingProperty.locationId}
        `;
      } else {
        await prisma.location.update({
          where: { id: existingProperty.locationId },
          data: updatePayload,
        });
      }
    }

    // Update Property Fields
    const updateData: any = {
      photoUrls: finalPhotoUrls,
      managerCognitoId: managerCognitoId || existingProperty.managerCognitoId,
      isApproved: "Pending",
    };

    if (propertyData.name) updateData.name = propertyData.name;
    if (propertyData.description)
      updateData.description = propertyData.description;

    const hasPricingOrLabelUpdate =
      listingLabelInput !== undefined ||
      labelInput !== undefined ||
      propertyData.pricePerMonth !== undefined ||
      propertyData.pricePerNight !== undefined ||
      propertyData.priceTotal !== undefined;

    if (hasPricingOrLabelUpdate) {
      const rawListingLabelInput = listingLabelInput ?? labelInput;
      const explicitListingLabel =
        rawListingLabelInput !== undefined
          ? normalizeListingLabel(rawListingLabelInput)
          : null;

      if (rawListingLabelInput !== undefined && !explicitListingLabel) {
        res.status(400).json({
          message: "Invalid label. Use one of: monthly, night, sell",
        });
        return;
      }

      const resolvedPricePerMonth =
        propertyData.pricePerMonth !== undefined
          ? parseNullableNumber(propertyData.pricePerMonth)
          : existingProperty.pricePerMonth;

      const resolvedPricePerNight =
        propertyData.pricePerNight !== undefined
          ? parseNullableNumber(propertyData.pricePerNight)
          : existingProperty.pricePerNight;

      const resolvedPriceTotal =
        propertyData.priceTotal !== undefined
          ? parseNullableNumber(propertyData.priceTotal)
          : existingProperty.priceTotal;

      const listingLabel =
        explicitListingLabel ??
        inferListingLabel({
          pricePerMonth: resolvedPricePerMonth,
          pricePerNight: resolvedPricePerNight,
          priceTotal: resolvedPriceTotal,
        }) ??
        existingProperty.listingLabel;

      const normalizedPricing = normalizePricingForListingLabel(listingLabel, {
        pricePerMonth: resolvedPricePerMonth,
        pricePerNight: resolvedPricePerNight,
        priceTotal: resolvedPriceTotal,
      });

      if (normalizedPricing.error) {
        res.status(400).json({ message: normalizedPricing.error });
        return;
      }

      updateData.listingLabel = listingLabel;
      updateData.pricePerMonth = normalizedPricing.pricePerMonth;
      updateData.pricePerNight = normalizedPricing.pricePerNight;
      updateData.priceTotal = normalizedPricing.priceTotal;
    }

    if (propertyData.securityDeposit)
      updateData.securityDeposit = parseFloat(propertyData.securityDeposit);
    if (propertyData.applicationFee)
      updateData.applicationFee = parseFloat(propertyData.applicationFee);
    if (propertyData.beds) updateData.beds = parseInt(propertyData.beds);
    if (propertyData.baths) updateData.baths = parseFloat(propertyData.baths);
    if (propertyData.squareFeet)
      updateData.squareFeet = parseInt(propertyData.squareFeet);

    if (propertyData.propertyType)
      updateData.propertyType = propertyData.propertyType;

    if (propertyData.isPetsAllowed !== undefined) {
      updateData.isPetsAllowed =
        propertyData.isPetsAllowed === "true" ||
        propertyData.isPetsAllowed === true;
    }
    if (propertyData.isParkingIncluded !== undefined) {
      updateData.isParkingIncluded =
        propertyData.isParkingIncluded === "true" ||
        propertyData.isParkingIncluded === true;
    }

    if (propertyData.amenities !== undefined) {
      updateData.amenities = parseStringArrayInput(propertyData.amenities);
    }

    if (propertyData.highlights !== undefined) {
      updateData.highlights = parseStringArrayInput(propertyData.highlights);
    }

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        location: true,
        manager: true,
      },
    });

    res.json(updatedProperty);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error updating property: ${err.message}` });
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const propertyId = Number(id);

    if (!Number.isFinite(propertyId)) {
      res.status(400).json({ message: "Invalid property id" });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, locationId: true },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const leaseIds = await tx.lease.findMany({
        where: { propertyId },
        select: { id: true },
      });

      const leaseIdList = leaseIds.map((lease) => lease.id);

      if (leaseIdList.length > 0) {
        await tx.payment.deleteMany({
          where: { leaseId: { in: leaseIdList } },
        });
      }

      await tx.application.deleteMany({ where: { propertyId } });
      await tx.lease.deleteMany({ where: { propertyId } });
      await tx.property.delete({ where: { id: propertyId } });

      const remainingProperties = await tx.property.count({
        where: { locationId: property.locationId },
      });

      if (remainingProperties === 0) {
        await tx.location.delete({ where: { id: property.locationId } });
      }
    });

    res.status(204).send();
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error deleting property: ${err.message}` });
  }
};

export const approveProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: { isApproved: "Approved" },
    });

    res.json(updatedProperty);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error approving property: ${error.message}` });
  }
};

export const featureProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isFeatured = true, featuredUntil } = req.body;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const updateData: { isFeatured?: boolean; featuredUntil?: Date | null } =
      {};

    if (typeof isFeatured === "boolean") {
      updateData.isFeatured = isFeatured;
      if (!isFeatured) {
        updateData.featuredUntil = null;
      }
    }

    if (featuredUntil !== undefined) {
      const parsedFeaturedUntil = new Date(featuredUntil);
      if (Number.isNaN(parsedFeaturedUntil.getTime())) {
        res.status(400).json({ message: "Invalid featuredUntil date" });
        return;
      }
      updateData.featuredUntil = parsedFeaturedUntil;
      if (isFeatured !== false) {
        updateData.isFeatured = true;
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "Provide isFeatured or featuredUntil" });
      return;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updatedProperty);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error featuring property: ${error.message}` });
  }
};

export const denyPropertyWithReason = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: { isApproved: "Denied", deniedReason: reason },
    });

    res.json(updatedProperty);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error denying property: ${error.message}` });
  }
};
export const superFeatureProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isSuperFeatured = true, superFeaturedUntil } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const updateData: {
      isSuperFeatured?: boolean;
      superFeaturedUntil?: Date | null;
    } = {};

    if (typeof isSuperFeatured === "boolean") {
      updateData.isSuperFeatured = isSuperFeatured;
      if (!isSuperFeatured) {
        updateData.superFeaturedUntil = null;
      }
    }

    if (superFeaturedUntil !== undefined) {
      const parsedSuperFeaturedUntil = new Date(superFeaturedUntil);
      if (Number.isNaN(parsedSuperFeaturedUntil.getTime())) {
        res.status(400).json({ message: "Invalid superFeaturedUntil date" });
        return;
      }
      updateData.superFeaturedUntil = parsedSuperFeaturedUntil;
      if (isSuperFeatured !== false) {
        updateData.isSuperFeatured = true;
      }
    }

    if (Object.keys(updateData).length === 0) {
      res
        .status(400)
        .json({ message: "Provide isSuperFeatured or superFeaturedUntil" });
      return;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updatedProperty);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error super featuring property: ${error.message}` });
  }
};

export const setPropertyAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      res.status(400).json({ message: "Provide isAvailable as boolean" });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: Number(id) },
      data: { isAvailable },
    });

    res.json(updatedProperty);
  } catch (error: any) {
    res.status(500).json({
      message: `Error updating property availability: ${error.message}`,
    });
  }
};
