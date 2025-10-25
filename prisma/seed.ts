import { PrismaClient, UserRole, ProductCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const indianStatesAndCities = [
  {
    state: 'Maharashtra',
    cities: [
      { name: 'Mumbai', district: 'Mumbai', taluka: 'Mumbai City' },
      { name: 'Pune', district: 'Pune', taluka: 'Pune' },
      { name: 'Nagpur', district: 'Nagpur', taluka: 'Nagpur' },
      { name: 'Nashik', district: 'Nashik', taluka: 'Nashik' },
      { name: 'Aurangabad', district: 'Aurangabad', taluka: 'Aurangabad' },
      { name: 'Thane', district: 'Thane', taluka: 'Thane' },
      { name: 'Kolhapur', district: 'Kolhapur', taluka: 'Kolhapur' },
      { name: 'Solapur', district: 'Solapur', taluka: 'Solapur' },
    ],
  },
  {
    state: 'Gujarat',
    cities: [
      { name: 'Ahmedabad', district: 'Ahmedabad', taluka: 'Ahmedabad City' },
      { name: 'Surat', district: 'Surat', taluka: 'Surat' },
      { name: 'Vadodara', district: 'Vadodara', taluka: 'Vadodara' },
      { name: 'Rajkot', district: 'Rajkot', taluka: 'Rajkot' },
      { name: 'Bhavnagar', district: 'Bhavnagar', taluka: 'Bhavnagar' },
      { name: 'Jamnagar', district: 'Jamnagar', taluka: 'Jamnagar' },
    ],
  },
  {
    state: 'Karnataka',
    cities: [
      { name: 'Bangalore', district: 'Bangalore Urban', taluka: 'Bangalore North' },
      { name: 'Mysore', district: 'Mysore', taluka: 'Mysore' },
      { name: 'Hubli', district: 'Dharwad', taluka: 'Hubli' },
      { name: 'Mangalore', district: 'Dakshina Kannada', taluka: 'Mangalore' },
      { name: 'Belgaum', district: 'Belgaum', taluka: 'Belgaum' },
    ],
  },
  {
    state: 'Tamil Nadu',
    cities: [
      { name: 'Chennai', district: 'Chennai', taluka: 'Chennai' },
      { name: 'Coimbatore', district: 'Coimbatore', taluka: 'Coimbatore' },
      { name: 'Madurai', district: 'Madurai', taluka: 'Madurai' },
      { name: 'Tiruchirappalli', district: 'Tiruchirappalli', taluka: 'Tiruchirappalli' },
      { name: 'Salem', district: 'Salem', taluka: 'Salem' },
    ],
  },
  {
    state: 'Rajasthan',
    cities: [
      { name: 'Jaipur', district: 'Jaipur', taluka: 'Jaipur' },
      { name: 'Jodhpur', district: 'Jodhpur', taluka: 'Jodhpur' },
      { name: 'Udaipur', district: 'Udaipur', taluka: 'Udaipur' },
      { name: 'Kota', district: 'Kota', taluka: 'Kota' },
      { name: 'Ajmer', district: 'Ajmer', taluka: 'Ajmer' },
    ],
  },
  {
    state: 'Delhi',
    cities: [
      { name: 'New Delhi', district: 'Central Delhi', taluka: 'New Delhi' },
      { name: 'South Delhi', district: 'South Delhi', taluka: 'South Delhi' },
      { name: 'North Delhi', district: 'North Delhi', taluka: 'North Delhi' },
    ],
  },
  {
    state: 'Uttar Pradesh',
    cities: [
      { name: 'Lucknow', district: 'Lucknow', taluka: 'Lucknow' },
      { name: 'Kanpur', district: 'Kanpur Nagar', taluka: 'Kanpur' },
      { name: 'Agra', district: 'Agra', taluka: 'Agra' },
      { name: 'Varanasi', district: 'Varanasi', taluka: 'Varanasi' },
      { name: 'Noida', district: 'Gautam Buddha Nagar', taluka: 'Noida' },
    ],
  },
  {
    state: 'West Bengal',
    cities: [
      { name: 'Kolkata', district: 'Kolkata', taluka: 'Kolkata' },
      { name: 'Howrah', district: 'Howrah', taluka: 'Howrah' },
      { name: 'Durgapur', district: 'Paschim Bardhaman', taluka: 'Durgapur' },
      { name: 'Siliguri', district: 'Darjeeling', taluka: 'Siliguri' },
    ],
  },
  {
    state: 'Telangana',
    cities: [
      { name: 'Hyderabad', district: 'Hyderabad', taluka: 'Hyderabad' },
      { name: 'Warangal', district: 'Warangal Urban', taluka: 'Warangal' },
      { name: 'Nizamabad', district: 'Nizamabad', taluka: 'Nizamabad' },
    ],
  },
  {
    state: 'Andhra Pradesh',
    cities: [
      { name: 'Visakhapatnam', district: 'Visakhapatnam', taluka: 'Visakhapatnam' },
      { name: 'Vijayawada', district: 'Krishna', taluka: 'Vijayawada' },
      { name: 'Guntur', district: 'Guntur', taluka: 'Guntur' },
    ],
  },
  {
    state: 'Kerala',
    cities: [
      { name: 'Thiruvananthapuram', district: 'Thiruvananthapuram', taluka: 'Thiruvananthapuram' },
      { name: 'Kochi', district: 'Ernakulam', taluka: 'Kochi' },
      { name: 'Kozhikode', district: 'Kozhikode', taluka: 'Kozhikode' },
      { name: 'Thrissur', district: 'Thrissur', taluka: 'Thrissur' },
    ],
  },
  {
    state: 'Punjab',
    cities: [
      { name: 'Ludhiana', district: 'Ludhiana', taluka: 'Ludhiana' },
      { name: 'Amritsar', district: 'Amritsar', taluka: 'Amritsar' },
      { name: 'Jalandhar', district: 'Jalandhar', taluka: 'Jalandhar' },
    ],
  },
  {
    state: 'Haryana',
    cities: [
      { name: 'Gurgaon', district: 'Gurgaon', taluka: 'Gurgaon' },
      { name: 'Faridabad', district: 'Faridabad', taluka: 'Faridabad' },
      { name: 'Panipat', district: 'Panipat', taluka: 'Panipat' },
    ],
  },
  {
    state: 'Madhya Pradesh',
    cities: [
      { name: 'Indore', district: 'Indore', taluka: 'Indore' },
      { name: 'Bhopal', district: 'Bhopal', taluka: 'Bhopal' },
      { name: 'Jabalpur', district: 'Jabalpur', taluka: 'Jabalpur' },
      { name: 'Gwalior', district: 'Gwalior', taluka: 'Gwalior' },
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

async function main() {
  console.log('🌱 Starting seed...');

  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+919999999999' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@jewelia.com',
      phone: '+919999999999',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  console.log('Creating states and cities...');
  for (const stateData of indianStatesAndCities) {
    const state = await prisma.state.upsert({
      where: { slug: slugify(stateData.state) },
      update: {},
      create: {
        name: stateData.state,
        slug: slugify(stateData.state),
      },
    });

    for (const cityData of stateData.cities) {
      await prisma.city.upsert({
        where: { slug: slugify(cityData.name) },
        update: {},
        create: {
          name: cityData.name,
          slug: slugify(cityData.name),
          stateId: state.id,
          district: cityData.district,
          taluka: cityData.taluka,
          seoMeta: {
            title: `Jewelry Shops in ${cityData.name} | JEWELIA`,
            description: `Find the best jewelry shops in ${cityData.name}. Browse gold, silver, and diamond jewelry with AR preview.`,
            keywords: `jewelry ${cityData.name}, gold shops ${cityData.name}, jewelers ${cityData.name}`,
          },
        },
      });
    }
    console.log(`✅ Created ${stateData.state} with ${stateData.cities.length} cities`);
  }

  console.log('Creating sample shop owner and shop...');
  const shopOwnerPassword = await bcrypt.hash('owner123', 10);
  const shopOwner = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+919876543210',
      passwordHash: shopOwnerPassword,
      role: UserRole.SHOP_OWNER,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const mumbaiCity = await prisma.city.findUnique({
    where: { slug: 'mumbai' },
  });

  if (mumbaiCity) {
    const shop = await prisma.shop.upsert({
      where: { id: 'sample-shop-id' },
      update: {},
      create: {
        id: 'sample-shop-id',
        name: 'Golden Jewelers',
        ownerId: shopOwner.id,
        cityId: mumbaiCity.id,
        address: '123 Zaveri Bazaar, Mumbai, Maharashtra',
        phone: '+919876543210',
        whatsapp: '+919876543210',
        description: 'Premium gold and diamond jewelry since 1985',
        verified: true,
        membershipStatus: 'ACTIVE',
        membershipStartedAt: new Date(),
        membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lat: 18.9568,
        lng: 72.8347,
      },
    });

    console.log('✅ Sample shop created:', shop.name);

    console.log('Creating sample products...');
    const products = [
      {
        name: 'Gold Necklace Set',
        sku: 'GN-001',
        description: '22K Gold Necklace with intricate design',
        priceInPaise: 15000000,
        purity: '22K',
        weight: 45.5,
        category: ProductCategory.GOLD_NECKLACE,
        images: ['https://via.placeholder.com/400x400?text=Gold+Necklace'],
        tags: ['bridal', 'traditional', 'gold'],
        featured: true,
      },
      {
        name: 'Diamond Ring',
        sku: 'DR-001',
        description: 'Solitaire Diamond Ring 1 Carat',
        priceInPaise: 25000000,
        purity: '18K',
        weight: 3.5,
        category: ProductCategory.DIAMOND_RING,
        images: ['https://via.placeholder.com/400x400?text=Diamond+Ring'],
        tags: ['engagement', 'diamond', 'luxury'],
        featured: true,
      },
      {
        name: 'Gold Earrings',
        sku: 'GE-001',
        description: 'Traditional Gold Jhumka Earrings',
        priceInPaise: 3500000,
        purity: '22K',
        weight: 12.0,
        category: ProductCategory.GOLD_EARRING,
        images: ['https://via.placeholder.com/400x400?text=Gold+Earrings'],
        tags: ['traditional', 'jhumka', 'gold'],
        featured: false,
      },
      {
        name: 'Silver Anklets',
        sku: 'SA-001',
        description: 'Pure Silver Anklets with bells',
        priceInPaise: 450000,
        purity: '925',
        weight: 35.0,
        category: ProductCategory.ANKLETS,
        images: ['https://via.placeholder.com/400x400?text=Silver+Anklets'],
        tags: ['silver', 'traditional', 'anklets'],
        featured: false,
      },
      {
        name: 'Mangalsutra',
        sku: 'MG-001',
        description: 'Traditional Black Beads Mangalsutra',
        priceInPaise: 5500000,
        purity: '22K',
        weight: 18.0,
        category: ProductCategory.MANGALSUTRA,
        images: ['https://via.placeholder.com/400x400?text=Mangalsutra'],
        tags: ['bridal', 'mangalsutra', 'traditional'],
        featured: true,
      },
    ];

    for (const productData of products) {
      await prisma.product.create({
        data: {
          ...productData,
          shopId: shop.id,
        },
      });
    }
    console.log(`✅ Created ${products.length} sample products`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
