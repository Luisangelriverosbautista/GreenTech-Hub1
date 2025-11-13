// Role type
export type UserRole = 'donor' | 'creator';

// User types
export interface User {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  email: string;
  role?: UserRole;
  walletAddress?: string;
  walletConnected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Project types
export interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  targetAmount?: string;
  metaAmount?: number;
  currentAmount?: string | number;
  creatorId?: string;
  creator?: User | { _id: string; username: string; walletAddress: string };
  category: string;
  mediaUrl?: string;
  imageUrl?: string;
  walletAddress?: string;
  funded?: boolean;
  status?: 'pending' | 'active' | 'funded' | 'completed';
  raisedAmount?: number;
  transactions?: Transaction[];
  progress?: number;
  remaining?: string;
  donations?: any[];
  environmentalImpact?: {
    metric: string;
    value: string;
  };
  milestones?: Array<{
    description: string;
    targetAmount: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export type NewProject = Omit<Project, 
  'id' | 
  '_id' |
  'walletAddress' | 
  'creatorId' | 
  'creatorName' |
  'funded' | 
  'transactions' | 
  'status' | 
  'raisedAmount' | 
  'currentAmount' |
  'progress' |
  'remaining' |
  'donations' |
  'createdAt' | 
  'updatedAt'
>;

export type UpdateProject = Partial<NewProject>;

// Transaction types
export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  type: 'donation' | 'transfer';
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}