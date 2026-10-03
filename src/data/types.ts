export type Product = {
  id: string;
  name: string;
  nameUr?: string;
  category: string;
  images: string[];
  shortDesc: string;
  shortDescUr?: string;
  specs: Record<string, string>;
  featured?: boolean;
  sample?: boolean;
  whatsappText: string;
};
export type Service = {
  slug: string;
  icon: string;
  category: string;
  title: string;
  titleUr?: string;
  short: string;
  shortUr?: string;
  description: string;
  points: string[];
  images: string[];
};
export type Installation = {
  id: string;
  title: string;
  titleUr?: string;
  location?: string;
  image: string;
  before?: string;
};
export type Category = { id: string; label: string; labelUr?: string };
