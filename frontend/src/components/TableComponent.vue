<template>
    <div class="table-responsive">
        <table class="table table-bordered table-striped">
            <thead class="thead-light">
                <tr>
                    <th v-for="field in fields" :key="field.key"
                        @click="field.key !== 'actions' && sortTable(field.key)">
                        <span class="header-content">
                            {{ field.label }}
                            <img v-if="field.key !== 'actions'"
                                :src="sortKey === field.key && sortAsc ? sortUpIcon : sortDownIcon"
                                :alt="'Sort' + field.label" class="sort-icon" />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="customer in sortedCustomers" :key="customer.intnr">
                    <td>{{ customer.intnr }}</td>
                    <td>{{ customer.contact_persons[0]?.first_name }}</td>
                    <td>{{ customer.contact_persons[0]?.last_name }}</td>
                    <td>{{ customer.addresses[0]?.company_name }}</td>
                    <td>{{ customer.addresses[0]?.country }}</td>
                    <td>{{ customer.addresses[0]?.zip }} / {{ customer.addresses[0]?.city }}</td>
                    <td>{{ customer.addresses[0]?.street }}</td>
                    <td class="text-center">
                        <button @click="$emit('edit-customer', customer)" title="Edit Customer" data-bs-toggle="tooltip"
                            data-bs-placement="top">
                            <img :src="editIcon" alt="Edit" class="action-icon" />
                        </button>
                        <button @click="$emit('delete-customer', customer.intnr)" title="Delete Customer"
                            data-bs-toggle="tooltip" data-bs-placement="top">
                            <img :src="deleteIcon" alt="Delete" class="action-icon ml-2" />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import sortDownIcon from '@/icons/sort-down-icon.svg';
import sortUpIcon from '@/icons/sort-up-icon.svg';
import editIcon from '@/icons/edit-icon.svg';
import deleteIcon from '@/icons/delete-icon.svg';

export default defineComponent({
    name: 'TableComponent',
    props: {
        customers: {
            type: Array,
            required: true,
        },
        fields: {
            type: Array,
            default: () => [
                { key: 'intnr', label: '#' },
                { key: 'contact_persons.0.first_name', label: 'First' },
                { key: 'contact_persons.0.last_name', label: 'Last' },
                { key: 'addresses.0.company_name', label: 'Company Name' },
                { key: 'addresses.0.country', label: 'Country' },
                { key: 'addresses.0.zip', label: 'Zip/City' },
                { key: 'addresses.0.street', label: 'Address' },
                { key: 'actions', label: 'Actions' },
            ],
        },
    },
    setup(props) {
        const sortKey = ref('');
        const sortAsc = ref(true);

        const getValueByPath = (obj, path) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        const sortedCustomers = computed(() => {
            return [...props.customers].sort((a, b) => {
                if (sortKey.value) {
                    const aValue = getValueByPath(a, sortKey.value);
                    const bValue = getValueByPath(b, sortKey.value);
                    if (aValue === bValue) return 0;
                    if (aValue === undefined || aValue === null) return sortAsc.value ? -1 : 1;
                    if (bValue === undefined || bValue === null) return sortAsc.value ? 1 : -1;
                    return sortAsc.value ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
                }
                return 0;
            });
        });

        const sortTable = (key) => {
            if (sortKey.value === key) {
                sortAsc.value = !sortAsc.value;
            } else {
                sortKey.value = key;
                sortAsc.value = true;
            }
        };

        return {
            sortKey,
            sortAsc,
            sortedCustomers,
            sortTable,
            sortDownIcon,
            sortUpIcon,
            editIcon,
            deleteIcon,
        };
    },
});
</script>

<style lang="scss" scoped>
.table-responsive {
    margin: 20px 0;
    max-height: calc(100vh - 282px);

    thead {
        border-bottom: 2px solid #a9a9a9;

        th {
            cursor: pointer;
            user-select: none;

            .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .sort-icon {
                    margin-left: 5px;
                }
            }
        }
    }

    button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;

        &:focus {
            outline: none;
        }

        .action-icon {
            width: 20px;
            height: 20px;
        }

        .ml-2 {
            margin-left: 1.5rem;
        }
    }
}
</style>