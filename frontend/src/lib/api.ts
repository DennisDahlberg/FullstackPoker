import axios from "axios";
import type { GameActionPayload } from "@/types/GameState";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;    
  }
  return config;
  },
  (error) => {
      return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;


      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${backendUrl}/auth/refresh`, {
          refreshToken,
        });
        console.log('Token refreshed successfully', response.data);
        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        const publicPaths = ['/', '/login', '/register'];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
)

export const api = {

  client: apiClient,

  game: {
    async initGame() {
      const response = await apiClient.get(`${backendUrl}/game/start`);
      return response.data;
    },
    async playerAction(action:string, payload?:GameActionPayload) {
      const response = await apiClient.post(`${backendUrl}/game/action`, {
        action: action,
        amount: payload?.amount
      });
      return response.data;
    },
    async botAction() {
      const response = await apiClient.post(`${backendUrl}/game/bot-action`);
      return response.data;
    },
    async startNewRound() {
      const response = await apiClient.post(`${backendUrl}/game/new-round`);
      return response.data;
    }
  },

  friends: {
    async findUsers(query: string) {
      try {
        const response = await apiClient.get(`${backendUrl}/friends/find`, {
          params: { query }
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || 'Failed to search users';
        }
        throw 'An error occurred while searching users';
      }
    },
    async sendFriendRequest(username: string) {
      try {
        const response = await apiClient.post(`${backendUrl}/friends/send`, 
          JSON.stringify(username),
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || 'Failed to send friend request';
        }
        throw 'An error occurred while sending friend request';
      }
    }
  },

  auth: {
    async login(email:string, password:string) {
      try {
        const response = await apiClient.post(`${backendUrl}/auth/login`, {
          email,
          password,
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        console.log('Login response:', response.data);

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || 'Invalid login credentials';
        }
        throw 'An error occurred during login';
      }
    },
    async register(email:string, username:string, password:string) {
        try {
          const response = await apiClient.post(`${backendUrl}/auth/register`, {
            email,
            username,
            password,
          });

          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          return response.data;
        } catch (err) {
          if (axios.isAxiosError(err)) {
            throw err.response?.data || 'Registration failed';
          }
          throw 'An error occurred during registration';
        }
    },
    async getProfile() {
      try {
        const response = await apiClient.get(`${backendUrl}/auth/profile`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || 'Failed to fetch profile';
        }
        throw 'An error occurred while fetching profile';
      }
    },
    async refreshToken() {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      try {
        const response = await axios.post(`${backendUrl}/auth/refresh`, {
          refreshToken,
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
      } catch {
        return null;
      }
    }
  }
};