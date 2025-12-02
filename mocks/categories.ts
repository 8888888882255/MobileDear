import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Nữ',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    subcategories: [
      'Đầm',
      'Áo kiểu',
      'Quần jeans',
      'Chân váy',
      'Áo khoác',
      'Áo len',
      'Giày dép',
      'Phụ kiện'
    ]
  },
  {
    id: '2',
    name: 'Nam',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    subcategories: [
      'Áo thun',
      'Sơ mi',
      'Quần tây',
      'Quần jeans',
      'Áo khoác',
      'Áo len',
      'Giày dép',
      'Phụ kiện'
    ]
  },
  {
    id: '3',
    name: 'Trẻ em',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    subcategories: [
      'Bé gái',
      'Bé trai',
      'Sơ sinh',
      'Giày dép',
      'Phụ kiện'
    ]
  },
  {
    id: '4',
    name: 'Phụ kiện',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    subcategories: [
      'Túi xách',
      'Trang sức',
      'Đồng hồ',
      'Nón',
      'Khăn choàng',
      'Thắt lưng',
      'Kính mát'
    ]
  }
];
