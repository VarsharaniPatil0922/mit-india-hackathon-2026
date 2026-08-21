export const API_BASE = 'http://localhost:8000/api';

export const authApi = {
  login: async (email: string, password: string, type: 'organizer' | 'worker') => {
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
  },
  
  register: async (email: string, password: string, type: 'organizer' | 'worker') => {
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

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'API request failed');
  }
  return data;
};

export const paymentsApi = {
  createPayment: async (assignment_id: number, token: string) => {
    const response = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ assignment_id })
    });
    return handleResponse(response);
  },
  
  payEscrow: async (payment_id: number, token: string) => {
    const response = await fetch(`${API_BASE}/payments/${payment_id}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  releasePayment: async (payment_id: number, token: string) => {
    const response = await fetch(`${API_BASE}/payments/${payment_id}/release`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  getEventPayments: async (event_id: string, token: string) => {
    const response = await fetch(`${API_BASE}/events/${event_id}/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  getWorkerPayments: async (token: string) => {
    const response = await fetch(`${API_BASE}/worker/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};
