import mongoose from "mongoose";
import dotenv from "dotenv";
import { City } from "../models/city.models.js";
import { Activity } from "../models/activity.models.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/globetrotter";

const citiesData = [
  {
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "A bustling metropolis blending ultra-modern neon skyscrapers with historic temples and world-class gastronomy.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
    costIndex: 75,
    popularity: 98,
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    description: "Japan’s cultural heart, famous for classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
    costIndex: 68,
    popularity: 94,
    latitude: 35.0116,
    longitude: 135.7681,
  },
  {
    name: "Osaka",
    country: "Japan",
    region: "Asia",
    description: "Known for its vibrant street food, modern architecture, nightlife, and historic Osaka Castle.",
    image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1000&q=80",
    costIndex: 65,
    popularity: 90,
    latitude: 34.6937,
    longitude: 135.5023,
  },
  {
    name: "Paris",
    country: "France",
    region: "Europe",
    description: "France’s capital, a major European city and global center for art, fashion, gastronomy and culture.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
    costIndex: 85,
    popularity: 99,
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    name: "Rome",
    country: "Italy",
    region: "Europe",
    description: "The Eternal City boasts nearly 3,000 years of globally influential art, architecture and culture.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
    costIndex: 72,
    popularity: 96,
    latitude: 41.9028,
    longitude: 12.4964,
  },
  {
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: "The cosmopolitan capital of Spain’s Catalonia region, known for its art and architecture including Gaudí’s Sagrada Família.",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1000&q=80",
    costIndex: 65,
    popularity: 92,
    latitude: 41.3851,
    longitude: 2.1734,
  },
  {
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    description: "A 21st-century city with history stretching back to Roman times, home to iconic landmarks and diverse neighborhoods.",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
    costIndex: 88,
    popularity: 97,
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    description: "Famous for its artistic heritage, elaborate canal system and narrow houses with gabled facades.",
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1000&q=80",
    costIndex: 78,
    popularity: 89,
    latitude: 52.3676,
    longitude: 4.9041,
  },
  {
    name: "Prague",
    country: "Czech Republic",
    region: "Europe",
    description: "The City of a Hundred Spires, known for Old Town Square, gothic churches and the medieval Astronomical Clock.",
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1000&q=80",
    costIndex: 45,
    popularity: 87,
    latitude: 50.0755,
    longitude: 14.4378,
  },
  {
    name: "Reykjavik",
    country: "Iceland",
    region: "Europe",
    description: "Iceland’s coastal capital, famous for the geothermal spa Blue Lagoon and views of the Northern Lights.",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1000&q=80",
    costIndex: 92,
    popularity: 85,
    latitude: 64.1466,
    longitude: -21.9426,
  },
  {
    name: "New York City",
    country: "United States",
    region: "North America",
    description: "The Big Apple comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean, a global cultural hub.",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80",
    costIndex: 95,
    popularity: 99,
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    name: "Vancouver",
    country: "Canada",
    region: "North America",
    description: "A bustling west coast seaport surrounded by majestic mountains and scenic ocean landscapes.",
    image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1000&q=80",
    costIndex: 80,
    popularity: 84,
    latitude: 49.2827,
    longitude: -123.1207,
  },
  {
    name: "Bangkok",
    country: "Thailand",
    region: "Asia",
    description: "Thailand’s capital city, famous for ornate shrines, vibrant street life, canal networks and night markets.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80",
    costIndex: 35,
    popularity: 95,
    latitude: 13.7563,
    longitude: 100.5018,
  },
  {
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    description: "An Indonesian island famous for iconic rice paddies, volcanic mountains, coral reefs and spiritual sanctuaries.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
    costIndex: 38,
    popularity: 96,
    latitude: -8.4095,
    longitude: 115.1889,
  },
  {
    name: "Singapore",
    country: "Singapore",
    region: "Asia",
    description: "A global financial center with a tropical climate and multicultural population, famous for Marina Bay and futuristic gardens.",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
    costIndex: 86,
    popularity: 93,
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    description: "Known for luxury shopping, ultramodern architecture and a lively night scene. Burj Khalifa dominates the skyline.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
    costIndex: 82,
    popularity: 94,
    latitude: 25.2048,
    longitude: 55.2708,
  },
  {
    name: "Istanbul",
    country: "Turkey",
    region: "Europe/Asia",
    description: "A major city in Turkey that straddles Europe and Asia across the Bosphorus Strait.",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
    costIndex: 40,
    popularity: 91,
    latitude: 41.0082,
    longitude: 28.9784,
  },
  {
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "Capital of New South Wales, best known for its harbourfront Opera House, Royal Botanic Garden and Bondi Beach.",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80",
    costIndex: 82,
    popularity: 93,
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    name: "Cairo",
    country: "Egypt",
    region: "Africa",
    description: "Egypt’s sprawling capital set on the Nile River, famous for the Giza Pyramid complex and Egyptian Museum.",
    image: "https://images.unsplash.com/photo-1572252821143-035a024856f2?auto=format&fit=crop&w=1000&q=80",
    costIndex: 30,
    popularity: 88,
    latitude: 30.0444,
    longitude: 31.2357,
  },
  {
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    description: "A port city on South Africa’s southwest coast on a peninsula beneath imposing Table Mountain.",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80",
    costIndex: 48,
    popularity: 89,
    latitude: -33.9249,
    longitude: 18.4241,
  },
  {
    name: "Rio de Janeiro",
    country: "Brazil",
    region: "South America",
    description: "Famed for Copacabana beach, Mount Corcovado’s Christ the Redeemer statue and vibrant Carnival festival.",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1000&q=80",
    costIndex: 42,
    popularity: 91,
    latitude: -22.9068,
    longitude: -43.1729,
  },
];

