<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getAvailablePosts } from '@/composables/api/getAvailablePosts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import SwissMap from '@/components/SwissMap.vue'


const isPlaying = ref(false)
const selectedPostId = ref(null)
const lastPick = ref(null)
const isLoading = ref(true)
const page = ref(1)
const limit = ref(50)

const guessResult = ref(null)
const errorMessage = ref(null)
const isSubmitting = ref(false)

// List of posts loaded from the API
const availablePosts = ref([])

// The randomly selected post
const currentPost = ref(null)

// Load available posts using the dedicated API endpoint
async function loadPosts() {
  isLoading.value = true
  try {
    const result = await getAvailablePosts(page.value, limit.value)
    
    if (result.error) {
      console.error('Error loading posts:', result.error)
      availablePosts.value = []
    } else {
      // Backend already filters posts the user hasn't posted and hasn't guessed
      availablePosts.value = result.posts?.posts || []
    }
    
    if (!currentPost.value) pickRandomPost() // Immediate draw only if no external selection
  } catch (err) {
    console.error('Error loading posts', err)
    availablePosts.value = []
  } finally {
    isLoading.value = false
  }
}

// Random draw of a post and removal from the array
function pickRandomPost() {
  if (availablePosts.value.length === 0) {
    currentPost.value = null
    return
  }

  const index = Math.floor(Math.random() * availablePosts.value.length)
  currentPost.value = availablePosts.value[index]

  // To avoid duplicates in the session
  availablePosts.value.splice(index, 1)
}

// Start the game by selecting the current post
function startGuess() {
  if (!currentPost.value) return
  selectedPostId.value = currentPost.value._id
  isPlaying.value = true
}

function onPicked(coords) {
  lastPick.value = coords
}

// container for result map
const resultMapContainer = ref(null)
let resultMap = null
let resultMarkers = []

function clearResultMap() {
  if (resultMap) {
    resultMap.remove()
    resultMap = null
    resultMarkers = []
  }
}

function renderResultMap(gu) {
  clearResultMap()
  if (!gu || !resultMapContainer.value) return

  // initialize map centered between points
  const centerLat = (gu.guessed.lat + (gu.real.lat ?? gu.guessed.lat)) / 2
  const centerLon = (gu.guessed.lon + (gu.real.lon ?? gu.guessed.lon)) / 2

  resultMap = L.map(resultMapContainer.value).setView([centerLat, centerLon], 6)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(resultMap)

  // markers
  const guessedMarker = L.circleMarker([gu.guessed.lat, gu.guessed.lon], { radius: 8, color: '#7c3aed' }).addTo(resultMap)
  resultMarkers.push(guessedMarker)
  if (gu.real && gu.real.lat != null && gu.real.lon != null) {
    const realMarker = L.circleMarker([gu.real.lat, gu.real.lon], { radius: 8, color: '#3b82f6' }).addTo(resultMap)
    resultMarkers.push(realMarker)

    // polyline
    L.polyline([[gu.guessed.lat, gu.guessed.lon], [gu.real.lat, gu.real.lon]], { color: '#888' }).addTo(resultMap)

    // fit bounds
    const bounds = L.latLngBounds([[gu.guessed.lat, gu.guessed.lon], [gu.real.lat, gu.real.lon]])
    resultMap.fitBounds(bounds.pad(0.3))
  } else {
    resultMap.setView([gu.guessed.lat, gu.guessed.lon], 12)
  }
}

async function confirmGuess() {
  if (!selectedPostId.value) {
    errorMessage.value = 'Aucun post sélectionné.'
    return
  }

  if (!lastPick.value) {
    errorMessage.value = 'Place a pin on the map before confirming.'
    return
  }

  errorMessage.value = null
  isSubmitting.value = true

  try {
    console.log('confirmGuess invoked', { selectedPostId: selectedPostId.value, lastPick: lastPick.value })

    const payload = {
      postId: selectedPostId.value,
      guessedLat: lastPick.value.lat,
      guessedLon: lastPick.value.lon,
    }

    console.log('guesses payload', payload)

    const res = await fetch('/api/v1/guesses', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      let errText = 'Server error'
      try {
        const j = await res.json()
        console.log('guesses error json', j)
        errText = j.error || j.message || JSON.stringify(j)
      } catch (e) {
        const txt = await res.text().catch(() => null)
        console.log('guesses error text', txt)
        errText = txt || 'Server error'
      }
      errorMessage.value = errText
      isSubmitting.value = false
      return
    }

    const data = await res.json()
    console.log('guesses success', data)

    // extract values
    const scoreValue = data.score ?? data.guess?.score ?? 0
    const distanceValue = data.distance ?? data.guess?.distance ?? 0

    let realLat = currentPost.value?.latitude
    let realLon = currentPost.value?.longitude
    if (realLat == null || realLon == null) {
      try {
        const pRes = await fetch(`/api/v1/posts/${selectedPostId.value}`, { credentials: 'include' })
        if (pRes.ok) {
          const postData = await pRes.json()
          realLat = postData.latitude
          realLon = postData.longitude
        }
      } catch (e) {
        // ignore
      }
    }

    guessResult.value = {
      score: scoreValue,
      distance: distanceValue,
      guessed: { lat: lastPick.value.lat, lon: lastPick.value.lon },
      real: { lat: realLat, lon: realLon },
    }

    // render the result map
    // wait next tick for DOM
    setTimeout(() => renderResultMap(guessResult.value), 50)

    isPlaying.value = false
    isSubmitting.value = false
  } catch (e) {
    console.error('Confirm guess failed', e)
    errorMessage.value = e.message || 'Network error'
    isSubmitting.value = false
  }
}

