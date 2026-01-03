<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import SwissMap from '@/components/SwissMap.vue'

// Local UI state for in-page game
const isPlaying = ref(false)
const selectedPostId = ref(null)
const lastPick = ref(null)

// List of posts loaded from the API
const availablePosts = ref([])

// The randomly selected post
const currentPost = ref(null)

// Load validated posts (limited to 50) and filter those the user has already guessed
async function loadPosts() {
  try {
    // Get userId from localStorage
    let userId = null
    try {
      const stored = JSON.parse(localStorage.getItem('currentUser') || 'null')
      if (stored && stored._id) userId = stored._id
    } catch (e) {
      console.warn('Could not get userId from localStorage', e)
    }

    // Load validated posts
    const res = await fetch('/api/v1/posts?isValidated=true&limit=50', { credentials: 'include' })
    const data = await res.json()

    // If we have a userId, get their guesses to filter
    let guessedPostIds = []
    if (userId) {
      try {
        const guessRes = await fetch(`/api/v1/guesses/user/${userId}`, { credentials: 'include' })
        if (guessRes.ok) {
          const guesses = await guessRes.json()
          // Extract IDs of already guessed posts
          guessedPostIds = guesses.map(g => {
            // The post can be either an object or just an ID
            return typeof g.post === 'string' ? g.post : g.post?._id
          }).filter(Boolean)
        }
      } catch (e) {
        console.warn('Could not fetch user guesses', e)
      }
    }

    // Filter posts not yet guessed
    const unguessedPosts = data.filter(post => !guessedPostIds.includes(post._id))
    
    availablePosts.value = unguessedPosts
    // Enrich posts with author pseudo if API doesn't provide it
    await enrichAuthors(availablePosts.value)
    pickRandomPost() // Immediate draw
  } catch (err) {
    console.error('Error loading posts', err)
  }
}

// Fetch missing author info (/api/v1/users/:id)
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

// Start the game → go to /game/:id
function startGuess() {
  if (!currentPost.value) return
  selectedPostId.value = currentPost.value._id
  isPlaying.value = true
}

function onPicked(coords) {
  lastPick.value = coords
}

const guessResult = ref(null)
const errorMessage = ref(null)
const isSubmitting = ref(false)
const userIdPrompt = ref(null)
const manualUserId = ref('')

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

    // include userId from localStorage when available (fallback for cookie-only auth)
    let userId = null
    try {
      const stored = JSON.parse(localStorage.getItem('currentUser') || 'null')
      if (stored && stored._id) userId = stored._id
    } catch (e) {
      userId = null
    }

    const payload = {
      postId: selectedPostId.value,
      guessedLat: lastPick.value.lat,
      guessedLon: lastPick.value.lon,
    }
    if (userId) payload.userId = userId

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
      // If server indicates missing data, allow manual userId input to retry
      if (errText && errText.toString().toLowerCase().includes('donn')) {
        userIdPrompt.value = true
      }
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

onMounted(() => {
  loadPosts()
})

async function submitWithManualUserId() {
  if (!manualUserId.value) return
  errorMessage.value = null
  isSubmitting.value = true
  try {
    const res = await fetch('/api/v1/guesses', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: manualUserId.value,
        postId: selectedPostId.value,
        guessedLat: lastPick.value.lat,
        guessedLon: lastPick.value.lon,
      }),
    })

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      errorMessage.value = j.error || j.message || `HTTP ${res.status}`
      isSubmitting.value = false
      return
    }

    const data = await res.json()
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
      } catch (e) {}
    }

    guessResult.value = {
      score: scoreValue,
      distance: distanceValue,
      guessed: { lat: lastPick.value.lat, lon: lastPick.value.lon },
      real: { lat: realLat, lon: realLon },
    }

    setTimeout(() => renderResultMap(guessResult.value), 50)
    userIdPrompt.value = false
    manualUserId.value = ''
    isPlaying.value = false
    isSubmitting.value = false
  } catch (e) {
    errorMessage.value = e.message || 'Network error'
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col px-6 pt-4 pb-24">
    <h1 class="text-xl font-extrabold tracking-tight mb-2 text-purple mt-7 ">GUESS THE PLACE</h1>
    <template v-if="guessResult">
      <!-- Result panel only -->
      <div class="w-full flex flex-col items-center mt-6">
        <div class="w-full max-w-2xl text-center mb-4">
          <h2 class="text-xl font-semibold">Here's the result</h2>
          <p class="mt-2">Your guess was <span class="font-extrabold text-purple">{{ (guessResult.distance/1000).toFixed(2) }} km</span> from the real location.</p>
        </div>
        <div class="w-full max-w-2xl rounded-3xl overflow-hidden border-4 border-blue-100 shadow-lg bg-white p-3">
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
      <!-- ...existing code for intro, image, start, map, etc... -->
      <p class="text-gray-600 max-w-md mb-6 leading-relaxed">
        Guess where this photo was taken! Take a good look… think you know?
        When you’re ready, tap Start to place your pin on the map.
      </p>
      <div v-if="!currentPost && availablePosts.length === 0">
        <p class="text-gray-500">No posts available. You've already guessed all available posts! 🎉</p>
      </div>
      <div v-else-if="!currentPost">
        <p class="text-gray-500">Loading post...</p>
      </div>
      <div v-else class="w-full flex flex-col items-center mt-7">
        <div v-if="!isPlaying" class="w-full flex flex-col items-center">
          <div class="relative w-full max-w-md mb-5">
            <img
              :src="`/api/v1/posts/${currentPost._id}/picture`"
              alt="Preview"
              class="w-full h-52 object-cover rounded-3xl opacity-100 mb-5"
            />
            <p class="absolute right-4 text-xs text-purple font-medium">
              @{{ currentPost.user?.pseudo ?? currentPost.userId?.pseudo ?? 'Unknown' }}
            </p>
          </div>
          <button
            class="bg-purple text-white w-70 py-3 rounded-full text-lg font-semibold shadow-lg active:scale-95 transition mt-5"
            @click="startGuess"
          >
            Start
          </button>
        </div>
        <div v-if="isPlaying" class="w-full flex flex-col items-center mt-6">
          <div class="w-full max-w-2xl">
            <div class="rounded-3xl overflow-hidden border-4 border-blue-100 shadow-lg" style="background:white;">
              <div class="p-3">
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
            <div class="mt-3 text-sm text-gray-700">Post: {{ currentPost?.user?.pseudo ?? currentPost?.userId?.pseudo ?? selectedPostId }}</div>
            
            <div class="mt-4">
              <button class="text-sm text-gray-600 underline" @click="isPlaying = false">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
