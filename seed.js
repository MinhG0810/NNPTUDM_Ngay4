const mongoose = require('mongoose');
const categorySchema = require('./schemas/categories');
const productSchema = require('./schemas/products');
const { dataCategories, dataProducts } = require('./utils/data');

const DB_URI = 'mongodb://localhost:27017/NNPTUD-Ngay3';

async function seed() {
    try {
        await mongoose.connect(DB_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await categorySchema.deleteMany({});
        await productSchema.deleteMany({});
        console.log("Cleared existing data.");

        // Insert Categories
        // We need to map the 'id' from JSON to the MongoDB '_id' but MongoDB uses ObjectIds.
        // For simplicity, we'll just create new ones and keep track of names.
        const createdCategories = [];
        for (const cat of dataCategories) {
            const newCat = new categorySchema({
                name: cat.name,
                slug: cat.slug,
                image: cat.image
            });
            await newCat.save();
            createdCategories.push({ originalId: cat.id, mongoId: newCat._id, name: newCat.name });
            console.log(`Created category: ${cat.name}`);
        }

        // Insert Products
        for (const prod of dataProducts) {
            // Find the corresponding mongoId for the category
            const categoryMatch = createdCategories.find(c => c.originalId === prod.category.id);
            
            const newProd = new productSchema({
                title: prod.title,
                slug: prod.slug,
                price: prod.price,
                description: prod.description,
                images: prod.images,
                category: categoryMatch ? categoryMatch.mongoId : null
            });
            await newProd.save();
            console.log(`Created product: ${prod.title}`);
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
