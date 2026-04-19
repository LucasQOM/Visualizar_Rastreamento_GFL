import express from "express";
import { track } from "../controllers/trackController.js";
import { track as trackAzul } from "../controllers/trackAzulController.js";
import { track as trackBraspress } from "../controllers/trackBraspressController.js";

const router = express.Router();

router.post("/track", (req, res) => track(req, res));
router.post("/trackAzul", (req, res) => trackAzul(req, res));
router.post("/trackBraspress", (req, res) => trackBraspress(req, res));

export default router;
