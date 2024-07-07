import axios from "axios";
import { Customer } from "@/types/Customer";

const API_URL = "http://localhost:5000/api/customers";

const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

const uploadFile = async (type: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_URL}/upload/${type}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteCustomer = async (intnr: string): Promise<any> => {
  const response = await axios.delete(`${API_URL}/${intnr}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

const updateCustomer = async (customer: Customer): Promise<Customer> => {
  const response = await axios.put(`${API_URL}/${customer.intnr}`, customer, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

export { fetchCustomers, uploadFile, deleteCustomer, updateCustomer };
