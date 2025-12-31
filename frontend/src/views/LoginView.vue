<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { store } from '@/store/store.js'
import TheButton from '@/components/buttons/TheButton.vue'
import TheInput from '@/components/form/TheTextInput.vue'
import router from '@/router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSuccess = ref(false)
const isError = ref(false)
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
            isError.value = true
            return
        }

        const data = await response.json()
        console.log('Login successful:', data)
        store.commit('setConnectionStatus', true)
        store.commit('setCookieExpirationDate', Date.now() + data.cookieExpiration)
        store.commit('setPseudo', data.pseudo)
        isSuccess.value = true
        isError.value = false
        errorMessage.value = ''

        if (store.state.cookieExpirationDate > Date.now() && store.state.isConnected) {
            router.push('/');
        }

    } catch (error) {
        console.error('Error during login:', error)
        isSuccess.value = false
        errorMessage.value = error.message || 'Network error during login'
    }
}

</script>

<template>
    <div class="relative min-h-screen bg-light-blue overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-1/2 bg-cover bg-center"
            style="background-image: url('/assets/map.jpg');">
        </div>

        <div class="relative z-10 p-6 min-h-screen flex items-start justify-center">
            <div class="mt-16 flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <h1 class="text-4xl font-bold">Log in</h1>
                <p class="text-center">
                    Connect to your account to access the Guess The Place application.
                </p>

                <form class="flex flex-col items-center gap-2 w-full" @submit.prevent="handleLogin">
                    <div class="w-full">
                        <TheInput id="email" label="Email" type="email" v-model="email" :isRequired="true"/>
                        <TheInput id="password" label="Password" type="password" v-model="password" :isRequired="true"/>
                    </div>
                    <TheButton type="submit" label="Login" class="w-full" />

                </form>
                <RouterLink to="/signin" class="text-sm text-purple underline mt-2 inline-block">Don't have an account?
                    Sign up here.</RouterLink>

                <p v-if="isSuccess" class="text-green m-2">Login successful!</p>
                <p v-if="errorMessage" class="text-red m-2">{{ errorMessage }}</p>
            </div>
        </div>

    </div>
</template>