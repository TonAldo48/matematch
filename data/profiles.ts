export interface InternProfile {
  id: number;
  name: string;
  initials: string;
  company: string;
  role: string;
  location: string;
  dates: string;
  budget: string;
  preferences: string[];
  matchScore?: number;
  school: string;
  year: string;
  bio?: string;
}

// Export the constants
export const companies = [
  { name: "Google", locations: ["Mountain View, CA", "New York, NY", "Seattle, WA"] },
  { name: "Microsoft", locations: ["Redmond, WA", "Bellevue, WA"] },
  { name: "Meta", locations: ["Menlo Park, CA", "Seattle, WA", "New York, NY"] },
  { name: "Apple", locations: ["Cupertino, CA"] },
  { name: "Amazon", locations: ["Seattle, WA", "Bellevue, WA", "New York, NY"] },
  { name: "Uber", locations: ["San Francisco, CA"] },
  { name: "LinkedIn", locations: ["Sunnyvale, CA"] },
  { name: "Salesforce", locations: ["San Francisco, CA"] },
  { name: "Twitter", locations: ["San Francisco, CA"] },
  { name: "Adobe", locations: ["San Jose, CA"] }
];

export const roles = [
  "Software Engineering Intern",
  "Product Management Intern",
  "Data Science Intern",
  "Machine Learning Intern",
  "Frontend Engineering Intern",
  "Backend Engineering Intern",
  "Full Stack Engineering Intern",
  "DevOps Intern",
  "Security Engineering Intern",
  "Mobile Engineering Intern"
];

export const schools = [
  "Stanford University",
  "MIT",
  "UC Berkeley",
  "Georgia Tech",
  "Carnegie Mellon",
  "University of Washington",
  "University of Illinois",
  "University of Michigan",
  "Purdue University",
  "Cornell University",
  "Howard University",
  "Morehouse College",
  "Spelman College",
  "Florida A&M University",
  "North Carolina A&T"
];

export const preferences = [
  "Early Bird",
  "Night Owl",
  "Non-smoker",
  "Clean",
  "Gym-goer",
  "Pet-friendly",
  "Vegetarian",
  "Social",
  "Quiet",
  "Music Lover",
  "Cook",
  "420 Friendly",
  "No Alcohol",
  "Minimalist",
  "Student Athlete"
];

// Generate random date range between May and August
function generateDates() {
  const startMonth = 5; // May
  const startDay = Math.floor(Math.random() * 15) + 1; // 1-15
  const endMonth = 8; // August
  const endDay = Math.floor(Math.random() * 15) + 15; // 15-30
  return `May ${startDay} - Aug ${endDay}, 2024`;
}

// Generate random budget range
function generateBudget() {
  const min = Math.floor(Math.random() * 500) + 1500; // 1500-2000
  const max = min + Math.floor(Math.random() * 500) + 500; // min + 500-1000
  return `${min}-${max}`;
}

// Generate random preferences (2-4 preferences)
function generatePreferences() {
  const numPreferences = Math.floor(Math.random() * 3) + 2; // 2-4
  const shuffled = [...preferences].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numPreferences);
}

// Generate initials from name
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('');
}

// First names and last names for diverse representation
const firstNames = [
  "Aisha", "Brandon", "Carlos", "Diana", "Elena", "Francisco", "Grace", "Hassan",
  "India", "Jamal", "Kai", "Luna", "Miguel", "Nina", "Omar", "Priya", "Quan",
  "Rosa", "Sanjay", "Tara", "Umar", "Victoria", "Wei", "Xiomara", "Yuki", "Zara"
];

const lastNames = [
  "Anderson", "Brown", "Chen", "Davis", "Evans", "Ferguson", "Garcia", "Huang",
  "Ibrahim", "Johnson", "Kim", "Lee", "Martinez", "Nguyen", "Patel", "Quinn",
  "Rodriguez", "Smith", "Thompson", "Ueda", "Vazquez", "Wang", "Xu", "Yang", "Zhang"
];

// Generate 100 profiles
export const profiles: InternProfile[] = Array.from({ length: 100 }, (_, i) => {
  const company = companies[Math.floor(Math.random() * companies.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;

  return {
    id: i + 1,
    name,
    initials: getInitials(name),
    company: company.name,
    role: roles[Math.floor(Math.random() * roles.length)],
    location: company.locations[Math.floor(Math.random() * company.locations.length)],
    dates: generateDates(),
    budget: generateBudget(),
    preferences: generatePreferences(),
    school: schools[Math.floor(Math.random() * schools.length)],
    year: ["2024", "2025", "2026"][Math.floor(Math.random() * 3)],
    bio: `${firstName} is a ${["rising sophomore", "rising junior", "rising senior"][Math.floor(Math.random() * 3)]} studying Computer Science at ${schools[Math.floor(Math.random() * schools.length)]}.`
  };
}); 