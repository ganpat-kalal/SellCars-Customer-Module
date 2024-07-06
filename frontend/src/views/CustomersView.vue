<template>
  <div class="customer-module">
    <!-- Sidebar Component start -->
    <SidebarComponent @file-uploaded="fetchCustomersData" />
    <!-- Sidebar Component end -->

    <!-- Main component start -->
    <main class="main-content">
      <h1>Customers</h1>
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search by all columns" />
      </div>

      <!-- Table Component start -->
      <TableComponent :customers="filteredCustomers" :fields="fields" @edit-customer="editCustomer"
        @delete-customer="confirmDeleteCustomer" />
      <!-- Table Component end -->

      <!-- Edit Customer Modal start -->
      <EditCustomerModal :show="showEditModal" :customer="selectedCustomer" @close="closeEditModal"
        @saved="fetchCustomers" />
      <!-- Edit Customer Modal end -->

    </main>
    <!-- Main component end -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import axios from 'axios';
import { fetchCustomers, deleteCustomer } from '@/services/customerService';
import { Customer } from '@/types/Customer';
import SidebarComponent from '@/components/SidebarComponent.vue';
import EditCustomerModal from '@/components/EditCustomerModal.vue';
import TableComponent from '@/components/TableComponent.vue';

export default defineComponent({
  name: 'CustomersView',
  components: {
    SidebarComponent,
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

    const fetchCustomersData = async () => {
      try {
        customers.value = await fetchCustomers();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          console.error('Unexpected error', error);
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
        try {
          await deleteCustomer(intnr);
          fetchCustomersData();
          alert('Customer deleted successfully');
        } catch (error) {
          if (axios.isAxiosError(error)) {
            alert('Failed to delete customer: ' + (error.response?.data.message || error.message));
          } else {
            alert('Failed to delete customer: ' + error);
          }
        }
      }
    };

    fetchCustomersData();

    return {
      searchQuery,
      customers,
      fields,
      filteredCustomers,
      showEditModal,
      selectedCustomer,
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
