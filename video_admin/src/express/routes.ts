import { Router } from "express";
import logger from "../logger";
import MovieRepository from "../database/repositories/movie.repository";
import axios from "axios";
import Rabbitmq from "../queue";
const appRoutes = Router();

const ingressMiddleware = async (req, res, next) => {
  logger.info(
    `handled ${req.method} ${req.path}. body ${JSON.stringify(req.body)}`
  );
  return next()
};

appRoutes.post("/courses", ingressMiddleware, (req, res) => {
  const course = {};
  return res.status(201).json(course);
});

appRoutes.get("/movies", ingressMiddleware, async (req, res) => {
  const movieRepository = new MovieRepository();

  const movies = await movieRepository.findAll();

  const { data } = await axios.get("https://api.chucknorris.io/jokes/random");

  const rabbitmq = new Rabbitmq('amqp://rabbitmq:rabbitmq@rabbitmq:5672');
  await rabbitmq.connect();
  await rabbitmq.notify(JSON.stringify({
    user: "Jonh Doe",
    message: "Queroooo cafééééééééé, éééééééeéé"
  }), 'amq.direct', 'movies');


  return res.status(500).json();
});

export default appRoutes;