export interface Message {
  id: string;
  message: string;
  authorOfMessage: string;
  createdAt: string;
}
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  image?: string;
  createdAt: string;
  category?: string;
}
export interface BlogSubmission extends Blog {
  imageName?: string;
}
export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  alt: string;
  category: string;
  credit: string;
}
export interface VillageVideo {
  id: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  duration: string;
  credit: string;
}
export interface Theme {
  id: string;
  name: string;
  swatch: string;
}
