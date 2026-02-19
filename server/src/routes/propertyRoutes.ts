import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
  featureProperty,
  denyPropertyWithReason,
  superFeatureProperty,
  setPropertyAvailability,
} from "../controllers/propertyControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty,
);
router.patch(
  "/:id",
  authMiddleware(["manager"]),
  upload.array("photos"),
  updateProperty,
);
router.delete("/:id", authMiddleware(["manager"]), deleteProperty);
router.patch("/:id/approve", approveProperty);
router.patch("/:id/feature", featureProperty);
router.patch("/:id/deny", denyPropertyWithReason);
router.post("/:id/super-feature", superFeatureProperty);
router.patch("/:id/availability", setPropertyAvailability);
export default router;
