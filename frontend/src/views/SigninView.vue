<script setup>
import { ref, onMounted } from 'vue'

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
    <div class="container p-4">

        <h1 class="font-bold text-2xl mb-4 ">Sign Up</h1>
        <p class="mb-4 ">
            Sign up to join the Guess The Place application!
        </p>
        <form @submit.prevent="signUp">
            <div class="mb-4">
                <label for="username" class="block text-sm font-medium ">Username</label>
                <p :class="usernameError ? 'text-xs text-red' : 'text-xs text-gray-dark'">
                    Must be between 6 and 10 characters and unique.
                </p>
                <input type="text" id="username" name="username" v-model="username"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div class="mb-4">
                <label for="email" class="block text-sm font-medium">Email</label>
                <p v-if="emailError" class="text-xs text-red">Please enter a valid unique email address.</p>
                <input type="email" id="email" name="email" v-model="email"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div class="mb-4">
                <label for="password" class="block text-sm font-medium ">Password</label>
                <p :class="passwordError ? 'text-xs text-red' : 'text-xs text-gray-dark'">
                    Must be at least 8 characters long and include at least one uppercase letter, one number and one
                    special character.
                </p>
                <input type="password" id="password" name="password" v-model="password"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div class="mb-4">
                <label for="team" class="block text-sm font-medium ">Select Team</label>
                <p class="text-xs text-gray-dark">Pick a team from the list below, be careful, you wont be able to
                    change it
                    later.</p>
                <p v-if="selectedTeamError" class="text-xs text-red">Please select a team.</p>
                <select id="team" name="team" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    v-model="team_id">
                    <option v-for="team in teams" :key="team._id" :value="team._id">{{ team.name }}</option>
                </select>
            </div>
            <button type="submit"
                class="text-white bg-purple px-4 py-2 rounded-md border hover:bg-white hover:text-purple">Sign
                Up</button>
        </form>
        <p v-if="serverError" class="text-xs text-red">{{ serverError }}</p>
        <p v-if="signupSuccess" class=" text-green mt-2">Signup successful! You can now <RouterLink to="/login"
                class="underline">log in</RouterLink>.</p>
        <RouterLink to="/login" class="text-sm text-gray-text-purple underline mt-4 inline-block">Already have an
            account? Log
            in
            here.</RouterLink>
    </div>
</template>

<style scoped></style>