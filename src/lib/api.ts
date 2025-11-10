const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  message: string;
  status?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        const apiError: ApiError = {
          message: error.message || `Request failed with status ${response.status}`,
          status: response.status,
        };
        // Log error in development only
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', apiError);
        }
        throw apiError;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // Log network errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Network error - is the backend running?', error);
        }
        throw {
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string) {
    return this.request<{ accessToken: string; user: { id: string; email: string; name: string; avatar?: string } }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      },
      );
  }

  async login(email: string, password: string) {
    return this.request<{ accessToken: string; user: { id: string; email: string; name: string; avatar?: string } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );
  }

  async firebaseAuth(idToken: string) {
    return this.request<{ accessToken: string; user: { id: string; email: string; name: string; avatar?: string } }>(
      '/auth/firebase',
      {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      },
    );
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken() {
    return this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<{ id: string; email: string; name: string; avatar?: string }>('/auth/me');
  }

  // Board endpoints
  async getBoards() {
    return this.request<Array<{ id: string; name: string; userId: string; createdAt: string }>>('/boards');
  }

  async createBoard(name: string) {
    return this.request<{ id: string; name: string; userId: string; createdAt: string }>(
      '/boards',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
      );
  }

  async getCurrentBoard() {
    return this.request<{
      id: string;
      name: string;
      userId: string;
      columns: Array<{
        id: string;
        name: string;
        boardId: string;
        position: number;
        cards: Array<{
          id: string;
          title: string;
          description: string | null;
          columnId: string;
          position: number;
        }>;
      }>;
    }>('/boards/current');
  }

  async getBoard(boardId: string) {
    return this.request<{
      id: string;
      name: string;
      userId: string;
      columns: Array<{
        id: string;
        name: string;
        boardId: string;
        position: number;
        cards: Array<{
          id: string;
          title: string;
          description: string | null;
          columnId: string;
          position: number;
        }>;
      }>;
    }>(`/boards/${boardId}`);
  }

  async updateBoard(boardId: string, name: string) {
    return this.request<{ id: string; name: string }>(`/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteBoard(boardId: string) {
    return this.request(`/boards/${boardId}`, { method: 'DELETE' });
  }

  // Column endpoints
  async createColumn(boardId: string, name: string) {
    return this.request<{ id: string; name: string; boardId: string; position: number }>(
      `/boards/${boardId}/columns`,
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
      );
  }

  async updateColumn(columnId: string, name: string) {
    return this.request<{ id: string; name: string }>(`/boards/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteColumn(columnId: string) {
    return this.request(`/boards/columns/${columnId}`, { method: 'DELETE' });
  }

  // Card endpoints
  async createCard(columnId: string, title: string, description?: string) {
    return this.request<{ id: string; title: string; description: string | null; columnId: string; position: number }>(
      `/columns/${columnId}/cards`,
      {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      },
      );
  }

  async updateCard(cardId: string, title: string, description?: string) {
    return this.request<{ id: string; title: string; description: string | null }>(
      `/cards/${cardId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ title, description }),
      },
      );
  }

  async deleteCard(cardId: string) {
    return this.request(`/cards/${cardId}`, { method: 'DELETE' });
  }

  async moveCard(cardId: string, columnId: string, position: number) {
    return this.request(`/cards/${cardId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ columnId, position }),
    });
  }
}

export const api = new ApiClient();

