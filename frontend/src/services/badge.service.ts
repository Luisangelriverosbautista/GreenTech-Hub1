import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://greentech-hub1-2.onrender.com/api';

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requirements: {
    type: 'donations' | 'projects' | 'environmental';
    threshold: number;
  };
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

class BadgeService {
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const response = await axios.get(`${API_URL}/badges/user/${userId}`);
    return response.data;
  }

  async getAllBadges(): Promise<Badge[]> {
    const response = await axios.get(`${API_URL}/badges`);
    return response.data;
  }

  async checkNewBadges(userId: string): Promise<UserBadge[]> {
    const response = await axios.post(`${API_URL}/badges/check/${userId}`);
    return response.data;
  }
}

export const badgeService = new BadgeService();