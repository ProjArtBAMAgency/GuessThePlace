<script setup>
import { Info } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps({
    label: {
        type: String,
        default: 'Info'
    }
})

const showModal = ref(false)

function openModal() {
    showModal.value = true
}

function closeModal() {
    showModal.value = false
}

</script>

<template>
    <button type="button" @click="openModal" class="inline-flex items-center justify-center">
        <Info class="text-purple max-h-5 hover:text-black cursor-pointer transition" />
    </button>

    <!-- Modal Backdrop -->
    <div 
        v-if="showModal" 
        class="fixed inset-0 bg-black opacity-60 z-40 flex items-center justify-center p-4"
        @click="closeModal">
    </div>

    <!-- Modal Content -->
    <div 
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
            class="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 pointer-events-auto"
            @click.stop>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-purple">Information</h2>
                <button 
                    type="button"
                    @click="closeModal"
                    class="text-gray-500 hover:text-gray-700 transition">
                    <X class="h-6 w-6" />
                </button>
            </div>
            
            <p class="text-gray-700 text-sm leading-relaxed mb-6">
                {{ props.label }}
            </p>
            
            <div class="flex justify-end gap-2">
                <button 
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 bg-purple text-white rounded-md hover:bg-opacity-80 transition">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>