export interface ServerCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  parentId?: string | null;
  parent?: ServerCategory | null;
  children?: ServerCategory[];
  attributes?: unknown;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  parentId?: string | null;
  displayOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}
