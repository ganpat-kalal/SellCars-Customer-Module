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
      <TableComponent :customers="filteredCustomers" :fields="fields" />
      <edit-customer-modal :show="showEditModal" :customer="selectedCustomer" @close="closeEditModal"
        @saved="fetchCustomers" />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import axios from 'axios';
import { Customer } from '@/types/Customer';
import EditCustomerModal from '@/components/EditCustomerModal.vue';
import TableComponent from '@/components/TableComponent.vue';

export default defineComponent({
  name: 'CustomersView',
  components: {
    EditCustomerModal,
    TableComponent
  },
  setup() {
    const customers = ref<Customer[]>([]);
    const searchQuery = ref('');
    const showEditModal = ref(false);
    const selectedCustomer = ref<Customer | null>(null);

    const fields = ref([
      { key: 'intnr', label: '#' },
      { key: 'contact_persons.0.first_name', label: 'First' },
      { key: 'contact_persons.0.last_name', label: 'Last' },
      { key: 'addresses.0.company_name', label: 'Company Name' },
      { key: 'addresses.0.country', label: 'Country' },
      { key: 'addresses.0.zip', label: 'Zip/City' },
      { key: 'addresses.0.street', label: 'Address' },
      { key: 'actions', label: 'Actions' }
    ]);

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

    const filteredCustomers = computed(() => {
      return customers.value.filter(customer => {
        return (
          customer.contact_persons?.[0]?.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer.contact_persons?.[0]?.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer.addresses?.[0]?.company_name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      });
    });

    const editCustomer = (customer: Customer) => {
      selectedCustomer.value = { ...customer };
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      selectedCustomer.value = null;
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
      customers,
      fields,
      filteredCustomers,
      showEditModal,
      selectedCustomer,
      handleFileUpload,
      handleDrop,
      editCustomer,
      closeEditModal,
      confirmDeleteCustomer,
      deleteCustomer,
      fetchCustomers
    };
  }
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
  display: flex;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
