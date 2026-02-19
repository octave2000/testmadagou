import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
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

export const getManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ message: "Manager not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager: ${error.message}` });
  }
};

export const createManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating manager: ${error.message}` });
  }
};

export const updateManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const { name, email, phoneNumber } = req.body;

    const updateManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateManager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating manager: ${error.message}` });
  }
};

export const getManagerProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cognitoId =
      typeof req.params.cognitoId === "string"
        ? req.params.cognitoId
        : undefined;
    const { shouldPaginate, page, limit, skip } = parsePagination(req);
    const where = { managerCognitoId: cognitoId };
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

    const propertiesWithFormattedLocation = await Promise.all(
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
        data: propertiesWithFormattedLocation,
        pagination: {
          page,
          limit,
          total,
          totalPages: total ? Math.ceil(total / limit) : 0,
        },
      });
      return;
    }

    res.json(propertiesWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};

export const listManagersSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { shouldPaginate, page, limit, skip } = parsePagination(req);
    const paginationSql = shouldPaginate
      ? Prisma.sql`LIMIT ${limit} OFFSET ${skip}`
      : Prisma.sql``;
    const [managers, totalResult] = await Promise.all([
      prisma.$queryRaw`
      SELECT
        m.id,
        m."cognitoId",
        m.name,
        m.email,
        m."phoneNumber",
        COUNT(DISTINCT p.id)::int AS "propertyCount",
        COUNT(a.id)::int AS "applicationCount"
      FROM "Manager" m
      LEFT JOIN "Property" p ON p."managerCognitoId" = m."cognitoId"
      LEFT JOIN "Application" a ON a."propertyId" = p.id
      GROUP BY m.id
      ORDER BY m.id DESC
      ${paginationSql}
    `,
      shouldPaginate
        ? prisma.$queryRaw`
      SELECT COUNT(*)::int AS "total" FROM "Manager"
    `
        : Promise.resolve([{ total: 0 }]),
    ]);

    if (shouldPaginate) {
      const total = (totalResult as Array<{ total: number }>)[0]?.total ?? 0;
      res.json({
        data: managers,
        pagination: {
          page,
          limit,
          total,
          totalPages: total ? Math.ceil(total / limit) : 0,
        },
      });
      return;
    }

    res.json(managers);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving managers summary: ${error.message}`,
    });
  }
};
