import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  failed_login_attempts: number;
  last_login: string | null;
  account_locked_until: string | null;
}

export const userApi = {
  getUsers: (): Promise<User[]> =>
    apiClient.get("/users").then((res) => res.data),

  createUser: (user: { username: string; email: string }): Promise<User> =>
    apiClient.post("/users", user).then((res) => res.data),
};
