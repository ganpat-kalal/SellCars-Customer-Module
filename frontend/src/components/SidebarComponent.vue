<template>
    <aside class="sidebar">
        <h2>Customer name</h2>
        <p>Last login: 2022.05.15 14:25:25</p>
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
    </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { uploadFile } from '@/services/customerService';

export default defineComponent({
    name: 'SidebarComponent',
    emits: ['file-uploaded'],
    setup(_, { emit }) {
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

        return {
            handleDrop,
            handleFileUpload,
            processUploads
        };
    },
});
</script>

<style lang="scss" scoped>
.sidebar {
    width: 250px;
    background-color: #5065a8;
    color: white;
    padding: 20px;
}

.sidebar h2 {
    margin-top: 0;
}

.sidebar .upload-section {
    margin-top: 20px;
}

.sidebar .upload-area {
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
}

.sidebar .upload-area input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.sidebar .upload-area:hover {
    background-color: #2a3654;
}
</style>