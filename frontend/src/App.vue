<script setup></script>

<template>
  <h1 class="font-bold text-red-200">Guess the place !</h1>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/cameraCapture">Camera</RouterLink>
    <RouterLink to="/map">Map</RouterLink>
    <RouterLink to="/ranking">Ranking</RouterLink>
    <RouterLink to="/profile">Profile</RouterLink>
  </nav>
  <router-view />
</template>

<style scoped></style>
