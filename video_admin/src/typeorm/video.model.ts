import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string
}