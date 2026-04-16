import axios from "axios";

export const api = axios.create({
  baseURL: "VITE_API_BASE_URL" in import.meta.env ? import.meta.env.VITE_API_BASE_URL : "http://localhost:5000/api",
  timeout: 100000,
});
