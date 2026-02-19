import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const parsePositiveInteger = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    let whereClause = {};
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const shouldPaginate =
      req.query.page !== undefined || req.query.limit !== undefined;
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
    const skip = (safePage - 1) * safeLimit;

    if (userId && userType) {
      if (userType === "tenant") {
        whereClause = { tenantCognitoId: String(userId) };
      } else if (userType === "manager") {
        whereClause = {
          property: {
            managerCognitoId: String(userId),
          },
        };
      }
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        orderBy: { applicationDate: "desc" },
        include: {
          property: {
            include: {
              location: true,
              manager: true,
            },
          },
          tenant: true,
        },
        ...(shouldPaginate ? { skip, take: safeLimit } : {}),
      }),
      shouldPaginate
        ? prisma.application.count({ where: whereClause })
        : Promise.resolve(0),
    ]);

    const formattedApplications = applications.map((app) => ({
      ...app,
      property: {
        ...app.property,
        address: app.property.location.address,
      },
      manager: app.property.manager,
    }));

    if (shouldPaginate) {
      res.json({
        data: formattedApplications,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: total ? Math.ceil(total / safeLimit) : 0,
        },
      });
      return;
    }

    res.json(formattedApplications);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving applications: ${error.message}` });
  }
};

export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      applicationDate,
      propertyId,
      tenantCognitoId,
      stayDays,
      name,
      email,
      phoneNumber,
      message,
    } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        listingLabel: true,
        pricePerMonth: true,
        pricePerNight: true,
        priceTotal: true,
      },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    if (
      property.pricePerMonth === null &&
      property.pricePerNight === null &&
      property.priceTotal === null
    ) {
      res.status(400).json({ message: "Property has no listed price" });
      return;
    }

    if (property.listingLabel === "Night" && property.pricePerNight === null) {
      res.status(400).json({
        message: "Night listing is missing pricePerNight",
      });
      return;
    }

    if (property.listingLabel === "Monthly" && property.pricePerMonth === null) {
      res.status(400).json({
        message: "Monthly listing is missing pricePerMonth",
      });
      return;
    }

    if (property.listingLabel === "Sell" && property.priceTotal === null) {
      res.status(400).json({
        message: "Sell listing is missing priceTotal",
      });
      return;
    }

    const parsedStayDays = parsePositiveInteger(stayDays);

    if (property.listingLabel === "Night" && parsedStayDays === null) {
      res.status(400).json({
        message:
          "stayDays is required and must be a positive integer for nightly properties",
      });
      return;
    }

    const newApplication = await prisma.application.create({
      data: {
        applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
        status: "Pending",
        stayDays: property.listingLabel === "Night" ? parsedStayDays : null,
        name,
        email,
        phoneNumber,
        message,
        property: {
          connect: { id: propertyId },
        },
        tenant: {
          connect: { cognitoId: tenantCognitoId },
        },
      },
      include: {
        property: true,
        tenant: true,
      },
    });

    res.status(201).json(newApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating application: ${error.message}` });
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log("status:", status);

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
      },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    if (status === "Approved") {
      const startDate = new Date();
      let endDate: Date;
      let rent: number;

      if (application.property.listingLabel === "Night") {
        if (application.property.pricePerNight === null) {
          res.status(400).json({
            message: "Property is missing pricePerNight",
          });
          return;
        }

        const parsedStayDays = parsePositiveInteger(application.stayDays);
        if (parsedStayDays === null) {
          res.status(400).json({
            message:
              "Application is missing stayDays for a nightly-priced property",
          });
          return;
        }

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parsedStayDays);
        rent = application.property.pricePerNight * parsedStayDays;
      } else if (application.property.listingLabel === "Monthly") {
        if (application.property.pricePerMonth === null) {
          res.status(400).json({
            message: "Property is missing pricePerMonth",
          });
          return;
        }

        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        rent = application.property.pricePerMonth;
      } else {
        res.status(400).json({ message: "Property is not for rent" });
        return;
      }

      const newLease = await prisma.lease.create({
        data: {
          startDate,
          endDate,
          rent,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        },
      });

      // Update the property to connect the tenant
      await prisma.property.update({
        where: { id: application.propertyId },
        data: {
          tenants: {
            connect: { cognitoId: application.tenantCognitoId },
          },
        },
      });

      // Update the application with the new lease ID
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status, leaseId: newLease.id },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      });
    } else {
      // Update the application status (for both "Denied" and other statuses)
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status },
      });
    }

    // Respond with the updated application details
    const updatedApplication = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
        lease: true,
      },
    });

    res.json(updatedApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating application status: ${error.message}` });
  }
};
