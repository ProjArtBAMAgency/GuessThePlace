<script setup>
import { ref, onMounted } from 'vue'
import TheButton from '@/components/TheButton.vue';
import TheInfoButton from '@/components/TheInfoButton.vue';

let username = ref('');
let email = ref('');
let password = ref('');
let team_id = ref('');
let usernameError = ref(false);
let emailError = ref(false);
let passwordError = ref(false);
let selectedTeamError = ref(false);
let serverError = ref('');
let signupSuccess = ref(false);


const teams = ref([]);

onMounted(async () => {
    try {
        const res = await fetch('/api/v1/teams');
        const data = await res.json();
        teams.value = data;
        console.log(teams.value);
    } catch (err) {
        console.error('Erreur lors du chargement des équipes', err);
    }
});


function checkErrors() {
    let hasError = false;

    if (username.value.length < 6 || username.value.length > 10) {
        usernameError.value = true;
        hasError = true;
    } else {
        usernameError.value = false;
    }

    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
        emailError.value = true;
        hasError = true;
    } else {
        emailError.value = false;
    }

    if (
        password.value.length < 8 ||
        !/[A-Z]/.test(password.value) ||
        !/[0-9]/.test(password.value) ||
        !/[!@#$%^&*]/.test(password.value)
    ) {
        passwordError.value = true;
        hasError = true;
    } else {
        passwordError.value = false;
    }

    if (!team_id.value) {
        selectedTeamError.value = true;
        hasError = true;
    } else {
        selectedTeamError.value = false;
    }

    return hasError;
}


async function signUp() {
    if (checkErrors()) {
        console.log('Form validation failed');
        return;
    }

    try {
        const res = await fetch('/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pseudo: username.value,
                email: email.value,
                password_hash: password.value,
                team_id: team_id.value,
            }),
        });

        if (!res.ok) {
            const contentType = res.headers.get('content-type');
            let details = '';

            if (contentType && contentType.includes('application/json')) {
                const errorData = await res.json();
                details = errorData.message || JSON.stringify(errorData);
            } else {
                details = await res.text();
            }

            serverError.value = `Error ${res.status}: ${details}`;
            console.error('Signup failed:', details);
            signupSuccess.value = false;
            return;
        }

        const data = await res.json();
        signupSuccess.value = true;
        console.log('User created:', data);
        serverError.value = '';

    } catch (err) {
        signupSuccess.value = false;
        console.error('Erreur lors de l\'inscription', err);
        serverError.value = err.message || 'Network error during sign up';
    }
}

</script>

<template>
    <div class="relative min-h-screen bg-light-blue overflow-hidden pb-16">

        <div class="absolute inset-x-0 top-0 h-1/2 bg-cover bg-center"
            style="background-image: url('/assets/map.jpg');">
        </div>

        <div class="relative z-10 p-6 min-h-screen flex items-start justify-center">
            <div class="mt-12 flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <h1 class="font-bold text-4xl">Sign in</h1>
                <p class="mt-2 text-center">
                    Sign up to join the Guess The Place application!
                </p>
                <form class="flex flex-col items-center gap-4 w-full" @submit.prevent="signUp">
                    <div class="w-full">
                        <label for="username" class="block text-purple text-sm font-medium ">Username</label>
                        <p :class="usernameError ? 'text-xs text-red' : 'text-xs text-gray-dark'">
                            Must be between 6 and 10 characters and unique.
                        </p>
                        <input type="text" id="username" name="username" v-model="username"
                            class="mt-1 block w-full border border-purple rounded-md shadow-sm p-2" />
                    </div>
                    <div class="w-full">
                        <label for="email" class="block text-sm text-purple font-medium">Email</label>
                        <p v-if="emailError" class="text-xs text-red">Please enter a valid unique email address.</p>
                        <input type="email" id="email" name="email" v-model="email"
                            class="mt-1 block w-full border border-purple rounded-md shadow-sm p-2" />
                    </div>
                    <div class="w-full">
                        <label for="password" class="block text-sm text-purple font-medium ">Password</label>
                        <p :class="passwordError ? 'text-xs text-red' : 'text-xs text-gray-dark'">
                            At least 8 characters long, include at least one uppercase letter, one number and
                            one special character.
                        </p>
                        <input type="password" id="password" name="password" v-model="password"
                            class="mt-1 block w-full border border-purple rounded-md shadow-sm p-2" />
                    </div>
                    <div class="w-full">
                        <div class="flex flex-row gap-4 items-center mb-4"><label for="team"
                                class="block text-sm text-purple font-medium ">Select Team</label>
                            <TheInfoButton
                                label="Pick a team to join the Guess The Place challenge. Team up, guess locations and score points ! Choose wisely—you can’t change teams later." />
                        </div>
                        <p v-if="selectedTeamError" class="text-xs text-red">Please select a team.</p>
                        <select id="team" name="team"
                            class="mt-1 block w-full border border-purple rounded-md shadow-sm p-2" v-model="team_id">
                            <option v-for="team in teams" :key="team._id" :value="team._id">{{ team.name }}</option>
                        </select>
                    </div>
                   <TheButton type="submit" label="Sign in" class="w-full" />
                </form>
                <p v-if="serverError" class="text-xs text-red">{{ serverError }}</p>
                <p v-if="signupSuccess" class=" text-green mt-2">Signup successful! You can now <RouterLink to="/login"
                        class="underline">log in</RouterLink>.</p>
                <RouterLink to="/login" class="text-sm text-purple underline inline-block">Already have
                    an
                    account? Log
                    in
                    here.</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped></style>