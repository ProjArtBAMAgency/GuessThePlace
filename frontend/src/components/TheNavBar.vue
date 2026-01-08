<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div
    class="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-default"
    style="z-index: 9999;"
  >
    <div class="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
      <!-- Home -->
      <RouterLink
        to="/"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-neutral-secondary-medium group active:bg-violet-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-house-icon lucide-house"
          :class="{ 'text-purple': route.path === '/' }"
        >
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <path
            d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          />
        </svg>

        <span class="text-sm text-body group-hover:text-fg-brand" :class="{ 'text-purple': route.path === '/' }">Home</span>
      </RouterLink>

      <!-- Camera -->
      <RouterLink
        to="/cameraCapture"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-neutral-secondary-medium group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-camera-icon lucide-camera"
          :class="{ 'text-purple': route.path === '/cameraCapture' }"
        >
          <path
            d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"
          />
          <circle cx="12" cy="13" r="3" />
        </svg>
        <span class="text-sm text-body group-hover:text-fg-brand" :class="{ 'text-purple': route.path === '/cameraCapture' }">Camera</span>
      </RouterLink>

      <!-- Teams -->
      <RouterLink
        to="/map"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-neutral-secondary-medium group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-users-icon lucide-users"
          :class="{ 'text-purple': route.path === '/map' }"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>

        <span class="text-sm text-body group-hover:text-fg-brand" :class="{ 'text-purple': route.path === '/map' }">Team</span>
      </RouterLink>

      <!-- Ranking -->
      <RouterLink
        to="/ranking"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-neutral-secondary-medium group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-trophy-icon lucide-trophy "
         :class="{ 'text-purple': route.path === '/ranking' }"

          
        >
          <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
          <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
          <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
          <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
        </svg>
        <span class="text-sm text-body group-hover:text-fg-brand" :class="{ 'text-purple': route.path === '/ranking' }">Ranking</span>
      </RouterLink>

      <!-- Profile -->
      <RouterLink
        to="/profile"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-neutral-secondary-medium group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-user-icon lucide-user"
          :class="{ 'text-purple': route.path === '/profile' }"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="text-sm text-body group-hover:text-fg-brand" :class="{ 'text-purple': route.path === '/profile' }">Profile</span>
      </RouterLink>
    </div>
  </div>
</template>
