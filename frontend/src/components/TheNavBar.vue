<script setup>
import { RouterLink } from 'vue-router'
</script>


<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/camera">Camera</RouterLink>
    <RouterLink to="/map">Map</RouterLink>
    <RouterLink to="/ranking">Ranking</RouterLink>
    <RouterLink to="/profile">Profile</RouterLink>
  </nav>

</template>