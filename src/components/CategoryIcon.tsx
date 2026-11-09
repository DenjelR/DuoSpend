import React from 'react';
import {
  Home,
  Plane,
  ShoppingBag,
  Coffee,
  Car,
  Heart,
  Film,
  Zap,
  ShoppingBasket,
  Gift,
  Wrench,
  Utensils,
  MapPin,
  Tag,
  DollarSign,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const iconProps = { className, size };

  switch (name?.toLowerCase()) {
    case 'home':
      return <Home {...iconProps} />;
    case 'plane':
      return <Plane {...iconProps} />;
    case 'shoppingbag':
    case 'shopping-bag':
      return <ShoppingBag {...iconProps} />;
    case 'coffee':
      return <Coffee {...iconProps} />;
    case 'car':
      return <Car {...iconProps} />;
    case 'heart':
      return <Heart {...iconProps} />;
    case 'film':
      return <Film {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'shoppingbasket':
      return <ShoppingBasket {...iconProps} />;
    case 'gift':
      return <Gift {...iconProps} />;
    case 'wrench':
      return <Wrench {...iconProps} />;
    case 'utensils':
      return <Utensils {...iconProps} />;
    case 'mappin':
      return <MapPin {...iconProps} />;
    case 'briefcase':
      return <Briefcase {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'dollarsign':
      return <DollarSign {...iconProps} />;
    default:
      return <Tag {...iconProps} />;
  }
};
