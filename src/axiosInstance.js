import axios from "axios";
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);
console.log(process.env.REACT_APP_BACKEND_URL, "usrl");
export default axiosInstance;
