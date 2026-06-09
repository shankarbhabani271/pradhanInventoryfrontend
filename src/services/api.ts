import axios from "axios";
import { API_BASE_URL } from "../config/http";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Bypass-Tunnel-Reminder": "true",
  }
});