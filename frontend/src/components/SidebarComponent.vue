<template>
    <aside class="sidebar">
        <div class="user-section">
            <h4>{{ userName }}</h4>
            <p>Last login: {{ lastLogin }}</p>
        </div>
        <div class="upload-section">
            <h5 class="mb-4">Customer CSV uploads</h5>
            <div class="upload-area" @drop.prevent="handleDrop($event, 'customers')" @dragover.prevent>
                <p>Upload customer</p>
                <input type="file" ref="customerInput" @change="handleFileUpload($event, 'customers')" accept=".csv" />
            </div>
            <div class="upload-area" @drop.prevent="handleDrop($event, 'contact-persons')" @dragover.prevent>
                <p>Upload contact persons</p>
                <input type="file" ref="contactPersonInput" @change="handleFileUpload($event, 'contact-persons')"
                    accept=".csv" />
            </div>
            <div class="upload-area" @drop.prevent="handleDrop($event, 'addresses')" @dragover.prevent>
                <p>Upload addresses</p>
                <input type="file" ref="addressInput" @change="handleFileUpload($event, 'addresses')" accept=".csv" />
            </div>
        </div>
        <div class="logout-section">
            <button class="logout-button" @click="userLogout()">Logout</button>
        </div>
    </aside>
    <ToastComponent :message="errorMessage" type="alert" />
    <ToastComponent :message="successMessage" type="success" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { uploadFile } from '@/services/customerService';
import { getCurrentUser, logOut } from '@/services/authService';
import ToastComponent from '@/components/ToastComponent.vue';

export default defineComponent({
    name: 'SidebarComponent',
    components: {
        ToastComponent
    },
    emits: ['file-uploaded'],
    setup(_, { emit }) {
        const userName = ref('');
        const lastLogin = ref('');
        const errorMessage = ref('');
        const successMessage = ref('');

        const customerInput = ref<HTMLInputElement | null>(null);
        const contactPersonInput = ref<HTMLInputElement | null>(null);
        const addressInput = ref<HTMLInputElement | null>(null);

        const setCurrentUser = () => {
            const user = getCurrentUser();
            if (user) {
                userName.value = `${user.first_name} ${user.last_name}`;
                if (user.updated_at) {
                    const date = new Date(user.updated_at);
                    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
                    lastLogin.value = formattedDate;
                } else {
                    lastLogin.value = '';
                }
            }
        };

        onMounted(() => {
            setCurrentUser();
        });

        const handleDrop = async (event: DragEvent, type: string) => {
            event.preventDefault();
            errorMessage.value = '';
            const files = event.dataTransfer?.files;
            if (files && files[0]) {
                await processUploads(files, type);
            } else {
                errorMessage.value = 'No files found!';
            }
        };

        const handleFileUpload = async (event: Event, type: string) => {
            errorMessage.value = '';
            const target = event.target as HTMLInputElement;
            const files = target?.files;
            if (files && files[0]) {
                await processUploads(files, type);
                resetInputField(type);
            } else {
                errorMessage.value = 'No files found!';
            }
        };

        const processUploads = async (files: FileList, type: string) => {
            errorMessage.value = '';
            if (files[0].size > 500 * 1024) {
                errorMessage.value = 'File size exceeds the limit of 500 KB!';
                return;
            }
            try {
                errorMessage.value = '';
                await uploadFile(type, files[0]);
                successMessage.value = `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`;
                emit('file-uploaded');
            } catch (error) {
                errorMessage.value = '';
                if (axios.isAxiosError(error)) {
                    const responseErrors = error.response?.data.errors;
                    const responseMessage = error.response?.data.message;

                    if(responseMessage === 'Validation') {
                        errorMessage.value = formatErrors(responseErrors);
                    } else if (responseErrors && responseErrors.length > 0) {
                        errorMessage.value = responseErrors.join('\n');
                    } else if (responseMessage) {
                        errorMessage.value = responseMessage;
                    } else {
                        errorMessage.value = 'An unexpected error occurred.';
                    }
                } else {
                    errorMessage.value = 'File upload failed: ' + error;
                }
                emit('file-uploaded');
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

        const resetInputField = (type: string) => {
            switch (type) {
                case 'customers':
                    if (customerInput.value) {
                        customerInput.value.value = '';
                    }
                    break;
                case 'contact-persons':
                    if (contactPersonInput.value) {
                        contactPersonInput.value.value = '';
                    }
                    break;
                case 'addresses':
                    if (addressInput.value) {
                        addressInput.value.value = '';
                    }
                    break;
            }
        };

        const userLogout = async () => {
            await logOut();
        };

        return {
            handleDrop,
            handleFileUpload,
            processUploads,
            userName,
            lastLogin,
            userLogout,
            errorMessage,
            successMessage,
            customerInput,
            contactPersonInput,
            addressInput
        };
    },
});
</script>

<style lang="scss" scoped>
.sidebar {
    background-color: #5065a8;
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    min-width: 250px;
    flex: 0 0 250px;

    @media (max-width: 963px) {
        height: auto;
        min-width: 100%;
    }

    .user-section {
        p {
            font-size: 14px;
        }
    }

    .upload-section {
        .upload-area {
            display: flex;
            justify-content: center;
            width: 100%;
            height: 120px;
            margin-bottom: 10px;
            color: #3b4c75;
            background-color: white;
            position: relative;
            border-radius: 2px;
            padding-top: 1.5rem;

            &:hover {
                box-shadow: 0 0 10px 0 rgba(0, 0, 0, 1);
            }

            input[type="file"] {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                cursor: pointer;
            }
        }
    }

    .logout-section {
        .logout-button {
            width: 100%;
            padding: 10px;
            background-color: red;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 4px;

            &:hover {
                background-color: darkred;
            }
        }
    }
}
</style>