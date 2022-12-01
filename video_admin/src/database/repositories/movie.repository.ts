import { Repository } from "typeorm";
import Database from "../index";
import Movie from "./movie.model";

export default class MovieRepository {
  private repository: Repository<Movie>;
  constructor() {
    this.repository = Database.connection.getRepository(Movie);
  }

  public async create(movie: Movie): Promise<Movie> {
    return this.repository.save(movie);
  }

  public async findAll(): Promise<Movie[]> {
    return this.repository.find();
  }
}