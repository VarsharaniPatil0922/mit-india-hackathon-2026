export const API_BASE = 'http://localhost:8000/api';

export const authApi = {
  login: async (email: string, password: string, type: 'organizer' | 'worker') => {
    // Mock login with a delay for frontend MVP/demo mode
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access_token: 'demo-jwt-token-12345',
          user_type: type,
        });
      }, 700);
    });

    // Original real fetch code for later:
    /*
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, user_type: type })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Authentication failed');
    }
    return data;
    */
  },
  
  register: async (email: string, password: string, type: 'organizer' | 'worker') => {
    // Mock register with a delay for frontend MVP/demo mode
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access_token: 'demo-jwt-token-12345',
          user_type: type,
        });
      }, 700);
    });

    // Original real fetch code for later:
    /*
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, user_type: type })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Authentication failed');
    }
    return data;
    */
  }
};

export const eventsApi = {
  createEvent: async (eventData: any, token: string) => {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create event';
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Format Pydantic validation errors nicely
            errorMessage = errorData.detail.map((e: any) => `${e.loc.join('.')} - ${e.msg}`).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        }
      } catch (e) {
        // Fallback if parsing fails
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  }
};
