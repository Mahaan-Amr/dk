export interface MediaItem {
  id: string;
  _id?: string;
  url: string;
  filename: string;
  originalFilename: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  title: string;
  createdAt: string;
  tags?: string[];
  categories?: string[];
}

export interface MediaResponseData {
  media: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MediaUploadResponse {
  success: boolean;
  media: MediaItem;
}

export interface MediaUpdateResponse {
  success: boolean;
  media: MediaItem;
}

export interface MediaDeleteResponse {
  success: boolean;
} 