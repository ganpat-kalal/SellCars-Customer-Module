<template>
    <aside class="sidebar">
        <h2>{{ userName }}</h2>
        <p>Last login: {{ lastLogin }}</p>
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
        <div>
            <button @click="userLogout()">Logout</button>
        </div>
    </aside>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';
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
                lastLogin.value = user.updated_at ? format(new Date(user.updated_at), 'yyyy.MM.dd HH:mm:ss') : '';
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

    h2 {
        margin-top: 0;
    }

    .upload-section {
        margin-top: 20px;

        .upload-area {
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

            &:hover {
                background-color: #2a3654;
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
}
</style>