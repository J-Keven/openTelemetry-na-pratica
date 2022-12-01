import { Router } from "express";
import * as pg from "pg";
// import Instrumentation from "./instrumentation";
import logger from "./logger";

const pgClient = new pg.Client({
  host: "postgres",
  database: "encoder",
  password: "docker",
  user: "postgres",
  port: 5432,
});

const appRoutes = Router();

// const ingressMiddleware = async (req, res, next) => {
//   const span = Instrumentation.provider.getTracer("video_admin").startSpan("ingress");
//   span.setAttribute("http.method", req.method);
//   span.setAttribute("http.url", req.original);
//   span.setAttribute("http.user.id", "1234443423dldsvknvn2");
//   span.end();

//   logger.info(
//     `handled ${req.method} ${req.path}. body ${JSON.stringify(req.body)}`
//   );
//   return next()
// };
appRoutes.post("/courses", (req, res) => {
  const course = {};
  return res.status(201).json(course);
});

appRoutes.get("/movies", async (req, res) => {
  // const dbConnect = Instrumentation.provider.getTracer("video_admin");

  // let span = dbConnect.startSpan("connect_db");
  await pgClient.connect();
  // span.end();

  // const getAllMovies = Instrumentation.provider.getTracer("video_admin");
  // span = getAllMovies.startSpan("get_all_movies");
  const movies = await pgClient.query("SELECT * FROM movies");
  // span.end();

  await pgClient.end();
  return res.status(200).json(movies);
});

export default appRoutes;