import express from "express";
import { getGeoCode } from "../controllers/location.controller.js";

const router = express.Router();

router.get("/geocode", getGeoCode);
export default router;
