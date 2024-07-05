<template>
    <div class="modal" v-if="show && localCustomer">
        <div class="modal-content">
            <span class="close" @click="close">&times;</span>
            <h2>Edit Customer</h2>
            <form @submit.prevent="saveCustomer">
                <div class="form-group">
                    <label for="first_name">First Name</label>
                    <input type="text" v-model="localCustomer.contact_persons[0].first_name" id="first_name" required />
                </div>
                <div class="form-group">
                    <label for="last_name">Last Name</label>
                    <input type="text" v-model="localCustomer.contact_persons[0].last_name" id="last_name" required />
                </div>
                <div class="form-group">
                    <label for="company_name">Company Name</label>
                    <input type="text" v-model="localCustomer.addresses[0].company_name" id="company_name" required />
                </div>
                <div class="form-group">
                    <label for="country">Country</label>
                    <input type="text" v-model="localCustomer.addresses[0].country" id="country" required />
                </div>
                <div class="form-group">
                    <label for="zip">Zip</label>
                    <input type="text" v-model="localCustomer.addresses[0].zip" id="zip" required />
                </div>
                <div class="form-group">
                    <label for="city">City</label>
                    <input type="text" v-model="localCustomer.addresses[0].city" id="city" required />
                </div>
                <div class="form-group">
                    <label for="street">Street</label>
                    <input type="text" v-model="localCustomer.addresses[0].street" id="street" required />
                </div>
                <button type="submit">Save</button>
            </form>
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
    setup(props, { emit }) {
        const localCustomer = ref<Customer | null>(null);

        watch(props, (newProps) => {
            if (newProps.customer) {
                localCustomer.value = { ...newProps.customer };
            }
        });

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
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}
</style>