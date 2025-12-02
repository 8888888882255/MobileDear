import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Đầm Hoa Mùa Hè',
    description: 'Chiếc đầm hoa xinh xắn, lý tưởng cho những ngày hè. Chất liệu nhẹ, thoáng mát và thời trang.',
    price: 899000,
    discountPrice: 699000,
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nữ',
    subcategory: 'Đầm',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Trắng', 'Xanh', 'Hồng'],
    tags: ['mùa hè', 'hoa văn', 'đầm'],
    rating: 4.5,
    reviewCount: 128,
    stock: 45,
    featured: true,
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-06-01T14:20:00Z'
  },
  {
    id: '2',
    name: 'Áo Khoác Denim Cổ Điển',
    description: 'Áo khoác denim phong cách cổ điển, bền và dễ phối đồ. Thiết kế thoải mái và sành điệu.',
    price: 1299000,
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nữ',
    subcategory: 'Áo khoác',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Xanh', 'Đen'],
    tags: ['denim', 'áo khoác', 'nữ tính'],
    rating: 4.8,
    reviewCount: 95,
    stock: 30,
    featured: true,
    createdAt: '2023-04-20T09:15:00Z',
    updatedAt: '2023-05-25T11:45:00Z'
  },
  {
    id: '3',
    name: 'Quần Chinos Ôm Dáng',
    description: 'Quần chinos dáng ôm thoải mái, thích hợp cho dịp thường ngày hoặc bán trang trọng.',
    price: 599000,
    discountPrice: 499000,
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nam',
    subcategory: 'Quần dài',
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['Be', 'Xanh navy', 'Xanh rêu'],
    tags: ['chinos', 'quần dài', 'nam tính'],
    rating: 4.3,
    reviewCount: 67,
    stock: 50,
    featured: false,
    createdAt: '2023-05-05T13:45:00Z',
    updatedAt: '2023-06-10T16:30:00Z'
  },
  {
    id: '4',
    name: 'Áo Len Dáng Rộng',
    description: 'Áo len dáng rộng ấm áp cho những ngày se lạnh. Chất liệu mềm mại, giữ ấm và thời trang.',
    price: 799000,
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nữ',
    subcategory: 'Áo len',
    sizes: ['S', 'M', 'L'],
    colors: ['Kem', 'Xám', 'Đỏ rượu'],
    tags: ['áo len', 'đan len', 'mùa đông'],
    rating: 4.7,
    reviewCount: 112,
    stock: 25,
    featured: true,
    createdAt: '2023-03-10T11:20:00Z',
    updatedAt: '2023-05-15T09:10:00Z'
  },
  {
    id: '5',
    name: 'Boots Da Cổ Ngắn',
    description: 'Đôi boots da cổ ngắn thanh lịch, gót cao vừa phải, dễ mang và phù hợp mọi trang phục.',
    price: 1499000,
    discountPrice: 1299000,
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nữ',
    subcategory: 'Giày',
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Đen', 'Nâu', 'Da bò'],
    tags: ['boots', 'da', 'giày nữ'],
    rating: 4.6,
    reviewCount: 89,
    stock: 15,
    featured: false,
    createdAt: '2023-04-25T14:50:00Z',
    updatedAt: '2023-06-05T10:35:00Z'
  },
  {
    id: '6',
    name: 'Áo Thun In Hình',
    description: 'Áo thun in họa tiết làm từ 100% cotton hữu cơ. Thoải mái, cá tính và thân thiện môi trường.',
    price: 349000,
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nam',
    subcategory: 'Áo thun',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Trắng', 'Đen', 'Xám'],
    tags: ['áo thun', 'in hình', 'nam'],
    rating: 4.2,
    reviewCount: 56,
    stock: 100,
    featured: false,
    createdAt: '2023-05-20T08:25:00Z',
    updatedAt: '2023-06-15T13:15:00Z'
  },
  {
    id: '7',
    name: 'Quần Jeans Cạp Cao',
    description: 'Quần jeans cạp cao ôm dáng tôn vòng eo. Chất liệu co giãn, thoải mái suốt cả ngày.',
    price: 799000,
    discountPrice: 599000,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nữ',
    subcategory: 'Quần jeans',
    sizes: ['24', '26', '28', '30', '32'],
    colors: ['Xanh đậm', 'Đen', 'Xanh nhạt'],
    tags: ['jeans', 'cạp cao', 'nữ'],
    rating: 4.4,
    reviewCount: 132,
    stock: 40,
    featured: true,
    createdAt: '2023-04-15T12:40:00Z',
    updatedAt: '2023-05-30T15:55:00Z'
  },
  {
    id: '8',
    name: 'Áo Blazer Dáng Cứng',
    description: 'Áo blazer cắt may tỉ mỉ, tạo điểm nhấn chuyên nghiệp và thanh lịch. Phù hợp đi làm, sự kiện.',
    price: 1599000,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1548126032-079a0fb0099d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    category: 'Nữ',
    subcategory: 'Blazer',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Đen', 'Xanh navy', 'Be'],
    tags: ['blazer', 'công sở', 'thanh lịch'],
    rating: 4.9,
    reviewCount: 75,
    stock: 20,
    featured: false,
    createdAt: '2023-03-25T10:10:00Z',
    updatedAt: '2023-05-20T11:25:00Z'
  }
];
