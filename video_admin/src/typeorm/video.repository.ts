import { Repository } from "typeorm";
import Video from "./video.model";

export default class VideoRepository {
  private videoRepository: Repository<Video>;

  constructor() {
    this.videoRepository = new Repository(Video, "video");
  }

  public async createVideo(video: Video): Promise<Video> {
    return await this.videoRepository.save(video);
  }

  public async getVideo(id: string): Promise<Video> {
    return await this.videoRepository.findOne(id);
  }

  public async getVideos(): Promise<Video[]> {
    return await this.videoRepository.find();
  }

  public async updateVideo(id: string, video: Video): Promise<Video> {
    return await this.videoRepository.save(video);
  }

  public async deleteVideo(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne(id);
    return await this.videoRepository.remove(video);
  }
} 