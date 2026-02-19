import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

const parsePositiveInt = (value: unknown): number | null => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.floor(parsed);
};

const parsePagination = (req: Request) => {
  const shouldPaginate =
    req.query.page !== undefined || req.query.limit !== undefined;
  const page = parsePositiveInt(req.query.page) ?? 1;
  const limit = parsePositiveInt(req.query.limit) ?? 20;
  const skip = (page - 1) * limit;

  return { shouldPaginate, page, limit, skip };
};

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tenant: ${error.message}` });
  }
};

export const createTenant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const tenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating tenant: ${error.message}` });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const { name, email, phoneNumber } = req.body;

    const updateTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateTenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating tenant: ${error.message}` });
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const { shouldPaginate, page, limit, skip } = parsePagination(req);
    const where = { tenants: { some: { cognitoId } } };
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          location: true,
        },
        ...(shouldPaginate ? { skip, take: limit } : {}),
      }),
      shouldPaginate ? prisma.property.count({ where }) : Promise.resolve(0),
    ]);

    const residencesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      }),
    );

    if (shouldPaginate) {
      res.json({
        data: residencesWithFormattedLocation,
        pagination: {
          page,
          limit,
          total,
          totalPages: total ? Math.ceil(total / limit) : 0,
        },
      });
      return;
    }

    res.json(residencesWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const { propertyId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorites = tenant.favorites || [];

    if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: { favorites: true },
      });
      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already added as favorite" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error adding favorite property: ${error.message}` });
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const { propertyId } = req.params;
    const propertyIdNumber = Number(propertyId);

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error removing favorite property: ${err.message}` });
  }
};
