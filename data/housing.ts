export interface HousingListing {
  id: number;
  title: string;
  location: string;
  nearbyCompanies: Array<{
    name: string;
    distance: number; // in miles
  }>;
  price: {
    total: number;
    perRoom?: number;
  };
  type: "Studio" | "1BR" | "2BR" | "3BR" | "4BR";
  bedrooms: number;
  bathrooms: number;
  availableRooms: number;
  dateRange: {
    start: string;
    end: string;
  };
  amenities: string[];
  features: {
    furnished: boolean;
    hasShuttle: boolean;
    inUnitLaundry: boolean;
    parking: boolean;
    gym: boolean;
    pool: boolean;
  };
  images: string[];
  description: string;
  address: string;
  propertyManager: {
    name: string;
    phone: string;
    email: string;
  };
  currentRoommates?: Array<{
    id: number;
    company: string;
    role: string;
  }>;
}

const companies = [
  { name: "Google", location: "Mountain View, CA" },
  { name: "Meta", location: "Menlo Park, CA" },
  { name: "Apple", location: "Cupertino, CA" },
  { name: "LinkedIn", location: "Sunnyvale, CA" },
  { name: "Microsoft", location: "Mountain View, CA" }
];

const locations = [
  {
    city: "Mountain View",
    neighborhoods: ["Downtown", "San Antonio", "Shoreline West"],
    nearbyCompanies: ["Google", "Microsoft", "LinkedIn"]
  },
  {
    city: "Sunnyvale",
    neighborhoods: ["Downtown", "Fair Oaks", "Lakewood"],
    nearbyCompanies: ["LinkedIn", "Google", "Apple"]
  },
  {
    city: "Menlo Park",
    neighborhoods: ["Downtown", "Sharon Heights", "Belle Haven"],
    nearbyCompanies: ["Meta", "Google"]
  },
  {
    city: "Cupertino",
    neighborhoods: ["Downtown", "Rancho Rinconada", "Garden Gate"],
    nearbyCompanies: ["Apple"]
  }
];

const amenities = [
  "Furnished",
  "In-unit Laundry",
  "Gym",
  "Pool",
  "Parking",
  "Rooftop",
  "Package Lockers",
  "Pet Friendly",
  "Bike Storage",
  "EV Charging",
  "24/7 Security",
  "Coworking Space"
];

function generateRandomHousing(count: number): HousingListing[] {
  return Array.from({ length: count }, (_, i) => {
    const location = locations[Math.floor(Math.random() * locations.length)];
    const neighborhood = location.neighborhoods[Math.floor(Math.random() * location.neighborhoods.length)];
    const bedrooms = Math.floor(Math.random() * 3) + 1; // 1-4 bedrooms
    const availableRooms = Math.floor(Math.random() * bedrooms) + 1;
    const basePrice = 2000 + (Math.floor(Math.random() * 2000)); // $2000-$4000

    return {
      id: i + 1,
      title: `${bedrooms}BR Apartment in ${location.city}`,
      location: `${neighborhood}, ${location.city}, CA`,
      nearbyCompanies: location.nearbyCompanies.map(company => ({
        name: company,
        distance: Number((Math.random() * 5).toFixed(1)) // 0-5 miles
      })),
      price: {
        total: basePrice * bedrooms,
        perRoom: basePrice
      },
      type: `${bedrooms}BR`,
      bedrooms,
      bathrooms: bedrooms,
      availableRooms,
      dateRange: {
        start: `2024-05-${Math.floor(Math.random() * 15) + 1}`,
        end: `2024-08-${Math.floor(Math.random() * 15) + 15}`
      },
      amenities: Array.from(
        { length: Math.floor(Math.random() * 5) + 3 },
        () => amenities[Math.floor(Math.random() * amenities.length)]
      ),
      features: {
        furnished: Math.random() > 0.5,
        hasShuttle: Math.random() > 0.7,
        inUnitLaundry: Math.random() > 0.3,
        parking: Math.random() > 0.4,
        gym: Math.random() > 0.5,
        pool: Math.random() > 0.6
      },
      images: Array(4).fill("/placeholder.jpg"),
      description: `Modern ${bedrooms} bedroom apartment in ${location.city}. Close to ${location.nearbyCompanies.join(", ")}. ${availableRooms} room(s) available.`,
      address: `${Math.floor(Math.random() * 1000) + 100} ${neighborhood} St`,
      propertyManager: {
        name: "Property Manager",
        phone: "(650) 555-0123",
        email: "leasing@example.com"
      },
      currentRoommates: bedrooms - availableRooms > 0 ? Array.from(
        { length: bedrooms - availableRooms },
        (_, i) => ({
          id: i + 1,
          company: location.nearbyCompanies[Math.floor(Math.random() * location.nearbyCompanies.length)],
          role: "Software Engineering Intern"
        })
      ) : undefined
    };
  });
}

export const housingListings = generateRandomHousing(50); 