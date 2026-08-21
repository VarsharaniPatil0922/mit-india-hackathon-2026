import { WorkerProfile } from '../types';

// Some common coordinates in Pune to simulate proximity
const LOCATIONS = [
  { name: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
  { name: 'Kalyani Nagar, Pune', lat: 18.5482, lng: 73.9011 },
  { name: 'Wakad, Pune', lat: 18.5987, lng: 73.7688 },
  { name: 'Viman Nagar, Pune', lat: 18.5665, lng: 73.9122 },
  { name: 'Hadapsar, Pune', lat: 18.5089, lng: 73.9259 },
  { name: 'Shivajinagar, Pune', lat: 18.5314, lng: 73.8446 },
];

const ROLES = [
  'Photographer',
  'Videographer',
  'Sound Engineer',
  'Security',
  'Decorator',
  'Emcee',
  'Catering',
];

const firstNames = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Aditya', 'Arjun', 'Sai', 'Mira', 'Riya', 'Karan', 'Priya', 'Rahul', 'Neha', 'Vikram'];
const lastNames = ['Sharma', 'Patil', 'Deshmukh', 'Joshi', 'Kulkarni', 'Deshpande', 'Gaikwad', 'Jadhav', 'Shinde', 'Pawar'];

// Helper to generate a date offset by 'days' from today
const getDateString = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const MOCK_WORKERS: WorkerProfile[] = Array.from({ length: 40 }).map((_, i) => {
  const fName = firstNames[i % firstNames.length];
  const lName = lastNames[i % lastNames.length];
  const role = ROLES[i % ROLES.length];
  const location = LOCATIONS[i % LOCATIONS.length];
  
  // Random price between 1000 and 15000 based on role roughly
  const basePrice = role === 'Photographer' || role === 'Videographer' ? 5000 : 
                    role === 'Security' ? 1000 : 
                    role === 'Sound Engineer' ? 4000 : 3000;
  
  const priceMin = basePrice + Math.floor(Math.random() * 2000);
  const priceMax = priceMin + 2000 + Math.floor(Math.random() * 5000);

  return {
    id: `worker-${i + 1}`,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
    userType: 'worker',
    name: `${fName} ${lName}`,
    skillCategories: [role, ...(Math.random() > 0.7 ? [ROLES[(i + 1) % ROLES.length]] : [])], // 30% chance of second skill
    priceMin,
    priceMax,
    location: location.name,
    latitude: location.lat + (Math.random() * 0.04 - 0.02), // Slight jitter
    longitude: location.lng + (Math.random() * 0.04 - 0.02),
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)), // 3.5 to 5.0
    reliabilityScore: Number((70 + Math.random() * 30).toFixed(0)), // 70 to 100
    availableDates: [
      getDateString(0), getDateString(1), getDateString(2), getDateString(3), getDateString(4), getDateString(5)
    ].filter(() => Math.random() > 0.2), // 80% chance of being available on any given day
  };
});
