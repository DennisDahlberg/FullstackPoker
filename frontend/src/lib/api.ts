import type { CreateBotDto, UpdateBotDto } from "@/types/Bot";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${backendUrl}/auth/refresh`, {
          refreshToken,
        });
        console.log("Token refreshed successfully", response.data);
        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        const publicPaths = ["/", "/login", "/register"];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const api = {
  client: apiClient,

  game: {
    async initializeGame(tableId: number, botIds: number[]) {
      try {
        const response = await apiClient.post(`${backendUrl}/game/start`, {
          tableId,
          botIds,
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data.message || "Failed to initialize game";
        }
        throw "An error occurred while initializing game";
      }
    },
  },

  friends: {
    async findUsers(query: string) {
      try {
        const response = await apiClient.get(`${backendUrl}/friends/find`, {
          params: { query },
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to search users";
        }
        throw "An error occurred while searching users";
      }
    },
    async sendFriendRequest(username: string) {
      try {
        const response = await apiClient.post(
          `${backendUrl}/friends/send`,
          JSON.stringify(username),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to send friend request";
        }
        throw "An error occurred while sending friend request";
      }
    },
    async getFriends() {
      try {
        const response = await apiClient.get(`${backendUrl}/friends`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch friends";
        }
        throw "An error occurred while fetching friends";
      }
    },
    async getFriendRequests() {
      try {
        const response = await apiClient.get(`${backendUrl}/friends/requests`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch friend requests";
        }
        throw "An error occurred while fetching friend requests";
      }
    },
    async acceptFriendRequest(requestId: number) {
      try {
        const response = await apiClient.post(
          `${backendUrl}/friends/accept/${requestId}`,
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to accept friend request";
        }
        throw "An error occurred while accepting friend request";
      }
    },
    async rejectFriendRequest(requestId: number) {
      try {
        const response = await apiClient.post(
          `/friends/reject/${requestId}`,
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to reject friend request";
        }
        throw "An error occurred while rejecting friend request";
      }
    },
    async removeFriend(friendId: string) {
      try {
        const response = await apiClient.delete(
          `/friends/${friendId}`,
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to remove friend";
        }
        throw "An error occurred while removing friend";
      }
    },
  },

  chat: {
    async getMessages(friendId: string) {
      try {
        const response = await apiClient.get(`/chat/${friendId}`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch messages";
        }
        throw "An error occurred while fetching messages";
      }
    },
  },

  lobby: {
    async getPendingInvites() {
      try {
        const response = await apiClient.get(`${backendUrl}/lobby/invites`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch game invites";
        }
        throw "An error occurred while fetching game invites";
      }
    },
    async acceptInvite(inviteId: string) {
      try {
        const response = await apiClient.post(
          `${backendUrl}/lobby/invites/${inviteId}/accept`,
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to accept invite";
        }
        throw "An error occurred while accepting invite";
      }
    },
    async declineInvite(inviteId: string) {
      try {
        const response = await apiClient.post(
          `${backendUrl}/lobby/invites/${inviteId}/decline`,
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to decline invite";
        }
        throw "An error occurred while declining invite";
      }
    },
  },

  bots: {
    async getBotProfiles() {
      try {
        const response = await apiClient.get(`${backendUrl}/bot`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch bot profiles";
        }
        throw "An error occurred while fetching bot profiles";
      }
    },

    async createBot(bot: CreateBotDto) {
      try {
        const formData = new FormData();
        formData.append("username", bot.username);
        formData.append("description", bot.description);
        formData.append("playStyle", bot.playStyle);
        formData.append("skillLevel", bot.skillLevel);
        if (bot.profileImage) {
          formData.append("profileImage", bot.profileImage);
        }

        const response = await apiClient.post(`/bot`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to create bot";
        }
        throw "An error occurred while creating bot";
      }
    },

    async updateBot(bot: UpdateBotDto) {
      try {
        const formData = new FormData();
        formData.append("id", bot.id.toString());
        formData.append("username", bot.username);
        formData.append("description", bot.description);
        formData.append("playStyle", bot.playStyle);
        formData.append("skillLevel", bot.skillLevel);
        if (bot.profileImage) {
          formData.append("profileImage", bot.profileImage);
        }

        const response = await apiClient.put(`/bot/${bot.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to update bot";
        }
        throw "An error occurred while updating bot";
      }
    },

    async deleteBot(botId: number) {
      try {
        const response = await apiClient.delete(`/bot/${botId}`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to delete bot";
        }
        throw "An error occurred while deleting bot";
      }
    },
  },

  tableConfigs: {
    async getTableConfigs() {
      try {
        const response = await apiClient.get(`${backendUrl}/table`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch table configurations";
        }
        throw "An error occurred while fetching table configurations";
      }
    },
  },

  statistics: {
    async getGameHistory(page: number, pageSize: number) {
      try {
        const response = await apiClient.get(
          `${backendUrl}/statistic/history`,
          {
            params: { page, pageSize },
          },
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch game history";
        }
        throw "An error occurred while fetching game history";
      }
    },

    async getSummary() {
      try {
        const response = await apiClient.get(`/statistic/summary`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch statistics summary";
        }
        throw "An error occurred while fetching statistics summary";
      }
    },
  },

  auth: {
    async login(email: string, password: string) {
      try {
        const response = await apiClient.post(`${backendUrl}/auth/login`, {
          email,
          password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        console.log("Login response:", response.data);

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Invalid login credentials";
        }
        throw "An error occurred during login";
      }
    },
    async register(email: string, username: string, password: string) {
      try {
        const response = await apiClient.post(`${backendUrl}/auth/register`, {
          email,
          username,
          password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Registration failed";
        }
        throw "An error occurred during registration";
      }
    },
    async updatePassword(
      currentPassword: string,
      newPassword: string,
      newPasswordConfirmation: string,
    ) {
      try {
        const response = await apiClient.put(`/auth/password`, {
          currentPassword,
          newPassword,
          newPasswordConfirmation,
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to update password";
        }
        throw "An error occurred while updating password";
      }
    },
    async updateUsername(username: string) {
      try {
        const response = await apiClient.put(`/auth/username`, 
          JSON.stringify(username),
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to update username";
        }
        throw "An error occurred while updating username";
      }
    },
    async updateEmail(email: string) {
      try {
        const response = await apiClient.put(`/auth/email`, 
          JSON.stringify(email),
        );
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to update email";
        }
        throw "An error occurred while updating email";
      }
    },
    async updateProfileImage(profileImage: File) {
      try {
        const formData = new FormData();
        formData.append("profileImage", profileImage);

        const response = await apiClient.put(`/auth/profile-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to update profile image";
        }
        throw "An error occurred while updating profile image";
      }
    },
    async getProfile() {
      try {
        const response = await apiClient.get(`${backendUrl}/auth/profile`);
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw err.response?.data || "Failed to fetch profile";
        }
        throw "An error occurred while fetching profile";
      }
    },
    async refreshToken() {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      try {
        const response = await axios.post(`${backendUrl}/auth/refresh`, {
          refreshToken,
        });
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        return response.data;
      } catch {
        return null;
      }
    },
  },
};
