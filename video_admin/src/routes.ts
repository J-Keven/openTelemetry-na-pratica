import { Router } from "express";
import { diag } from '@opentelemetry/api';

const appRoutes = Router();

appRoutes.post("/courses", (req, res) => {

  const course = {};
  return res.status(201).json(course)
});

appRoutes.get("/courses", (req, res) => {
  diag.info("Request received");
  const course = {};
  return res.status(200).json(course)
});


export default appRoutes;