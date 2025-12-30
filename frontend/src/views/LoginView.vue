<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { store } from '@/store/store.js'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSuccess = ref(false)
console.log('Store state isConnected ? :', store.state.isConnected)

async function handleLogin() {
    try {
        const response = await fetch('/api/v1/authentification/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email.value,
                password: password.value,
            }),
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
            isSuccess.value = false
            errorMessage.value = `${details}`
            return
        }

        const data = await response.json()
        console.log('Login successful:', data)
        store.commit('setConnectionStatus', true)
        store.commit('setCookieExpirationDate', Date.now() + data.cookieExpiration)
        isSuccess.value = true
        errorMessage.value = ''

    } catch (error) {
        console.error('Error during login:', error)
        isSuccess.value = false
        errorMessage.value = error.message || 'Network error during login'
    }
}

</script>

<template>
    <div class="container p-4">
        <h1 class="text-2xl">Login View</h1>
        <p class="mt-2">
            Connect to your account to access the Guess The Place application.
        </p>

        <div class="mt-6 flex flex-col items-center">
            <form class="flex flex-col items-center gap-2 
            " @submit.prevent="handleLogin">
                <div>
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" v-model="email"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-4" />
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" v-model="password"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-4" />
                </div>
                <button
                    class="text-white bg-purple px-4 py-2 rounded-md border hover:bg-white hover:text-purple">Login</button>

            </form>
            <RouterLink to="/signin" class="text-sm text-purple underline mt-4 inline-block">Don't have an account?
                Sign up
                here.</RouterLink>

            <p v-if="isSuccess" class="text-green m-2">Login successful!</p>
            <p v-if="errorMessage" class="text-red m-2">{{ errorMessage }}</p>
        </div>

    </div>
</template>