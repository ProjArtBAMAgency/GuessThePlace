<template>
  <div class="leaflet-container w-full h-96" ref="mapContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const emit = defineEmits(['picked'])
const mapContainer = ref(null)
let map = null
let marker = null
let resizeHandler = null

function safeInvalidate() {
  try { map.invalidateSize() } catch (e) { /* ignore */ }
}

onMounted(() => {
  // ensure default marker icons are resolved by the bundler
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
  })

  // initialize map centered on Switzerland
  map = L.map(mapContainer.value, { zoomControl: true }).setView([46.8, 8.23], 8)

  // Use OpenStreetMap tiles (simple and permissive)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // (Swiss overlay removed — keeping base map and click/marker behavior)

  // ensure Leaflet recalculates size after render (fix hidden/collapsed container issues)
  map.whenReady(() => {
    setTimeout(safeInvalidate, 100)
    setTimeout(safeInvalidate, 300)
    setTimeout(safeInvalidate, 800)
  })

  // also handle window resize
  resizeHandler = () => safeInvalidate()
  window.addEventListener('resize', resizeHandler)

  map.on('click', (e) => {
    const { lat, lng } = e.latlng

    // place or move marker
    if (!marker) {
      marker = L.marker([lat, lng], { riseOnHover: true }).addTo(map)
    } else {
      marker.setLatLng([lat, lng])
    }

    emit('picked', { lat, lon: lng })
  })
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>

<style scoped>
.leaflet-container { height: 100%; width: 100%; min-height: 420px; }
.leaflet-control-zoom { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
</style>
  svgEl.on('click', (event) => {
