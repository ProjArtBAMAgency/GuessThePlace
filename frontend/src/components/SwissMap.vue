<template>
  <div ref="container" class="w-full h-full">
    <svg ref="svg" class="w-full h-96"></svg>
    <div v-if="picked" class="mt-2 text-sm text-gray-700">Choisi: {{ picked.lat.toFixed(5) }}, {{ picked.lon.toFixed(5) }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

const svg = ref(null)
const picked = ref(null)
const emit = defineEmits(['picked'])

async function loadGeoJSON() {
  try {
    const res = await fetch('/api/v1/zones/map', { credentials: 'include' })
    if (!res.ok) throw new Error('GeoJSON fetch failed')
    return await res.json()
  } catch (e) {
    console.error(e)
    return null
  }
}

onMounted(async () => {
  const data = await loadGeoJSON()
  if (!data) return

  const svgEl = d3.select(svg.value)
  const width = parseInt(svgEl.style('width')) || 800
  const height = parseInt(svgEl.style('height')) || 400

  const projection = d3.geoMercator()
    .fitSize([width, height], data)

  const path = d3.geoPath().projection(projection)

  svgEl.selectAll('path')
    .data(data.features)
    .join('path')
    .attr('d', path)
    .attr('fill', '#E6E6FA')
    .attr('stroke', '#444')
    .attr('stroke-width', 0.4)
    .style('cursor', 'crosshair')

  // Click handler on svg to get lat/lon
  svgEl.on('click', (event) => {
    const [x, y] = d3.pointer(event)
    const coords = projection.invert([x, y])
    if (!coords) return
    const [lon, lat] = coords
    picked.value = { lat, lon }

    // draw marker
    svgEl.selectAll('circle.marker').data([coords])
      .join('circle')
      .attr('class', 'marker')
      .attr('cx', d => projection(d)[0])
      .attr('cy', d => projection(d)[1])
      .attr('r', 6)
      .attr('fill', '#ff4d4f')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)

    // emit Vue event for parent components
    emit('picked', { lat, lon })
  })

})
// allow parent components to listen using @picked.native or addEventListener
</script>

<style scoped>
svg { display: block; }
</style>
