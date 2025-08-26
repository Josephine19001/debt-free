import { ScanLine, Shield, Scissors, Heart, Sparkles, Zap } from 'lucide-react-native';
import type { Feature } from '@/components/explore/FeatureCard';
import type { Category } from '@/components/explore/CategoryCard';
import type { ScanningPerson } from '@/components/explore/ScanningPersonCard';

export const mainFeatures: Feature[] = [
  {
    id: 1,
    title: 'Ingredient Analysis',
    subtitle: 'Scan and analyze beauty product ingredients instantly',
    description: "Get detailed information about what's in your beauty products",
    icon: ScanLine,
    color: '#8B5CF6',
    bgColor: '#F3F4F6',
    image: require('@/assets/images/flask.png'),
  },
  {
    id: 2,
    title: 'Safety Check',
    subtitle: 'Identify potentially harmful ingredients',
    description: 'Know which ingredients to avoid for your skin type',
    icon: Shield,
    color: '#10B981',
    bgColor: '#ECFDF5',
    image: require('@/assets/images/shield.png'),
  },
];

export const categories: Category[] = [
  {
    label: 'Hair',
    img: require('@/assets/onboarding/example-icon.png'),
    icon: Scissors,
    color: '#8B5CF6',
  },
  {
    label: 'Skin',
    img: require('@/assets/onboarding/example-icon.png'),
    icon: Heart,
    color: '#10B981',
  },
  {
    label: 'Face',
    img: require('@/assets/onboarding/example-icon.png'),
    icon: Sparkles,
    color: '#F59E0B',
  },
  {
    label: 'Perfume',
    img: require('@/assets/onboarding/example-icon.png'),
    icon: Zap,
    color: '#EF4444',
  },
];

export const scanningPeople: ScanningPerson[] = [
  {
    id: 1,
    name: 'Sarah M.',
    product: 'Foundation',
    image: require('@/assets/images/avatar.png'),
  },
  {
    id: 2,
    name: 'Mike K.',
    product: 'Shampoo',
    image: require('@/assets/images/avatar.png'),
  },
  {
    id: 3,
    name: 'Lisa R.',
    product: 'Moisturizer',
    image: require('@/assets/images/avatar.png'),
  },
  {
    id: 4,
    name: 'Alex T.',
    product: 'Cologne',
    image: require('@/assets/images/avatar.png'),
  },
  {
    id: 5,
    name: 'Katelyne K.',
    product: 'Shampoo',
    image: require('@/assets/images/avatar.png'),
  },
  {
    id: 6,
    name: 'Nara R.',
    product: 'Moisturizer',
    image: require('@/assets/images/avatar.png'),
  },
  {
    id: 7,
    name: 'Alex T.',
    product: 'Cologne',
    image: require('@/assets/images/avatar.png'),
  },
];
