// One-off local dev seed script — real Bangalore restaurants/menu data (verified via
// web search, Sep 2026) so the app has something real to browse/search locally.
// Run with: node seed.mjs   (from services/restaurant, after `npm run build`)
import dotenv from "dotenv";
import mongoose from "mongoose";
import Restaurant from "./dist/models/Restaurant.js";
import MenuItems from "./dist/models/MenuItems.js";

dotenv.config();

const img = (wikimediaFile) => `https://commons.wikimedia.org/wiki/Special:FilePath/${wikimediaFile}`;

const restaurants = [
  {
    ownerId: "seed-owner-meghana-foods",
    name: "Meghana Foods",
    description: "Bengaluru institution famous for spicy Andhra-style biryani, generous portions and bold curries.",
    phone: "08041207087",
    image: img("Hyderabadi_Chicken_Biryani.jpg"),
    isVerified: true,
    isOpen: true,
    autoLocation: {
      type: "Point",
      coordinates: [77.5937, 12.9279], // Jayanagar 4th Block
      formattedAddress: "Jayanagar 4th Block, Bengaluru, Karnataka",
    },
    items: [
      { name: "Meghana Special Chicken Biryani", description: "Signature Andhra-style biryani loaded with marinated chicken.", price: 360 },
      { name: "Chicken Boneless Biryani", description: "Fiery Andhra biryani made with tender boneless chicken.", price: 380 },
      { name: "Chicken 555", description: "A famous fiery Meghana starter — spicy, tangy fried chicken.", price: 320 },
      { name: "Authentic Hyderabadi Biryani", description: "Classic dum-cooked Hyderabadi-style chicken biryani.", price: 340 },
      { name: "Mushroom Pepper", description: "Pan-tossed mushrooms in a bold black pepper masala.", price: 280 },
    ],
  },
  {
    ownerId: "seed-owner-mtr-1924",
    name: "MTR 1924",
    description: "Legendary South Indian restaurant since 1924 — birthplace of rava idli and bisi bele bath.",
    phone: "08022220022",
    image: img("Masala_dosa_01.jpg"),
    isVerified: true,
    isOpen: true,
    autoLocation: {
      type: "Point",
      coordinates: [77.6412, 12.9719], // Indiranagar 100 Feet Road
      formattedAddress: "100 Feet Road, Indiranagar, Bengaluru, Karnataka",
    },
    items: [
      { name: "Masala Dosa", description: "Crisp rice-and-lentil crepe filled with spiced potato masala.", price: 75 },
      { name: "Set Dosa", description: "Soft, spongy trio of small dosas served with chutney and sambar.", price: 60 },
      { name: "Rava Idli", description: "MTR's own invention — steamed semolina idli, light and fluffy.", price: 70 },
      { name: "Rava Plain Dosa", description: "Thin, crispy semolina dosa, a South Indian breakfast classic.", price: 80 },
      { name: "Bisi Bele Bath", description: "Traditional Karnataka rice dish cooked with lentils, vegetables and spices.", price: 90 },
      { name: "Kesari Bhath", description: "Sweet semolina dessert flavoured with saffron and ghee.", price: 60 },
    ],
  },
  {
    ownerId: "seed-owner-truffles",
    name: "Truffles",
    description: "Bangalore's iconic comfort-food cafe, celebrated for juicy burgers and indulgent desserts.",
    phone: "08041500700",
    image: img("Cheeseburger.jpg"),
    isVerified: true,
    isOpen: true,
    autoLocation: {
      type: "Point",
      coordinates: [77.6398, 12.9727], // Indiranagar
      formattedAddress: "100 Feet Road, Indiranagar, Bengaluru, Karnataka",
    },
    items: [
      { name: "All-American Cheese Burger", description: "A crowd-pleasing classic loaded with melted cheese.", price: 320 },
      { name: "Tex Mex Chicken Burger", description: "Spicy grilled chicken burger with a Tex-Mex kick.", price: 340 },
      { name: "Crunchy Veg Burger", description: "Crispy vegetable patty burger with fresh toppings.", price: 280 },
      { name: "Peri Peri Prawn", description: "Prawns tossed in a fiery peri peri sauce.", price: 450 },
      { name: "Classic Stuffed Chicken Steak", description: "Grilled chicken steak stuffed with cheese and herbs.", price: 480 },
      { name: "Kahlua Mousse", description: "Rich coffee-liqueur mousse for dessert.", price: 220 },
    ],
  },
  {
    ownerId: "seed-owner-corner-house",
    name: "Corner House Ice Cream",
    description: "Bengaluru's favourite ice cream parlour since 1982 — home of Death By Chocolate.",
    phone: "08041234567",
    image: img("Ice_cream_sundae.jpg"),
    isVerified: true,
    isOpen: true,
    autoLocation: {
      type: "Point",
      coordinates: [77.6094, 12.9707], // Residency Road
      formattedAddress: "Residency Road, Bengaluru, Karnataka",
    },
    items: [
      { name: "Death By Chocolate", description: "Corner House's legendary rich chocolate sundae.", price: 190 },
      { name: "Hot Chocolate Fudge", description: "Warm chocolate fudge poured over vanilla ice cream.", price: 170 },
      { name: "Strawberry Sundae", description: "Classic sundae with fresh strawberry sauce and nuts.", price: 150 },
      { name: "Mango Milkshake", description: "Thick, seasonal mango milkshake.", price: 120 },
      { name: "Fruit Salad with Ice Cream", description: "Fresh fruit salad topped with a scoop of ice cream.", price: 130 },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const r of restaurants) {
    const { items, ...restaurantData } = r;
    let restaurant = await Restaurant.findOne({ ownerId: r.ownerId });
    if (!restaurant) {
      restaurant = await Restaurant.create(restaurantData);
      console.log(`Created restaurant: ${restaurant.name}`);
    } else {
      console.log(`Restaurant already exists, skipping: ${restaurant.name}`);
      continue;
    }

    for (const item of items) {
      await MenuItems.create({
        ...item,
        restaurantId: restaurant._id,
        image: r.image, // reuse the restaurant's own (real, cuisine-appropriate) photo per item
        isAvailable: true,
      });
    }
    console.log(`  Added ${items.length} menu items`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
