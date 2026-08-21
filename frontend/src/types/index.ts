export type UserType = 'organizer' | 'worker';

export interface User {
  id: string;
  email: string;
  userType: UserType;
  name: string;
}

export interface WorkerProfile extends User {
  userType: 'worker';
  skillCategories: string[];
  priceMin: number;
  priceMax: number;
  location: string;
  latitude: number;
  longitude: number;
  rating: number;
  reliabilityScore: number;
  // Simplified availability for mock: an array of available dates in YYYY-MM-DD
  availableDates: string[];
}

export interface EventRole {
  id: string;
  roleName: string;
  quantityNeeded: number;
}

export interface AppEvent {
  id: string;
  organizerId: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  proximityRadius: number;
  budget: number;
  status: 'draft' | 'matching' | 'confirmed' | 'completed';
  roles: EventRole[];
}

export interface CrewAssignment {
  id: string;
  eventId: string;
  roleId: string;
  workerId: string;
  status: 'pending_confirmation' | 'confirmed' | 'declined';
  priceAgreed: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  eventId: string;
  isRead: boolean;
  createdAt: string;
}
