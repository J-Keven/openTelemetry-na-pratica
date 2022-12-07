import { Router } from "express";
import logger from "../logger";
import MovieRepository from "../database/repositories/movie.repository";
import axios from "axios";
import Rabbitmq from "../queue";
const appRoutes = Router();

function parseAllMovies(movies) {
  return new Promise(resolve => setTimeout(resolve, 2000));
}

appRoutes.post("/courses", (req, res) => {
  const course = {};
  return res.status(201).json(course);
});

appRoutes.get("/test", async (req, res) => {
  const span = req.span;
  const movieRepository = new MovieRepository();

  const movies = await movieRepository.findAll();

  const { data } = await axios.get("https://api.chucknorris.io/jokes/random");

  await parseAllMovies(data);

  const rabbitmq = new Rabbitmq('amqp://rabbitmq:rabbitmq@rabbitmq:5672');
  await rabbitmq.connect();
  await rabbitmq.notify(JSON.stringify({
    user: "Jonh Doe",
    message: "Queroooo cafééééééééé, éééééééeéé"
  }), 'amq.direct', 'movies');

  return res.status(200).json(data);
});

export default appRoutes;