import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class Movie {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  name: string;

  @Column()
  bannerUrl: string;
}

export default Movie;