const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { faker } = require('@faker-js/faker/locale/ar');
const slugify = require('slugify');

// --- الخطوة 1: التأكد من تحميل متغيرات البيئة بشكل صحيح ---
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- الخطوة 2: استيراد المودلز ---
const User = require('../src/modules/user/User.model');
const Category = require('../src/modules/category/Category.model');
const Product = require('../src/modules/product/Product.model');
const Pharmacy = require('../src/modules/pharmacy/Pharmacy.model');
const Order = require('../src/modules/order/Order.model');

// --- إعدادات كمية البيانات ---
const USER_COUNT = 20;
const PHARMACIST_COUNT = 5;
const PRODUCT_COUNT = 100;
const ORDER_COUNT = 30;

// --- الخطوة 3: التحقق من وجود رابط الاتصال قبل أي شيء آخر ---
const MONGO_URI = process.env.MongoURI;
if (!MONGO_URI) {
    console.error('ERROR: MONGO_URI is not defined in your .env file.');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

const clearDatabase = async () => {
    console.log('Clearing old data...');
    try {
        await Order.deleteMany({});
        await Pharmacy.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});
        console.log('Old data cleared successfully.');
    } catch (error) {
        console.error('Error clearing data:', error);
        throw error;
    }
};

const seedDatabase = async () => {
    try {
        // --- إنشاء المستخدمين ---
        console.log('Seeding users and pharmacists...');
        const users = [];
        const generateValidPhoneNumber = () => `+9665${faker.string.numeric(8)}`;

        users.push({
            type: 'admin',
            username: 'admin_user',
            email: 'admin@example.com',
            password: 'AdminPassword123!',
            firstName: 'Admin',
            lastName: 'User',
            phone: generateValidPhoneNumber(),
            isVerified: true,
            address: faker.location.streetAddress(),
            location: { type: 'Point', coordinates: [faker.location.longitude(), faker.location.latitude()] },
        });

        for (let i = 0; i < PHARMACIST_COUNT; i++) {
            users.push({
                type: 'pharmacist',
                username: faker.internet.username().toLowerCase() + i,
                email: faker.internet.email(),
                password: 'PharmacistPassword123!',
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                phone: generateValidPhoneNumber(),
                isVerified: true,
                address: faker.location.streetAddress(),
                location: { type: 'Point', coordinates: [faker.location.longitude(), faker.location.latitude()] },
                license: `LIC-${faker.string.alphanumeric(10).toUpperCase()}`
            });
        }
        
        for (let i = 0; i < USER_COUNT; i++) {
            users.push({
                type: 'user',
                username: faker.internet.username().toLowerCase() + i,
                email: faker.internet.email(),
                password: 'UserPassword123!',
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                phone: generateValidPhoneNumber(),
                isVerified: true,
                address: faker.location.streetAddress(),
                location: { type: 'Point', coordinates: [faker.location.longitude(), faker.location.latitude()] },
            });
        }
        
        const createdUsers = await User.insertMany(users);
        console.log(`${createdUsers.length} users created.`);
        const adminUser = createdUsers.find(u => u.type === 'admin');
        const pharmacistUsers = createdUsers.filter(u => u.type === 'pharmacist');
        const normalUsers = createdUsers.filter(u => u.type === 'user');

        // --- إنشاء الفئات ---
        console.log('Seeding categories...');
        const categories = [
            { name: 'أدوية السعال والبرد', image: faker.image.urlLoremFlickr({ category: 'medicine' }) },
            { name: 'مسكنات الألم', image: faker.image.urlLoremFlickr({ category: 'pills' }) },
            { name: 'الفيتامينات والمكملات', image: faker.image.urlLoremFlickr({ category: 'vitamins' }) },
            { name: 'العناية بالبشرة', image: faker.image.urlLoremFlickr({ category: 'skincare' }) },
            { name: 'مستلزمات أطفال', image: faker.image.urlLoremFlickr({ category: 'baby' }) },
        ];
        const createdCategories = await Category.insertMany(categories);
        console.log(`${createdCategories.length} categories created.`);

        // --- إنشاء المنتجات ---
        console.log('Seeding products...');
        const products = [];
        for (let i = 0; i < PRODUCT_COUNT; i++) {
            const productName = faker.commerce.productName();
            const productSlug = slugify(productName, { lower: true, strict: true });

            products.push({
                name: productName,
                slug: productSlug, // توليد الـ slug يدوياً
                type: faker.helpers.arrayElement(['Medicine', 'Medical Supply', 'Personal Care', 'Vitamin', 'Other']),
                category: faker.helpers.arrayElement(createdCategories)._id,
                description: faker.commerce.productDescription(),
                imageUrl: faker.image.urlLoremFlickr({ category: 'product' }),
                price: faker.commerce.price({ min: 10, max: 500 }),
                brand: faker.company.name(),
                createdBy: adminUser._id,
                isActive: true,
            });
        }
        const createdProducts = await Product.insertMany(products);
        console.log(`${createdProducts.length} products created.`);
        
        // --- إنشاء الصيدليات ---
        console.log('Seeding pharmacies...');
        const pharmacies = [];
        for (let i = 0; i < PHARMACIST_COUNT; i++) {
            const pharmacist = pharmacistUsers[i];
            const pharmacyName = `صيدلية ${pharmacist.firstName} ${pharmacist.lastName}`;
            const pharmacySlug = slugify(pharmacyName, { lower: true, strict: true });

            const pharmacyMedicines = faker.helpers.arrayElements(createdProducts, { min: 20, max: 50 }).map(p => ({
                medicineId: p._id,
                quantity: faker.number.int({ min: 5, max: 100 }),
                price: parseFloat(p.price) * faker.number.float({ min: 1.1, max: 1.5 }),
            }));

            pharmacies.push({
                userId: pharmacist._id,
                name: pharmacyName,
                slug: pharmacySlug, // توليد الـ slug يدوياً
                address: pharmacist.address,
                location: pharmacist.location,
                phone: pharmacist.phone,
                openingHours: {
                    morning: { from: '09:00', to: '13:00' },
                    evening: { from: '17:00', to: '23:00' }
                },
                workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'السبت'],
                imageUrl: faker.image.urlLoremFlickr({ category: 'pharmacy' }),
                description: `صيدلية متكاملة تقدم أفضل الخدمات الدوائية.`,
                services: ['توصيل للمنازل', 'قياس ضغط الدم', 'استشارات دوائية'],
                medicines: pharmacyMedicines,
            });
        }
        const createdPharmacies = await Pharmacy.insertMany(pharmacies);
        console.log(`${createdPharmacies.length} pharmacies created.`);

        // --- إنشاء الطلبات ---
        console.log('Seeding orders...');
        const orders = [];
        for (let i = 0; i < ORDER_COUNT; i++) {
            const randomUser = faker.helpers.arrayElement(normalUsers);
            const randomPharmacy = faker.helpers.arrayElement(createdPharmacies);
            const itemsFromPharmacy = faker.helpers.arrayElements(randomPharmacy.medicines, { min: 1, max: 4 });
            
            if (itemsFromPharmacy.length === 0) continue;

            const orderItems = itemsFromPharmacy.map(item => ({
                productId: item.medicineId,
                name: createdProducts.find(p => p._id.equals(item.medicineId)).name,
                quantity: faker.number.int({ min: 1, max: 3 }),
            }));

            const totalPrice = orderItems.reduce((sum, item) => {
                const pharmacyItem = randomPharmacy.medicines.find(p => p.medicineId.equals(item.productId));
                return sum + (pharmacyItem.price * item.quantity);
            }, 0);

            orders.push({
                userId: randomUser._id,
                pharmacyId: randomPharmacy._id,
                items: orderItems,
                orderType: faker.helpers.arrayElement(['delivery', 'reservation']),
                deliveryAddress: randomUser.address,
                status: faker.helpers.arrayElement(['pending', 'accepted', 'delivered', 'canceled']),
                totalPrice: totalPrice.toFixed(2),
            });
        }
        await Order.insertMany(orders);
        console.log(`${orders.length} orders created.`);

        console.log('------------------------------------');
        console.log('Database Seeding Completed Successfully!');
        console.log('------------------------------------');

    } catch (error) {
        console.error('An error occurred during the seeding process:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

const run = async () => {
    await connectDB();
    const shouldDelete = process.argv.includes('--delete');
    if (shouldDelete) {
        await clearDatabase();
    }
    await seedDatabase();
};

run();