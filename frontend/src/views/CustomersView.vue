<template>
  <div class="customer-module">
    <aside class="sidebar">
      <h2>Customer name</h2>
      <p>Last login: 2022.05.15 14:25:25</p>
      <div class="upload-section">
        <div class="upload-area" @drop.prevent="handleDrop($event, 'customers')" @dragover.prevent>
          <p>Upload customer</p>
          <input type="file" @change="handleFileUpload($event, 'customers')" accept=".csv" />
        </div>
        <div class="upload-area" @drop.prevent="handleDrop($event, 'contact-persons')" @dragover.prevent>
          <p>Upload contact persons</p>
          <input type="file" @change="handleFileUpload($event, 'contact-persons')" accept=".csv" />
        </div>
        <div class="upload-area" @drop.prevent="handleDrop($event, 'addresses')" @dragover.prevent>
          <p>Upload addresses</p>
          <input type="file" @change="handleFileUpload($event, 'addresses')" accept=".csv" />
        </div>
      </div>
    </aside>
    <main class="main-content">
      <h1>Customers</h1>
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search by all columns" />
      </div>
      <table>
        <thead>
          <tr>
            <th @click="sortTable('intnr')">#</th>
            <th @click="sortTable('contact_persons.0.first_name')">First</th>
            <th @click="sortTable('contact_persons.0.last_name')">Last</th>
            <th @click="sortTable('addresses.0.company_name')">Company Name</th>
            <th @click="sortTable('addresses.0.country')">Country</th>
            <th @click="sortTable('addresses.0.zip')">Zip/City</th>
            <th @click="sortTable('addresses.0.street')">Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in filteredCustomers" :key="customer.intnr">
            <td>{{ customer.intnr }}</td>
            <td>{{ customer.contact_persons?.[0]?.first_name }}</td>
            <td>{{ customer.contact_persons?.[0]?.last_name }}</td>
            <td>{{ customer.addresses?.[0]?.company_name }}</td>
            <td>{{ customer.addresses?.[0]?.country }}</td>
            <td>{{ customer.addresses?.[0]?.zip }} / {{ customer.addresses?.[0]?.city }}</td>
            <td>{{ customer.addresses?.[0]?.street }}</td>
            <td>
              <button @click="editCustomer(customer)">Edit</button>
              <button @click="confirmDeleteCustomer(customer.intnr)">Delete</button> <!-- Add this line -->
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import axios, { AxiosError } from 'axios';
import { Customer } from '@/types/Customer';

export default defineComponent({
  name: 'CustomersView',
  setup() {
    const customers = ref<Customer[]>([]);
    const searchQuery = ref('');
    const sortKey = ref('');
    const sortAsc = ref(true);
    const showCreateModal = ref(false);

    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        customers.value = response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        } else {
          console.error('Unexpected error', error);
        }
      }
    };

    const handleFileUpload = async (event: Event, type: string) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        if (target.files[0].size > 500 * 1024) {
          alert('File size exceeds the limit of 500 KB');
          return;
        }
        const formData = new FormData();
        formData.append('file', target.files[0]);
        try {
          await axios.post(`http://localhost:5000/api/customers/upload/${type}`, formData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          fetchCustomers();
          alert('File uploaded successfully');
        } catch (error) {
          if (axios.isAxiosError(error)) {
            alert('File upload failed: ' + (error.response?.data.message || error.message));
          } else {
            alert('File upload failed: ' + error);
          }
        }
      }
    };

    const handleDrop = async (event: DragEvent, type: string) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (files && files[0]) {
        if (files[0].size > 500 * 1024) {
          alert('File size exceeds the limit of 500 KB');
          return;
        }
        const formData = new FormData();
        formData.append('file', files[0]);
        try {
          await axios.post(`http://localhost:5000/api/customers/upload/${type}`, formData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          fetchCustomers();
          alert('File uploaded successfully');
        } catch (error) {
          if (axios.isAxiosError(error)) {
            alert('File upload failed: ' + (error.response?.data.message || error.message));
          } else {
            alert('File upload failed: ' + error);
          }
        }
      }
    };

    const getValueByPath = (obj: any, path: string): any => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const filteredCustomers = computed(() => {
      return customers.value
        .filter((customer) => {
          return (
            customer.contact_persons?.[0]?.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            customer.contact_persons?.[0]?.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            customer.addresses?.[0]?.company_name.toLowerCase().includes(searchQuery.value.toLowerCase())
          );
        })
        .sort((a, b) => {
          if (sortKey.value) {
            const aValue = getValueByPath(a, sortKey.value);
            const bValue = getValueByPath(b, sortKey.value);
            if (aValue === bValue) return 0;
            if (aValue === undefined || aValue === null) return sortAsc.value ? -1 : 1;
            if (bValue === undefined || bValue === null) return sortAsc.value ? 1 : -1;
            return sortAsc.value ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
          }
          return 0;
        });
    });

    const sortTable = (key: string) => {
      if (sortKey.value === key) {
        sortAsc.value = !sortAsc.value;
      } else {
        sortKey.value = key;
        sortAsc.value = true;
      }
    };

    const createCustomer = async () => {
      // Implement create customer functionality
      fetchCustomers();
      showCreateModal.value = false;
    };

    const editCustomer = (customer: Customer) => {
      // Implement edit customer functionality
    };

    const confirmDeleteCustomer = async (intnr: string) => {
      if (confirm('Are you sure that you want to delete this customer?')) {
        deleteCustomer(intnr);
      }
    };

    const deleteCustomer = async (intnr: string) => {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${intnr}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchCustomers();
        alert('Customer deleted successfully');
      } catch (error) {
        if (axios.isAxiosError(error)) {
            alert('Failed to delete customer: ' + (error.response?.data.message || error.message));
          } else {
            alert('Failed to delete customer: ' + error);
          }
      }
    };

    fetchCustomers();

    return {
      searchQuery,
      filteredCustomers,
      sortTable,
      showCreateModal,
      handleFileUpload,
      handleDrop,
      createCustomer,
      editCustomer,
      confirmDeleteCustomer,
      deleteCustomer,
    };
  },
});
</script>

<style lang="scss" scoped>
.customer-module {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #5065a8;
  color: white;
  padding: 20px;
}

.sidebar h2 {
  margin-top: 0;
}

.sidebar .upload-section {
  margin-top: 20px;
}

.sidebar .upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  margin-bottom: 10px;
  background-color: #3b4c75;
  color: white;
  border: 2px dashed white;
  position: relative;
}

.sidebar .upload-area input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.sidebar .upload-area:hover {
  background-color: #2a3654;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  background-color: #f0f0f0;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border: 1px solid #ccc;
}

th {
  cursor: pointer;
}

th:hover {
  background-color: #e0e0e0;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
