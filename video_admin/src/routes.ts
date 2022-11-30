import { Router } from "express";
import Instrumentation from "./instrumentation";
import logger from "./logger";
const appRoutes = Router();

appRoutes.post("/courses", (req, res) => {
  const course = {};
  return res.status(201).json(course);
});

appRoutes.get("/courses", async (req, res) => {

  // logger.info("Request received");
  // const tracing = Instrumentation.provider.getTracer("video_admin");


  const course = {};
  return res.status(200).json(course)
});

export default appRoutes;