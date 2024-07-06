<template>
  <div v-if="show" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Customer</h5>
          <!-- <button type="button" class="close" @click="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button> -->
        </div>
        <div class="modal-body">
          <form>
            <div class="row">
              <div v-if="localCustomer" class="form-group col-md-6 mb-2">
                <label for="first_name">First Name</label>
                <input type="text" v-model="localCustomer.contact_persons[0].first_name" id="first_name"
                  class="form-control" required />
              </div>
              <div v-if="localCustomer" class="form-group col-md-6 mb-2">
                <label for="last_name">Last Name</label>
                <input type="text" v-model="localCustomer.contact_persons[0].last_name" id="last_name"
                  class="form-control" required />
              </div>
              <div v-if="localCustomer" class="form-group col-md-6 mb-2">
                <label for="company_name">Company Name</label>
                <input type="text" v-model="localCustomer.addresses[0].company_name" id="company_name"
                  class="form-control" required />
              </div>
              <div v-if="localCustomer" class="form-group col-md-6 mb-2">
                <label for="country">Country</label>
                <input type="text" v-model="localCustomer.addresses[0].country" id="country" class="form-control"
                  required />
              </div>
              <div v-if="localCustomer" class="form-group col-md-6 mb-2">
                <label for="zip">Zip</label>
                <input type="text" v-model="localCustomer.addresses[0].zip" id="zip" class="form-control" required />
              </div>
              <div v-if="localCustomer" class="form-group col-md-6 mb-2">
                <label for="city">City</label>
                <input type="text" v-model="localCustomer.addresses[0].city" id="city" class="form-control" required />
              </div>
              <div v-if="localCustomer" class="form-group col-md-6 mb-2">
                <label for="street">Street</label>
                <input type="text" v-model="localCustomer.addresses[0].street" id="street" class="form-control"
                  required />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="close" type="button" class="btn btn-secondary">Close</button>
          <button @click="saveCustomer" type="submit" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import axios from 'axios';
import { Customer } from '../types/Customer';

export default defineComponent({
  name: 'EditCustomerModal',
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

    watch(
      () => props.customer,
      (newCustomer) => {
        if (newCustomer) {
          localCustomer.value = JSON.parse(JSON.stringify(newCustomer)); // Deep copy to avoid reference issues
        }
      },
      { immediate: true }
    );

    const close = () => {
      emit('close');
    };

    const saveCustomer = async () => {
      if (localCustomer.value) {
        try {
          await axios.put(`http://localhost:5000/api/customers/${localCustomer.value.intnr}`, localCustomer.value, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          emit('saved');
          close();
        } catch (error) {
          if (axios.isAxiosError(error)) {
            alert('Failed to save customer: ' + (error.response?.data.message || error.message));
          } else {
            alert('Failed to save customer: ' + error);
          }
        }
      }
    };

    return {
      localCustomer,
      close,
      saveCustomer,
    };
  }
});
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>