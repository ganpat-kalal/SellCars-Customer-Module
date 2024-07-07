<template>
    <div class="toast-container position-fixed p-3 top-0 end-0" style="z-index: 1050;">
        <div class="toast" :class="{ show: showToast }" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header" :class="toastTypeClass">
                <strong class="me-auto">{{ toastTitle }}</strong>
                <button type="button" class="btn-close" @click="showToast = false"></button>
            </div>
            <div class="toast-body">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';

export default defineComponent({
    name: 'ToastComponent',
    props: {
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const showToast = ref(false);

        watch(() => props.message, (newValue) => {
            if (newValue) {
                showToast.value = true;
                setTimeout(() => {
                    showToast.value = false;
                }, 10000);
            }
        });

        const toastTypeClass = computed(() => {
            switch (props.type) {
                case 'success':
                    return 'bg-success text-white';
                case 'warning':
                    return 'bg-warning text-dark';
                case 'alert':
                    return 'bg-danger text-white';
                default:
                    return '';
            }
        });

        const toastTitle = computed(() => {
            switch (props.type) {
                case 'success':
                    return props.title || 'Success';
                case 'warning':
                    return props.title || 'Warning';
                case 'alert':
                    return props.title || 'Error';
                default:
                    return props.title;
            }
        });

        return {
            showToast,
            toastTypeClass,
            toastTitle
        };
    }
});
</script>

<style lang="scss" scoped>
.toast-container {
    z-index: 9999 !important;
}
</style>