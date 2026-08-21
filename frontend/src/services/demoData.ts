export const DEMO_OPTIMIZATION_RESULT = {
  score: 94,
  breakdown: {
    skill: 96,
    availability: 100,
    location: 91,
    reliability: 95,
    budget: 89,
  },
  budget: {
    total: 25000,
    used: 23500,
    remaining: 1500
  },
  crew: [
    {
      role: 'Photographer',
      quantity: 2,
      selected: {
        id: 'w1',
        name: 'Priya Sharma & Co.',
        rating: 4.8,
        reliability: 96,
        distance: 2.4,
        price: 8000,
        status: 'Available',
        reasons: ['Highest skill match', 'Within budget', 'Exceptional reliability']
      },
      backups: [
        { id: 'w2', name: 'Sneha Patel Studio', rating: 4.6, price: 7500 },
        { id: 'w3', name: 'Vikram Singh', rating: 4.5, price: 8500 }
      ]
    },
    {
      role: 'Security',
      quantity: 3,
      selected: {
        id: 'w6',
        name: 'Rahul Verma Team',
        rating: 4.9,
        reliability: 99,
        distance: 1.2,
        price: 9000,
        status: 'Available',
        reasons: ['Team pricing discount', 'Extremely reliable', 'Local to venue']
      },
      backups: [
        { id: 'w7', name: 'SecureForce Agency', rating: 4.5, price: 10500 }
      ]
    },
    {
      role: 'Stage Manager',
      quantity: 1,
      selected: {
        id: 'w4',
        name: 'Arjun Desai',
        rating: 4.7,
        reliability: 98,
        distance: 5.1,
        price: 6500,
        status: 'Available',
        reasons: ['Closest available', 'Top rated experience']
      },
      backups: [
        { id: 'w5', name: 'Karan Reddy', rating: 4.4, price: 6000 }
      ]
    }
  ]
};

export const CASCADE_DEMO_RESULT = {
  score: 93,
  breakdown: {
    skill: 94,
    availability: 100,
    location: 88,
    reliability: 96,
    budget: 86,
  },
  budget: {
    total: 25000,
    used: 24000,
    remaining: 1000
  },
  crew: [
    {
      role: 'Photographer',
      quantity: 2,
      selected: {
        id: 'w2',
        name: 'Sneha Patel Studio',
        rating: 4.6,
        reliability: 94,
        distance: 4.2,
        price: 7500,
        status: 'Available',
        reasons: ['Promoted from backup', 'Saves ₹500 for other roles']
      },
      backups: [
        { id: 'w3', name: 'Vikram Singh', rating: 4.5, price: 8500 }
      ]
    },
    {
      role: 'Security',
      quantity: 3,
      selected: {
        id: 'w6',
        name: 'Rahul Verma Team',
        rating: 4.9,
        reliability: 99,
        distance: 1.2,
        price: 9000,
        status: 'Available',
        reasons: ['Retained from original plan']
      },
      backups: [
        { id: 'w7', name: 'SecureForce Agency', rating: 4.5, price: 10500 }
      ]
    },
    {
      role: 'Stage Manager',
      quantity: 1,
      selected: {
        id: 'w8',
        name: 'Meera Creations (Stage Dept)',
        rating: 4.8,
        reliability: 99,
        distance: 6.0,
        price: 7500, 
        status: 'Available',
        reasons: ['Upgraded due to budget reallocation', 'Higher reliability to compensate']
      },
      backups: [
        { id: 'w5', name: 'Karan Reddy', rating: 4.4, price: 6000 }
      ]
    }
  ]
};
