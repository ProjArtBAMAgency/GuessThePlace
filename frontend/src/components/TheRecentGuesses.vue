<template>
	<section class="w-full bg-gray-50 border border-gray-50 rounded-xl p-4">

		<h3 class="text-lg font-semibold mb-3">Recently played games</h3>

		<div v-if="loading" class="text-gray-500">Loading…</div>
		<div v-else>
			<ul v-if="guesses.length" class="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
				<li v-for="guess in guesses" :key="guess._id" class="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">{{ (guess.user?.pseudo || 'A').slice(0,1).toUpperCase() }}</div>
						<div>
							<div class="text-sm font-semibold text-purple">{{ guess.user?.pseudo || 'Anonyme' }}</div>
							<div class="text-xs text-gray-500">Post: <span class="font-medium">#{{ (typeof guess.post === 'string' ? guess.post : (guess.post?._id || '—')) }}</span></div>
						</div>
					</div>

					<div class="flex items-center space-x-3">
						<div class="text-sm font-bold text-purple-600">+{{ guess.score }} pts</div>
					</div>
				</li>
			</ul>
			<div v-else class="text-gray-500">No recent guesses.</div>
		</div>
	</section>
</template>

<script setup>
import { ref, onMounted, defineProps, onBeforeUnmount } from 'vue';
import { WSClient } from 'wsmini';


const props = defineProps({
	limit: { type: Number, default: 10 }
});

const guesses = ref([]);
const loading = ref(true);
const error = ref(null);

let ws= null;

const fetchRecentGuesses = async () => {
	loading.value = true;
	try {
		const res = await fetch(`/api/v1/guesses?limit=${props.limit}`, {
			credentials: 'include',
			cache: 'no-store',
		});
		if (!res.ok) throw new Error('Erreur lors de la récupération');
		const data = await res.json();
		guesses.value = Array.isArray(data) ? data : [];
		error.value = null;
	} catch (err) {
		console.error(err);
		error.value = 'Impossible de charger les dernières devinettes.';
	} finally {
		loading.value = false;
	}
};

function setupWebSocket() {
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
      await ws.sub("possession", () => {
          fetchRecentGuesses();
		  console.log("Received possession update, refreshed recent guesses.");
      });
    })
    .catch((e) => console.error("WS connect/subscribe failed:", e));
}

onMounted(async () => {
	await fetchRecentGuesses();
	setupWebSocket();
});
</script>

<style scoped>
.recent-guesses {
	padding: 0.6rem;
}
.recent-guesses h3 {
	margin: 0 0 0.4rem 0;
	font-size: 1rem;
}
.guess-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.45rem 0;
	border-bottom: 1px solid #eee;
}
.guess-left .player {
	display: block;
}
.guess-left .post {
	font-size: 0.9rem;
	color: #666;
}
.score {
	background: #f5f5f5;
	padding: 0.25rem 0.5rem;
	border-radius: 6px;
}
</style>

