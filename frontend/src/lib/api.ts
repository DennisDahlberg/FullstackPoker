import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function isTokenExpired(token: string) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const api = {
  auth: {
    async login(email:string, password:string) {
      try {
        const response = await axios.post(`${backendUrl}/auth/login`, {
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
    async register(email:string, password:string) {
        try {
          const response = await axios.post(`${backendUrl}/auth/register`, {
            email,
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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
      console.log(refreshToken);
    }
  }
};