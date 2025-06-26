export type ResourceCategory = 
  | 'all'
  | 'articles'
  | 'videos'
  | 'books'
  | 'tools'
  | 'community'
  | 'self-care'
  | 'favorites';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceCategory;
  url: string;
  imageUrl?: string;
  featured?: boolean;
  affiliateLinks?: {
    amazon?: string;
    walmart?: string;
  };
  tags?: string[];
  dateAdded: string;
}

export interface ResourceSection {
  title: string;
  description?: string;
  resources: Resource[];
}
