import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface OrderStatusBadgeProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'primary';
    }
  };
  
  const getLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <Badge
      label={getLabel()}
      variant={getVariant()}
    />
  );
};