import axios from "axios";
import { Customer } from "@/types/Customer";

const API_URL = `${process.env.VUE_APP_API_BASE_URL}/customers`;

const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

const uploadFile = async (type: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await axios.post(`${API_URL}/upload/${type}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteCustomer = async (intnr: string): Promise<void> => {
  await axios.delete(`${API_URL}/${intnr}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
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
