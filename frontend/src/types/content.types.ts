export interface ContentAuthor {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: 'donor' | 'creator';
}

export interface VideoPost {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  platform: 'youtube' | 'vimeo';
  originalUrl: string;
  embedUrl: string;
  tags?: string[];
  status?: 'draft' | 'published';
  author?: ContentAuthor;
  createdAt?: string;
}

export interface BlogPost {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  author?: ContentAuthor;
  createdAt?: string;
}

export interface CreateVideoPayload {
  title: string;
  description?: string;
  url: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface CreateBlogPayload {
  title: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}
