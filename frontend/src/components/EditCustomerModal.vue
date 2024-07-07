<template>
  <div v-if="show" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Customer</h5>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCustomer">
            <div class="row">
              <div class="form-group col-md-6 mb-2">
                <label for="intnr">Internal Number</label>
                <input type="text" v-model="localCustomer.intnr" id="intnr" class="form-control" readonly />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="type">Customer Type</label>
                <select v-model="localCustomer.type" id="type" class="form-control" required>
                  <option value="PRIVATE">Private</option>
                  <option value="COMPANY">Company</option>
                  <option value="DEALER">Dealer</option>
                </select>
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="first_name">First Name</label>
                <input type="text" v-model="localCustomer.contact_persons[0].first_name" id="first_name"
                  class="form-control" required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="last_name">Last Name</label>
                <input type="text" v-model="localCustomer.contact_persons[0].last_name" id="last_name"
                  class="form-control" required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="email">Email</label>
                <input type="email" v-model="localCustomer.contact_persons[0].email" id="email" class="form-control"
                  required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="mobile_phone">Mobile Phone</label>
                <input type="tel" v-model="localCustomer.contact_persons[0].mobile_phone" id="mobile_phone"
                  class="form-control" pattern="\d{10}" title="Phone number should be 10 digits" />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="company_name">Company Name</label>
                <input type="text" v-model="localCustomer.addresses[0].company_name" id="company_name"
                  class="form-control" required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="country">Country</label>
                <input type="text" v-model="localCustomer.addresses[0].country" id="country" class="form-control"
                  required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="zip">Zip</label>
                <input type="text" v-model="localCustomer.addresses[0].zip" id="zip" class="form-control" required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="city">City</label>
                <input type="text" v-model="localCustomer.addresses[0].city" id="city" class="form-control" required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="street">Street</label>
                <input type="text" v-model="localCustomer.addresses[0].street" id="street" class="form-control"
                  required />
              </div>
              <div class="form-group col-md-6 mb-2">
                <label for="address_email">Address Email</label>
                <input type="email" v-model="localCustomer.addresses[0].email" id="address_email"
                  class="form-control" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="close" type="button" class="btn btn-secondary">Close</button>
          <button @click="saveCustomer" type="submit" class="btn btn-primary" :disabled="!isFormValid">Save
            changes</button>
        </div>
      </div>
    </div>
  </div>
  <ToastComponent :message="errorMessage" type="alert" />
  <ToastComponent :message="successMessage" type="success" />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, computed } from 'vue';
import axios from 'axios';
import { Customer } from '../types/Customer';
import { updateCustomer } from '@/services/customerService';
import ToastComponent from '@/components/ToastComponent.vue';

export default defineComponent({
  name: 'EditCustomerModal',
  components: {
    ToastComponent
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    customer: {
      type: Object as PropType<Customer | null>,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const localCustomer = ref<Customer | null>(null);
    const errorMessage = ref('');
    const successMessage = ref('');

    watch(
      () => props.customer,
      (newCustomer) => {
        if (newCustomer) {
          localCustomer.value = JSON.parse(JSON.stringify(newCustomer));
        }
      },
      { immediate: true }
    );

    const isFormValid = computed(() => {
      if (!localCustomer.value) return false;
      const customer = localCustomer.value;
      const contactPerson = customer.contact_persons[0];
      const address = customer.addresses[0];

      return customer.intnr && customer.type &&
        contactPerson.first_name && contactPerson.last_name && contactPerson.email &&
        address.company_name && address.country && address.zip && address.city && address.street;
    });

    const close = () => {
      emit('close');
    };

    const saveCustomer = async () => {
      if (localCustomer.value && isFormValid.value) {
        try {
          errorMessage.value = '';
          const res = await updateCustomer(localCustomer.value);
          successMessage.value = 'Customer updated successfully!';
          emit('saved');
          close();
        } catch (error) {
          if (axios.isAxiosError(error)) {
            errorMessage.value = 'Failed to save customer: ' + (error.response?.data.message || error.message);
          } else {
            errorMessage.value = 'Failed to save customer: ' + String(error);
          }
        }
      } else {
        errorMessage.value = 'Please fill in all required fields correctly.';
      }
    };

    return {
      localCustomer,
      close,
      saveCustomer,
      errorMessage,
      isFormValid,
      successMessage
    };
  }
});
</script>

<style lang="scss" scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 10px 20px !important;

    .modal-title {
      font-size: x-large;
      font-weight: bold;
    }

    label {
      font-size: 12px;
    }
  }
}
</style>