import express from "express";
import {
  getManager,
  createManager,
  updateManager,
  getManagerProperties,
  listManagersSummary,
} from "../controllers/managerControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:cognitoId", authMiddleware(["manager"]), getManager);
router.put("/:cognitoId", authMiddleware(["manager"]), updateManager);
router.get(
  "/:cognitoId/properties",
  authMiddleware(["manager"]),
  getManagerProperties,
);
router.get("/", listManagersSummary);
router.post("/", createManager);

export default router;
