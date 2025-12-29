<script>
import { RouterLink } from 'vue-router';
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

</template>