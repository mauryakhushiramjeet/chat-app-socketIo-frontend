import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://localhost:8085",
});
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);
export default axiosInstance;
