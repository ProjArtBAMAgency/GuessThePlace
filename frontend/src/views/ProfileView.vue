<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const users = ref([])
const message = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function fetchUsers() {
    loading.value = true
    errorMessage.value = ''
    message.value = ''
    
    try {
        const response = await fetch('/api/v1/users', {
            method: 'GET',
            credentials: 'include',
        })

        if (!response.ok) {
            const contentType = response.headers.get('content-type')
            let details = ''
            
            if (contentType && contentType.includes('application/json')) {
                const errJson = await response.json()
                details = errJson.message || JSON.stringify(errJson)
            } else {
                details = await response.text()
            }
            
            errorMessage.value = `${details}`
            
            if (response.status === 401) {
                errorMessage.value += ' - You need to login first!'
            }
            
            users.value = []
            loading.value = false
            return
        }

        const data = await response.json()
        users.value = data
        message.value = `✓ Successfully fetched ${data.length} users (authenticated!)`
        console.log('Users data:', data)
        loading.value = false
        
    } catch (error) {
        console.error('Error fetching users:', error)
        errorMessage.value = error.message || 'Network error'
        loading.value = false
    }
}


</script>

<template>
    <h1 class="font-bold text-2xl mb-4">Your Profile</h1>
    <p class="mb-4">
        Find all your personal information and settings here.
    </p>
    <div class="flex flex-col gap-1 underline">
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/logout">Logout</RouterLink>
        <RouterLink to="/signin">Sign Up</RouterLink>
    </div>
    <div class="mt-8">
        <button @click="fetchUsers" class="text-white bg-purple px-4 py-2 rounded-md border hover:bg-white hover:text-purple">
            Fetch Users (Test Authentication)
        </button>
        <p v-if="loading" class="text-gray-500 mt-2">Loading...</p>
        <p v-if="message" class="text-green mt-2">{{ message }}</p>
        <p v-if="errorMessage" class="text-red mt-2">{{ errorMessage }}</p>
        <ul v-if="users.length > 0" class="mt-4 list-disc list-inside">
            <li v-for="user in users" :key="user._id">
                {{ user.pseudo }} ({{ user.email }})
            </li>
        </ul>
    </div>

</template>