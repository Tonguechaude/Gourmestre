import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export const userApi = {
  getUsers: (): Promise<User[]> =>
    apiClient.get("/users").then((res) => res.data),

  createUser: (user: Omit<User, "id" | "created_at">): Promise<User> =>
    apiClient.post("/users", user).then((res) => res.data),
};
