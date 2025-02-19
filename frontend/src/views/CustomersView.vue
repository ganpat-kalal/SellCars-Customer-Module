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
        <div class="d-flex justify-content-between align-items-center">
          <h4>Customers</h4>
          <button @click="openCreateModal" class="btn btn-primary">Create Customer</button>
        </div>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="Search by all columns" />
        </div>

        <!-- Table Component start -->
        <TableComponent :customers="filteredCustomers" @edit-customer="openEditModal"
          @delete-customer="openDeleteModal" />
        <!-- Table Component end -->

        <!-- Edit Customer Modal start -->
        <CustomerModal :show="showEditModal" :customer="selectedCustomer" :isEditMode="isEditMode"
          @close="closeEditModal" @saved="fetchCustomersData" />
        <!-- Edit Customer Modal end -->

        <!-- Confirm Delete Modal start -->
        <ConfirmModal :show="showDeleteModal" @confirm="deleteCustomerFn" @cancel="closeDeleteModal" />
        <!-- Confirm Delete Modal end -->

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
import CustomerModal from '@/components/modals/CustomerModal.vue';
import TableComponent from '@/components/TableComponent.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import ToastComponent from '@/components/ToastComponent.vue';

export default defineComponent({
  name: 'CustomersView',
  components: {
    SidebarComponent,
    CustomerModal,
    TableComponent,
    ConfirmModal,
    ToastComponent
  },
  setup() {
    const customers = ref<Customer[]>([]);
    const searchQuery = ref('');
    const showEditModal = ref(false);
    const selectedCustomer = ref<Customer | null>(null);
    const isEditMode = ref(true);
    const showDeleteModal = ref(false);
    const customerToDelete = ref<string | null>(null);
    const errorMessage = ref('');
    const successMessage = ref('');

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
          (customer?.intnr?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase()) ||
          (customer?.contact_persons?.[0]?.first_name?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase()) ||
          (customer?.contact_persons?.[0]?.last_name?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase()) ||
          (customer?.addresses?.[0]?.company_name?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase()) ||
          (customer?.addresses?.[0]?.country?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase()) ||
          (customer?.addresses?.[0]?.zip?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase()) ||
          (customer?.addresses?.[0]?.city?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase()) ||
          (customer?.addresses?.[0]?.street?.toLowerCase() ?? '').includes(searchQuery.value.toLowerCase())
        );
      });
    });


    const openCreateModal = () => {
      selectedCustomer.value = null;
      isEditMode.value = false;
      showEditModal.value = true;
    };

    const openEditModal = (customer: Customer) => {
      selectedCustomer.value = { ...customer };
      isEditMode.value = true;
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      selectedCustomer.value = null;
    };

    const openDeleteModal = (intnr: string) => {
      customerToDelete.value = intnr;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      customerToDelete.value = null;
    };

    const deleteCustomerFn = async () => {
      if (customerToDelete.value) {
        try {
          await deleteCustomer(customerToDelete.value);
          fetchCustomersData();
          successMessage.value = 'Customer deleted successfully!';
          closeDeleteModal();
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
      filteredCustomers,
      showEditModal,
      selectedCustomer,
      isEditMode,
      showDeleteModal,
      customerToDelete,
      openCreateModal,
      openEditModal,
      closeEditModal,
      openDeleteModal,
      closeDeleteModal,
      deleteCustomerFn,
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
