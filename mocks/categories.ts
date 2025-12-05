// mocks/categories.ts
export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Women',
    subcategories: ['Dresses', 'Tops', 'Skirts', 'Pants'],
  },
  {
    id: '2',
    name: 'Men',
    subcategories: ['Shirts', 'Pants', 'Jackets'],
  },
  {
    id: '3',
    name: 'Accessories',
    subcategories: ['Bags', 'Shoes', 'Jewelry'],
  },
];