function nextGame() {
  guessResult.value = null
  lastPick.value = null
  selectedPostId.value = null
  currentPost.value = null
  isPlaying.value = false
  clearResultMap()
  
  // If no more posts available, reload
  if (availablePosts.value.length === 0) {
    loadPosts()
  } else {
    pickRandomPost()
  }
}

onBeforeUnmount(() => {
  clearResultMap()
})

onMounted(async () => {
  await loadPosts()
})
</script>

<template>
  <div class="flex flex-col px-6 pt-4 pb-24 min-h-screen items-center justify-center mx-auto max-w-4xl mb-20">
    <div class="flex justify-center mb-4">
      <img src="/assets/logo-GTP.png" alt="Guess The Place Logo" class="h-20 w-auto" />
    </div>
   
    <template v-if="guessResult">
      <!-- Result panel only -->
      <div class="w-full flex flex-col items-center mt-6">
        <div class="w-full max-w-2xl text-center mb-4">
          <h2 class="text-xl font-semibold">Here's the result</h2>
          <p class="mt-2">Your guess was <span class="font-extrabold text-purple">{{ (guessResult.distance/1000).toFixed(2) }} km</span> from the real location.</p>
        </div>
        <div class="w-full max-w-2xl rounded-3xl overflow-hidden border-2 border-purple shadow-lg">
          <div ref="resultMapContainer" class="w-full h-80"></div>
        </div>
        <div class="mt-6 text-center">
          <div class="text-4xl font-extrabold text-purple">+{{ guessResult.score }} pts</div>
          <div class="text-2xl font-bold mt-2">{{ (guessResult.distance/1000).toFixed(2) }} KM</div>
        </div>
        <div class="mt-6 w-full max-w-2xl">
          <button class="bg-purple text-white w-full py-4 rounded-full text-lg font-semibold" @click="nextGame">Next game</button>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Game section -->
      <div v-if="isLoading" class="text-center">
        <p class="text-gray-500">Loading posts...</p>
      </div>
      <div v-else-if="!currentPost && availablePosts.length === 0" class="text-center">
        <p class="text-gray-500">No posts available. You've already guessed all available posts! 🎉</p>
      </div>
      <div v-else-if="!currentPost" class="text-center">
        <p class="text-gray-500">Loading post...</p>
      </div>
      <div v-else class="w-full flex flex-col items-center mt-7">
        <!-- Texte présent que l'on joue ou non -->
        <p class="text-gray-600 max-w-md mb-6 leading-relaxed text-center" v-if="!isPlaying">
          Guess where this photo was taken! Take a good look… think you know?
          When you're ready, tap Start to place your pin on the map.
        </p>
        <h2 class="text-lg font-semibold text-gray-800 mb-4 text-center" v-if="isPlaying">
          Guess where this photo was taken!
        </h2>
        
        <!-- Photo du post (toujours visible) -->
        <div class="relative w-full max-w-md mb-5">
          <img
            :src="`/api/v1/posts/${currentPost._id}/picture`"
            alt="Preview"
            class="w-full h-52 object-cover rounded-3xl opacity-100 mb-5 shadow-lg border-2 border-purple"
          />
          
        </div>

        <!-- Bouton Start (seulement quand on ne joue pas) -->
        <div v-if="!isPlaying" class="w-full flex flex-col items-center">
          <button
            class="bg-purple text-white w-70 py-3 rounded-full text-lg font-semibold shadow-lg active:scale-95 transition mt-5"
            @click="startGuess"
          >
            Start
          </button>
        </div>

        <!-- Map et boutons (seulement quand on joue) -->
        <div v-if="isPlaying" class="w-full flex flex-col items-center mb-24">
          <div class="w-full max-w-2xl">
            <div class="rounded-3xl overflow-hidden border-2 border-purple shadow-lg">
              <div class="h-80">
                <SwissMap @picked="onPicked" />
              </div>
            </div>
            <div class="mt-6">
              <button
                class="bg-purple text-white w-full max-w-2xl py-5 rounded-full text-lg font-semibold shadow-lg active:scale-95 transition"
                @click="confirmGuess"
                :disabled="isSubmitting"
              >
                Confirm
              </button>
            </div>
            
            <!-- Error message display -->
            <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p class="font-semibold">❌ {{ errorMessage }}</p>
            </div>
            
            <div class="mt-3 text-sm text-gray-700">Post: {{ currentPost?.userId?.pseudo ?? selectedPostId }}</div>
            
            <div class="mt-4">
              <button 
                class="border-2 border-purple text-purple w-full max-w-2xl py-1 rounded-full text-lg font-semibold shadow-lg hover:bg-purple hover:text-white transition-all duration-200 active:scale-95" 
                @click="isPlaying = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
