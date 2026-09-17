import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  // baseURL: 'https://aps2.zemenbank.com/fmsapi',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

const plainApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  // baseURL: 'https://aps2.zemenbank.com/fmsapi',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  const isAuthRoute = config.url?.includes('/auth/login') ||
                      config.url?.includes('/auth/refresh-token');

  if (accessToken && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || '';
      const authRoute = url.includes('/auth/login') ||
                        url.includes('/auth/refresh-token');

      if (authRoute) return Promise.reject(error);
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.clear();
          window.location.replace('/fms/');
          return Promise.reject(error);
        }

        const response = await plainApi.post('/auth/refresh-token', { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.replace('/fms/');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
