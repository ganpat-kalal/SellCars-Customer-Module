import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

const login = async (email: string, password: string): Promise<string> => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.token;
};

export { login };