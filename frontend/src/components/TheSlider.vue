<template>
  <div class="w-full max-w-xl mx-auto">
    <!-- Card -->
    <div
      class="rounded-2xl p-5 shadow-sm border"
      :style="{
        backgroundColor: 'var(--color-gray-light)',
        borderColor: 'rgba(0,0,0,0.08)',
      }"
    >
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-base font-semibold"
          :style="{ color: 'var(--color-gray-dark)' }"
        >
          Team possession
        </h2>

        <div
          class="text-xs font-medium px-3 py-1 rounded-full"
          :style="{
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-gray-dark)',
          }"
        >
          Live
        </div>
      </div>

      <div
        class="relative h-8 rounded-full overflow-hidden flex"
        :style="{ backgroundColor: 'var(--color-white)' }"
      >
        <!-- Team A -->
        <div
          class="h-full transition-all duration-500"
          :style="{
            width: percentA + '%',
            backgroundColor: teamA?.color || 'var(--color-gray-light)',
          }"
        ></div>

        <!-- Team B -->
        <div
          class="h-full transition-all duration-500"
          :style="{
            width: 100 - percentA + '%',
            backgroundColor: teamB?.color || 'var(--color-gray-dark)',
          }"
        ></div>

        <!-- Thumb -->
        <div
          class="absolute top-1/2 w-6 h-6 rounded-full border-2 shadow-sm transition-all duration-500"
          :style="{
            left: percentA + '%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--color-white)',
            borderColor: 'rgba(0,0,0,0.15)',
          }"
        ></div>
      </div>

      <!-- Labels -->
      <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <!-- Left label -->
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: teamA?.color || 'var(--color-purple)' }"
          ></span>
          <span
            class="font-medium"
            :style="{ color: 'var(--color-gray-dark)' }"
          >
            {{ teamA?.name || "Team A" }}
          </span>
          <span
            class="ml-auto font-semibold"
            :style="{ color: 'var(--color-black)' }"
          >
            {{ percentA }}%
          </span>
        </div>

        <!-- Right label -->
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full"
            :style="{
              backgroundColor: teamB?.color || 'var(--color-gray-dark)',
            }"
          ></span>
          <span
            class="font-medium"
            :style="{ color: 'var(--color-gray-dark)' }"
          >
            {{ teamB?.name || "Team B" }}
          </span>
          <span
            class="ml-auto font-semibold"
            :style="{ color: 'var(--color-black)' }"
          >
            {{ percentB }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { WSClient, WSClientRoom } from 'wsmini';

const teamA = ref(null);
const teamB = ref(null);
const percentA = ref(50);
const percentB = ref(50);

let ws = null;

// Base URL API (front .env) : VITE_API_BASE_URL=https://www.guesstheplace.ch

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (location.hostname === "localhost" ? "https://www.guesstheplace.ch" : "");

/**
 * 1) REST: état initial
 */
async function fetchInitialPossession() {
  try {
    const res = await fetch("/api/v1/teams/possession", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    console.log("REST possession:", data);
    applyData(data); 
  } catch (err) {
    console.error("Failed to fetch possession", err);
  }
}


/**
 * 2) Appliquer l'état (REST ou WS)
 */
function applyData(data) {
  // Support backend formats:
  // 1) frontend format: { teamA, teamB, percentA }
  // 2) backend format: { blue: {score, guesses}, red: {score, guesses} }

  if (data?.blue && data?.red) {
    const blue = data.blue;
    const red = data.red;
    const scoreBlue = Number(blue.score ?? 0);
    const scoreRed = Number(red.score ?? 0);
    const total = scoreBlue + scoreRed;

    // Map to frontend-friendly team objects (backend may not include name/color)
    teamA.value = {
      name: blue.name ?? "Blue Team",
      color: blue.color ?? "#3b82f6",
      score: scoreBlue,
      guesses: blue.guesses ?? [],
    };
    teamB.value = {
      name: red.name ?? "Red Team",
      color: red.color ?? "#ef4444",
      score: scoreRed,
      guesses: red.guesses ?? [],
    };

    const a = total > 0 ? Math.round((scoreBlue / total) * 100) : 50;
    percentA.value = Math.max(0, Math.min(100, a));
    percentB.value = 100 - percentA.value;
    return;
  }

  // Fallback to existing frontend format
  teamA.value = data.teamA ?? null;
  teamB.value = data.teamB ?? null;

  const a = Math.max(0, Math.min(100, Number(data.percentA ?? 50)));
  percentA.value = a;
  percentB.value = 100 - a;
}

/**
 * 3) WS: mises à jour live
 */
function setupWebSocket() {
  // En dev avec Vite, location.host = localhost:5173
  // Donc il faut viser le backend: localhost:3000
  // En prod (guesstheplace.ch), tu peux rester sur le même host
  const isLocal = location.hostname === "localhost";

  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const wsHost = isLocal ? "localhost:3000" : location.host;
  const wsUrl = `${protocol}://${wsHost}/ws`;

  try {
    ws = new WSClient(wsUrl);
  } catch (e) {
    console.error("WSClient init failed:", e);
    return;
  }

  // 1) Connexion
  Promise.resolve(ws.connect())
    .then(async () => {
      // 2) Subscribe + handler (le handler reçoit exactement ce que le serveur pub)
      await ws.sub("possession", (msg) => {
          // msg = { type: "possession:update", payload: {...} }
          if (msg?.type === "possession:update" && msg?.payload) {
            applyData(msg.payload);
            return;
          }

          // Support si un jour tu envoies { type, data }
          if (msg?.type === "possession:update" && msg?.data) {
            applyData(msg.data);
            return;
          }

          // Fallback si backend envoie direct le payload
          if (msg?.percentA != null) {
            applyData(msg);
          }
      });
    })
    .catch((e) => console.error("WS connect/subscribe failed:", e));
}

onMounted(async () => {
  await fetchInitialPossession();
  setupWebSocket();
});

</script>
