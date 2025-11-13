import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Передає кукі з токеном
});

// Interceptor для обробки помилок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Якщо 401 — користувач не авторизований
      // Можна додати логіку для редиректу на login
      console.error("Unauthorized - please login");
    }

    if (error.response?.status === 403) {
      // Якщо 403 — немає доступу
      console.error("Forbidden - insufficient permissions");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
