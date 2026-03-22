// Role type
export type UserRole = 'donor' | 'creator' | 'admin';

// User types
export interface User {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  email: string;
  role?: UserRole;
  walletAddress?: string;
  creatorValidation?: {
    country?: string;
    organizationName?: string;
    governmentId?: string;
    website?: string;
    verificationDocumentUrl?: string;
    submittedAt?: string;
  };
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
  creator?:
    | User
    | {
        _id: string;
        name?: string;
        username?: string;
        email?: string;
        walletAddress?: string;
        creatorValidation?: User['creatorValidation'];
      };
  category: string;
  mediaUrl?: string;
  imageUrl?: string;
  walletAddress?: string;
  funded?: boolean;
  status?:
    | 'pending'
    | 'draft'
    | 'kyc_pending'
    | 'kyc_verified'
    | 'auto_review_failed'
    | 'manual_review_pending'
    | 'approved_for_funding'
    | 'active'
    | 'funded'
    | 'completed'
    | 'rejected'
    | 'cancelled';
  raisedAmount?: number;
  transactions?: Transaction[];
  progress?: number;
  remaining?: string;
  donations?: any[];
  environmentalImpact?: {
    metric: string;
    value: number;
    unit?: string;
  };
  milestones?: Array<{
    description: string;
    targetAmount: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  profileType?: 'individual' | 'organization';
  kycDocuments?: string[];
  tokenRewards?: string;
  verification?: {
    profileType?: 'individual' | 'organization';
    kyc?: {
      status?: 'not_submitted' | 'pending' | 'verified' | 'rejected';
      documents?: string[];
      reviewedAt?: string;
      notes?: string;
    };
    autoReview?: {
      passed?: boolean;
      score?: number;
      reasons?: string[];
      checkedAt?: string;
    };
    manualReview?: {
      status?: 'pending' | 'approved' | 'rejected';
      reviewedAt?: string;
      notes?: string;
    };
    timeline?: Array<{
      stage?: string;
      at?: string;
      note?: string;
    }>;
  };
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