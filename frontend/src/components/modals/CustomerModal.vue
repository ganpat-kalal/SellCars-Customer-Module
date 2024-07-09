<template>
  <div v-if="show" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditMode ? 'Edit Customer' : 'Create Customer' }}</h5>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCustomer">
            <!-- Company Details Section -->
            <div class="row">
              <div class="form-group col-md-2 mb-2">
                <label for="intnr">Internal Number</label>
                <input type="text" v-model="localCustomer.intnr" id="intnr" class="form-control" :readonly="isEditMode"
                  required />
              </div>
              <div class="form-group col-md-5 mb-2">
                <label for="type">Customer Type</label>
                <select v-model="localCustomer.type" id="type" class="form-control" required :disabled="isEditMode">
                  <option value="PRIVATE">Private</option>
                  <option value="COMPANY">Company</option>
                  <option value="DEALER">Dealer</option>
                </select>
              </div>
              <div v-if="localCustomer.type === 'COMPANY' || localCustomer.type === 'DEALER'"
                class="form-group col-md-5 mb-2">
                <label for="company_name">Company Name</label>
                <input type="text" v-model="localCustomer.addresses[0].company_name" id="company_name"
                  class="form-control" required />
              </div>
            </div>

            <!-- Contact Person Details Section -->
            <div class="row">
              <div class="form-group col-md-12 mt-1">
                <hr>
              </div>
              <div class="form-group col-md-4 mb-2">
                <label for="first_name">First Name</label>
                <input type="text" v-model="localCustomer.contact_persons[0].first_name" id="first_name"
                  class="form-control" required />
              </div>
              <div class="form-group col-md-4 mb-2">
                <label for="last_name">Last Name</label>
                <input type="text" v-model="localCustomer.contact_persons[0].last_name" id="last_name"
                  class="form-control" required />
              </div>
              <div class="form-group col-md-4 mb-2">
                <label for="birth_date">Birth Date</label>
                <input type="date" v-model="localCustomer.contact_persons[0].birth_date" id="birth_date"
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
                  class="form-control" required pattern="\d{7-15}" title="Mobile number should be valid!" />
              </div>
            </div>

            <!-- Address Section -->
            <div class="row">
              <div class="form-group col-md-12 mt-1">
                <hr>
              </div>
              <div class="form-group col-md-4 mb-2">
                <label for="street">Street</label>
                <input type="text" v-model="localCustomer.addresses[0].street" id="street" class="form-control"
                  required />
              </div>
              <div class="form-group col-md-3 mb-2">
                <label for="city">City</label>
                <input type="text" v-model="localCustomer.addresses[0].city" id="city" class="form-control" required />
              </div>
              <div class="form-group col-md-2 mb-2">
                <label for="zip">Zip</label>
                <input type="text" v-model="localCustomer.addresses[0].zip" id="zip" class="form-control" required />
              </div>
              <div class="form-group col-md-3 mb-2">
                <label for="country">Country</label>
                <input type="text" v-model="localCustomer.addresses[0].country" id="country" class="form-control"
                  required />
              </div>
              <div v-if="localCustomer.type === 'COMPANY' || localCustomer.type === 'DEALER'"
                class="form-group col-md-3 mb-2">
                <label for="phone">Phone</label>
                <input type="tel" v-model="localCustomer.addresses[0].phone" id="phone" class="form-control" required
                  pattern="\d{7-15}" title="Phone number should be valid!" />
              </div>
              <div v-if="localCustomer.type === 'COMPANY' || localCustomer.type === 'DEALER'"
                class="form-group col-md-3 mb-2">
                <label for="fax">Fax</label>
                <input type="tel" v-model="localCustomer.addresses[0].fax" id="fax" class="form-control" required
                  requiredpattern="\d{7-15}" title="Fax number should be valid!" />
              </div>
              <div v-if="localCustomer.type === 'COMPANY' || localCustomer.type === 'DEALER'"
                class="form-group col-md-6 mb-2">
                <label for="address_email">Address Email</label>
                <input type="email" v-model="localCustomer.addresses[0].email" id="address_email" class="form-control"
                  required pattern="!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/" title="Email should be valid!" />
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
import { Customer } from '../../types/Customer';
import { updateCustomer, createCustomer } from '@/services/customerService';
import ToastComponent from '@/components/ToastComponent.vue';

export default defineComponent({
  name: 'CustomerModal',
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
    },
    isEditMode: {
      type: Boolean,
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
        } else {
          localCustomer.value = {
            intnr: '',
            type: 'COMPANY',
            contact_persons: [{
              first_name: '',
              last_name: '',
              email: '',
              mobile_phone: '',
              birth_date: '',
              address: null
            }],
            addresses: [{
              company_name: '',
              country: '',
              city: '',
              zip: '',
              street: '',
              fax: '',
              phone: '',
              email: ''
            }]
          };
        }
      },
      { immediate: true }
    );

    const isFormValid = computed(() => {
      if (!localCustomer.value) return false;
      const customer = localCustomer.value;
      const contactPerson = customer.contact_persons[0];
      const address = customer.addresses[0];

      const isContactPersonValid = contactPerson.first_name && contactPerson.last_name && contactPerson.email;
      const isAddressValid = address.country && address.zip && address.city && address.street;

      if (customer.type === 'COMPANY' || customer.type === 'DEALER') {
        return isContactPersonValid && isAddressValid && address.company_name && address.email && address.phone;
      }

      return isContactPersonValid && isAddressValid;
    });

    const close = () => {
      emit('close');
    };

    const saveCustomer = async () => {
      if (localCustomer.value && isFormValid.value) {
        try {
          errorMessage.value = '';
          if (props.isEditMode) {
            await updateCustomer(localCustomer.value);
            successMessage.value = 'Customer updated successfully!';
          } else {
            await createCustomer(localCustomer.value);
            successMessage.value = 'Customer created successfully!';
          }
          emit('saved');
          close();
        } catch (error) {
          errorMessage.value = '';
          if (axios.isAxiosError(error)) {
            const responseErrors = error.response?.data.errors;
            const responseMessage = error.response?.data.message;

            if (responseMessage === 'Validation') {
              errorMessage.value = formatErrors(responseErrors);
            } else if (responseErrors && responseErrors.length > 0) {
              errorMessage.value = responseErrors.join('\n');
            } else if (responseMessage) {
              errorMessage.value = responseMessage;
            } else {
              errorMessage.value = 'An unexpected error occurred.';
            }
          } else {
            errorMessage.value = 'Failed to save customer: ' + String(error);
          }
        }
      } else {
        errorMessage.value = 'Please fill in all required fields correctly.';
      }
    };

    const formatErrors = (errors: any[]): string => {
      return errors.map((errorItem: any) => {
        const customer = errorItem.data;
        const customerDetails = `INTNR: ${customer.intnr}`;
        const errorMessages = errorItem.errors.join('\n');
        return `${customerDetails}\n Errors: ${errorMessages}`;
      }).join('\n');
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

    label {
      font-size: 12px;
    }
  }
}
</style>