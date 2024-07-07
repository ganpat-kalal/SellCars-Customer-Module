<template>
  <div class="customer-module">
    <!-- Sidebar Component start -->
    <SidebarComponent @file-uploaded="fetchCustomersData" />
    <!-- Sidebar Component end -->

    <!-- Main content container -->
    <div class="main-content-container">
      <!-- Header start -->
      <div class="header">
      </div>
      <!-- Header end -->

      <!-- Main component start -->
      <main class="main-content">
        <h4>Customers</h4>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="Search by all columns" />
        </div>

        <!-- Table Component start -->
        <TableComponent :customers="filteredCustomers" :fields="fields" @edit-customer="editCustomer"
          @delete-customer="confirmDeleteCustomer" />
        <!-- Table Component end -->

        <!-- Edit Customer Modal start -->
        <EditCustomerModal :show="showEditModal" :customer="selectedCustomer" @close="closeEditModal"
          @saved="fetchCustomersData" />
        <!-- Edit Customer Modal end -->

      </main>
      <!-- Main component end -->

      <!-- Footer start -->
      <div class="footer">
      </div>
      <!-- Footer end -->
    </div>
    <!-- Main content container end -->
    <ToastComponent :message="errorMessage" type="alert" />
    <ToastComponent :message="successMessage" type="success" />
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
import ToastComponent from '@/components/ToastComponent.vue';

export default defineComponent({
  name: 'CustomersView',
  components: {
    SidebarComponent,
    EditCustomerModal,
    TableComponent,
    ToastComponent
  },
  setup() {
    const customers = ref<Customer[]>([]);
    const searchQuery = ref('');
    const showEditModal = ref(false);
    const selectedCustomer = ref<Customer | null>(null);
    const errorMessage = ref('');
    const successMessage = ref('');

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
          errorMessage.value = 'Unexpected error: ' + error;
        }
      }
    };

    const filteredCustomers = computed(() => {
      return customers.value.filter(customer => {
        return (
          customer?.intnr.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer?.contact_persons?.[0]?.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer?.contact_persons?.[0]?.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer?.addresses?.[0]?.company_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer?.addresses?.[0]?.country.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer?.addresses?.[0]?.zip.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer?.addresses?.[0]?.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          customer?.addresses?.[0]?.street.toLowerCase().includes(searchQuery.value.toLowerCase())
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
          const res = await deleteCustomer(intnr);
          fetchCustomersData();
          successMessage.value = res?.message || 'Customer deleted successfully!';
        } catch (error) {
          if (axios.isAxiosError(error)) {
            errorMessage.value = 'Failed to delete customer: ' + (error.response?.data.message || error.message);
          } else {
            errorMessage.value = 'Failed to delete customer: ' + error;
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
      fetchCustomersData,
      errorMessage,
      successMessage
    };
  }
});
</script>

<style lang="scss" scoped>
.customer-module {
  display: flex;
  height: 100vh;

  @media (max-width: 961px) {
    display: block;
    height: auto;
  }

  .main-content-container {
    display: flex;
    flex-direction: column;
    width: 100%;

    .header,
    .footer {
      background-color: #5065a8;
      color: white;
      padding: 1.5rem;
      border-left: 1px solid #000;
    }

    .main-content {
      flex-grow: 1;
      padding: 20px;
      background-color: #f0f0f0;
      overflow-y: auto;

      h4 {
        margin: 1rem 0;
        font-weight: 600;
        color: #808080;
      }

      .search-bar {
        margin-bottom: 20px;
        display: flex;

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>