const activitiesTemplate: Record<string, any[]> = {
  Tokyo: [
    { name: "Senso-ji Temple & Asakusa Walking Tour", type: "Culture", cost: 500, durationMinutes: 120, popularity: 95, image: "https://images.unsplash.com/photo-1583833423011-50794b150937?auto=format&fit=crop&w=800&q=80", description: "Explore Tokyo’s oldest Buddhist temple and shop along the vibrant Nakamise shopping street." },
    { name: "Tsukiji Outer Market Food Tasting", type: "Food", cost: 1800, durationMinutes: 90, popularity: 96, image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80", description: "Sample fresh sushi, tamagoyaki, and street seafood at the world-famous food market." },
    { name: "Shibuya Crossing & Hachiko Statue", type: "Sightseeing", cost: 0, durationMinutes: 45, popularity: 99, image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80", description: "Experience the world’s busiest pedestrian crossing and snap photos with Hachiko." },
    { name: "teamLab Planets Digital Art Exhibition", type: "Photography", cost: 2400, durationMinutes: 120, popularity: 97, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80", description: "Walk through body-immersive digital art spaces filled with water, light, and flowers." },
  ],
  Kyoto: [
    { name: "Fushimi Inari Shrine Thousand Torii Gates", type: "Sightseeing", cost: 0, durationMinutes: 150, popularity: 98, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", description: "Hike up Mount Inari through thousands of vermilion torii gates." },
    { name: "Arashiyama Bamboo Grove & Monkey Park", type: "Nature", cost: 400, durationMinutes: 120, popularity: 94, image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", description: "Stroll through towering bamboo stalks and visit wild monkeys atop the mountain." },
    { name: "Traditional Matcha Tea Ceremony in Gion", type: "Culture", cost: 1600, durationMinutes: 60, popularity: 91, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80", description: "Learn the meditative art of preparing authentic green tea in a traditional teahouse." },
  ],
  Osaka: [
    { name: "Dotonbori Street Food & Neon Lights", type: "Food", cost: 1200, durationMinutes: 120, popularity: 96, image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80", description: "Try Takoyaki and Okonomiyaki while taking in the iconic Glico Running Man neon sign." },
    { name: "Osaka Castle & Park Exploration", type: "Sightseeing", cost: 450, durationMinutes: 90, popularity: 93, image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=800&q=80", description: "Discover 16th-century Japanese fortress history amidst beautiful castle gardens." },
  ],
  Paris: [
    { name: "Eiffel Tower Summit Access & Champagne", type: "Sightseeing", cost: 2800, durationMinutes: 120, popularity: 99, image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80", description: "Ascend Paris’s icon for panoramic views over the Seine and city rooftops." },
    { name: "Louvre Museum Mona Lisa Guided Highlights Tour", type: "Culture", cost: 2200, durationMinutes: 180, popularity: 98, image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80", description: "Marvel at masterworks of world art including the Mona Lisa and Venus de Milo." },
    { name: "Montmartre Artists Square & Sacré-Cœur Sunset", type: "Photography", cost: 0, durationMinutes: 90, popularity: 92, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", description: "Wander cobbled Bohemian streets and enjoy sunset views over Paris from Sacré-Cœur." },
  ],
  Rome: [
    { name: "Colosseum & Roman Forum Priority Entry", type: "Sightseeing", cost: 2000, durationMinutes: 180, popularity: 98, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80", description: "Step onto the arena floor of gladiator combat and walk through ancient Rome’s center." },
    { name: "Vatican Museums & Sistine Chapel Tour", type: "Culture", cost: 2500, durationMinutes: 180, popularity: 97, image: "https://images.unsplash.com/photo-1548625361-185888277259?auto=format&fit=crop&w=800&q=80", description: "Admire Michelangelo’s ceiling frescoes and Renaissance art collections." },
    { name: "Trastevere Pasta & Gelato Tasting Crawl", type: "Food", cost: 1500, durationMinutes: 120, popularity: 95, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", description: "Indulge in authentic Cacio e Pepe, Roman pizza, and artisanal gelato." },
  ],
};

const generateDefaultActivities = (city: any) => {
  return [
    {
      name: `${city.name} Historical City Center Walk`,
      type: "Sightseeing",
      cost: 0,
      durationMinutes: 120,
      popularity: 88,
      image: city.image,
      description: `Guided walking tour through the heart of ${city.name}, discovering local landmarks and architectural gems.`,
    },
    {
      name: `${city.name} Local Culinary Experience`,
      type: "Food",
      cost: 1500,
      durationMinutes: 90,
      popularity: 90,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      description: `Taste popular regional specialties and street foods of ${city.name}.`,
    },
    {
      name: `${city.name} Scenic Viewpoint & Sunset Photo Spot`,
      type: "Photography",
      cost: 300,
      durationMinutes: 60,
      popularity: 86,
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
      description: `Capture stunning panoramic photos of ${city.name} during golden hour.`,
    },
  ];
};

const seed = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    await City.deleteMany({});
    await Activity.deleteMany({});

    console.log("Cleared existing cities and activities database.");

    const createdCities = await City.insertMany(citiesData);
    console.log(`Inserted ${createdCities.length} cities.`);

    let allActivities: any[] = [];

    for (const city of createdCities) {
      const cleanKey = city.name.replace(/\s+/g, "");
      const customList = activitiesTemplate[city.name] || activitiesTemplate[cleanKey];
      const listToUse = customList && customList.length >= 2 ? customList : generateDefaultActivities(city);

      for (const act of listToUse) {
        allActivities.push({
          ...act,
          cityId: city._id,
        });
      }
    }

    const createdActivities = await Activity.insertMany(allActivities);
    console.log(`Inserted ${createdActivities.length} activities.`);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seed();
