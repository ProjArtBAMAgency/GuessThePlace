<script setup>
import { ref, onMounted } from 'vue'
import SwissMap from '@/components/SwissMap.vue'

// Local UI state for in-page game
const isPlaying = ref(false)
const selectedPostId = ref(null)
const lastPick = ref(null)

// Liste des posts chargés depuis l'API
const availablePosts = ref([])

// Le post tiré aléatoirement
const currentPost = ref(null)

// Charger des posts validés (limités à 15) pour ne pas surcharger le load au chargement de la page
async function loadPosts() {
  try {
    const res = await fetch('/api/v1/posts?isValidated=true&limit=15', { credentials: 'include' })
    const data = await res.json()

    availablePosts.value = data
    // Enrichir les posts avec le pseudo de l'auteur si l'API ne le fournit pas
    await enrichAuthors(availablePosts.value)
    pickRandomPost() // Tirage immédiat
  } catch (err) {
    console.error('Erreur lors du chargement des posts', err)
  }
}

// Récupère les infos d'auteur manquantes (/api/v1/users/:id)
async function enrichAuthors(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return

  await Promise.all(posts.map(async (p) => {
    try {
      if ((!p.user || !p.user.pseudo) && p.userId) {
        const uid = typeof p.userId === 'string' ? p.userId : (p.userId?._id ?? null)
        if (!uid) return
        const res = await fetch(`/api/v1/users/${uid}`, { credentials: 'include' })
        if (!res.ok) return
        const userData = await res.json()
        p.user = { _id: userData._id, pseudo: userData.pseudo }
      }
    } catch (e) {
      // ignore individual author fetch errors
      return
    }
  }))
}

// Tirage aléatoire d’un post et suppression dans le tableau
function pickRandomPost() {
  if (availablePosts.value.length === 0) {
    currentPost.value = null
    return
  }

  const index = Math.floor(Math.random() * availablePosts.value.length)
  currentPost.value = availablePosts.value[index]

  // Pour éviter les doublons dans la session
  availablePosts.value.splice(index, 1)
}

// Démarrer le jeu → aller sur /game/:id
function startGuess() {
  if (!currentPost.value) return
  selectedPostId.value = currentPost.value._id
  isPlaying.value = true
}

function onPicked(coords) {
  lastPick.value = coords
}

function confirmGuess() {
  if (!selectedPostId.value || !lastPick.value) return
  // For now we just log / store locally; backend submit can be added later
  console.log('Confirm guess for', selectedPostId.value, lastPick.value)
  // lock UI
  isPlaying.value = false
}

onMounted(() => {
  loadPosts()
})
</script>

<template>
  <div class="flex flex-col px-6 pt-4 pb-24">

    <!-- Titre -->
    <h1 class="text-xl font-extrabold tracking-tight mb-2 text-purple mt-7 ">
      GUESS THE PLACE
    </h1>


    <!-- Texte intro -->
    <p class="text-gray-600 max-w-md mb-6 leading-relaxed">
      Guess where this photo was taken! Take a good look… think you know?
      When you’re ready, tap Start to place your pin on the map.
    </p>

    <!-- Loading -->
    <div v-if="!currentPost">
      <p class="text-gray-500">Loading post...</p>
    </div>

    <!-- Image + auteur + bouton -->
    <div v-else class="w-full flex flex-col items-center mt-7">

      <!-- Pre-start info: hidden when playing -->
      <div v-if="!isPlaying" class="w-full flex flex-col items-center">
        <!-- Image -->
        <div class="relative w-full max-w-md mb-5">
          <img
            :src="`/api/v1/posts/${currentPost._id}/picture`"
            alt="Preview"
            class="w-full h-52 object-cover rounded-3xl opacity-100 mb-5"
          />

          <!-- Auteur -->
          <p class="absolute right-4 text-xs text-purple font-medium">
            @{{ currentPost.user?.pseudo ?? currentPost.userId?.pseudo ?? 'Unknown' }}
          </p>
        </div>

        <!-- Bouton Start -->
        <button
          class="bg-purple text-white w-70 py-3 rounded-full text-lg font-semibold shadow-lg active:scale-95 transition mt-5"
          @click="startGuess"
        >
          Start
        </button>
      </div>

      <!-- Map inline when playing: layout updated to match mock -->
      <div v-if="isPlaying" class="w-full flex flex-col items-center mt-6">
        <div class="w-full max-w-2xl">
          <!-- title and instruction removed during playing as requested -->

          <div class="rounded-3xl overflow-hidden border-4 border-blue-100 shadow-lg" style="background:white;">
            <div class="p-3">
              <SwissMap @picked="onPicked" />
            </div>
          </div>

          <div class="mt-6">
            <button
              class="bg-purple text-white w-full max-w-2xl py-5 rounded-full text-lg font-semibold shadow-lg active:scale-95 transition"
              @click="confirmGuess"
            >
              Confirm
            </button>
          </div>

          <div class="mt-3 text-sm text-gray-700">Post: {{ currentPost?.user?.pseudo ?? currentPost?.userId?.pseudo ?? selectedPostId }}</div>
          <div v-if="lastPick" class="mt-2 text-sm">Votre choix: {{ lastPick.lat.toFixed(5) }}, {{ lastPick.lon.toFixed(5) }}</div>

          <div class="mt-4">
            <button class="text-sm text-gray-600 underline" @click="isPlaying = false">Cancel</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
