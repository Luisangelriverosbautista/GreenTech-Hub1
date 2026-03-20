import api from './api';
import type {
  BlogPost,
  CreateBlogPayload,
  CreateVideoPayload,
  VideoPost,
} from '../types/content.types';

class ContentService {
  async getVideos(status: 'all' | 'published' | 'draft' = 'published'): Promise<VideoPost[]> {
    const response = await api.get<VideoPost[]>('/content/videos', {
      params: status === 'all' ? { status: 'all' } : { status },
    });
    return response.data;
  }

  async createVideo(payload: CreateVideoPayload): Promise<VideoPost> {
    const response = await api.post<VideoPost>('/content/videos', payload);
    return response.data;
  }

  async getBlogs(status: 'all' | 'published' | 'draft' = 'published'): Promise<BlogPost[]> {
    const response = await api.get<BlogPost[]>('/content/blogs', {
      params: status === 'all' ? { status: 'all' } : { status },
    });
    return response.data;
  }

  async createBlog(payload: CreateBlogPayload): Promise<BlogPost> {
    const response = await api.post<BlogPost>('/content/blogs', payload);
    return response.data;
  }
}

export const contentService = new ContentService();
export default contentService;
