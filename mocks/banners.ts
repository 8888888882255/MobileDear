import { Banner } from '@/types';

export const banners: Banner[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    title: 'Bộ Sưu Tập Mùa Hè',
    subtitle: 'Khám phá những xu hướng mới nhất trong mùa này',
    buttonText: 'Mua ngay',
    link: '/search',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    title: 'Hàng Mới Về',
    subtitle: 'Là người đầu tiên sở hữu phong cách mới',
    buttonText: 'Yêu thích',
    link: '/wishlist',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    title: 'Ưu Đãi Đặc Biệt',
    subtitle: 'Giảm đến 50% cho một số sản phẩm',
    buttonText: 'Xem ưu đãi',
    link: 'vouchers/spin',
  },
];
