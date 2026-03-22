import api from './api';
import axios from 'axios';

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

    try {
      const response = await api.post<UploadImageResponse>('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = (error.response?.data as any)?.error || error.message;
        throw new Error(backendMessage || 'No se pudo subir la imagen');
      }

      throw new Error('No se pudo subir la imagen');
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
