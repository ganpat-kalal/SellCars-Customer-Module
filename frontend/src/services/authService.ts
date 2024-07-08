import axios from "axios";

const API_URL = `${process.env.VUE_APP_API_BASE_URL}/users`;
let currentUser = {
  first_name: "",
  last_name: "",
  updated_at: "",
};

const login = async (email: string, password: string): Promise<string> => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  currentUser = response.data.user;
  return response.data.token;
};

const getCurrentUser = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
  return currentUser;
};

const logOut = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = '/login';
};

export { login, getCurrentUser, logOut };
