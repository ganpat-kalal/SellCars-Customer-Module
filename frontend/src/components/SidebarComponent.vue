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
        <div class="logout-section">
            <button class="logout-button" @click="userLogout()">Logout</button>
        </div>
    </aside>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { uploadFile } from '@/services/customerService';
import { getCurrentUser, logOut } from '@/services/authService';

export default defineComponent({
    name: 'SidebarComponent',
    emits: ['file-uploaded'],
    setup(_, { emit }) {
        const userName = ref('');
        const lastLogin = ref('');

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
            const files = event.dataTransfer?.files;
            if (files && files[0]) {
                await processUploads(files, type);
            } else {
                alert('No files found');
            }
        };

        const handleFileUpload = async (event: Event, type: string) => {
            const target = event.target as HTMLInputElement;
            const files = target?.files;
            if (files && files[0]) {
                await processUploads(files, type);
            } else {
                alert('No files found');
            }
        };

        const processUploads = async (files: FileList, type: string) => {
            if (files[0].size > 500 * 1024) {
                alert('File size exceeds the limit of 500 KB');
                return;
            }
            try {
                await uploadFile(type, files[0]);
                emit('file-uploaded');
                alert('File uploaded successfully');
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    alert('File upload failed: ' + (error.response?.data.message || error.message));
                } else {
                    alert('File upload failed: ' + error);
                }
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
            userLogout
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