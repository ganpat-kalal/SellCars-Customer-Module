<template>
    <div v-if="show" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Delete</h5>
                </div>
                <div class="modal-body">
                    <p>Are you sure that you want to delete this customer?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="onCancel">Cancel</button>
                    <button type="button" class="btn btn-danger" @click="onConfirm">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ConfirmModal',
    props: {
        show: {
            type: Boolean,
            required: true
        }
    },
    emits: ['confirm', 'cancel'],
    methods: {
        onConfirm() {
            this.$emit('confirm');
        },
        onCancel() {
            this.$emit('cancel');
        }
    }
});
</script>

<style scoped>
.modal {
    background-color: rgba(0, 0, 0, 0.5);

    .modal-title {
        font-size: x-large;
        font-weight: bold;
    }
}
</style>