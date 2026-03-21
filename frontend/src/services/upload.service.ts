import api from './api';

export interface UploadImageResponse {
  message: string;
  url: string;
  path: string;
  filename: string;
}

class UploadService {
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadImageResponse>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
}

export const uploadService = new UploadService();
export default uploadService;
