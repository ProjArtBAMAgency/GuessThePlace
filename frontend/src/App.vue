<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import TheNavBar from './components/TheNavBar.vue'

const route = useRoute()
const hideNavbarRoutes = ['/login', '/signin']
const showNavbar = computed(() => !hideNavbarRoutes.includes(route.path))
</script>

<template>
  <TheNavBar v-if="showNavbar" />
  <router-view />
</template>

<style scoped></style>