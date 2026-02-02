<template>
  <div class="relative w-full h-full bg-stone-900 overflow-hidden select-none">
    
    <!-- Main Image Interaction Layer -->
    <div class="relative w-full h-full cursor-crosshair" @click="handleImageClick">
      <img 
        ref="mainImage"
        :src="image" 
        class="w-full h-full object-cover opacity-60 transition-all duration-500"
        :class="{ 'opacity-100': isCompleted }"
        @load="initGame"
      />

      <!-- Found Markers -->
      <div 
        v-for="(zone, index) in foundZones" 
        :key="index"
        class="absolute border-2 border-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none transition-all duration-500"
        :style="{ 
          left: `${zone.x}%`, 
          top: `${zone.y}%`, 
          width: `${zone.size}%`, 
          paddingBottom: `${zone.size}%`, // Aspect ratio hack
          transform: 'translate(-50%, -50%) scale(1)'
        }"
      ></div>
      
       <!-- Click Feedback (Ripple) -->
       <div v-if="clickFeedback" 
           class="absolute rounded-full border border-white/50 animate-ping pointer-events-none"
           :style="{ left: clickFeedback.x + 'px', top: clickFeedback.y + 'px', width: '40px', height: '40px', transform: 'translate(-50%, -50%)' }">
       </div>
    </div>

    <!-- UI Overlay: Targets -->
    <div v-if="!isCompleted" class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-8 pointer-events-none">
      <div class="pointer-events-auto bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl mx-4 mb-4 flex flex-col items-center">
      <h2 class="text-white font-serif text-xl mb-4 text-shadow font-bold" style="color: white !important;">Retrouvez ces détails...</h2>
      
      <div class="flex gap-4 md:gap-8">
        <div 
          v-for="(zone, index) in activeZones" 
          :key="index"
          class="relative w-24 h-24 rounded-full border-4 overflow-hidden bg-black transition-all duration-300 bg-no-repeat"
          :class="zone.found ? 'border-green-500 opacity-50 scale-90 grayscale' : 'border-white hover:scale-110 shadow-lg'"
          :style="{ 
             backgroundImage: `url(${image})`,
             backgroundSize: '500%', // 5x zoom
             backgroundPosition: `${zone.x}% ${zone.y}%` 
          }"
        >
          <!-- Checkmark Overlay -->
          <div v-if="zone.found" class="absolute inset-0 flex items-center justify-center bg-black/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Completion Title -->
    <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center transition-all duration-1000 transform px-6" 
         :class="isCompleted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'">
       <h1 class="text-white font-serif text-5xl md:text-7xl font-bold text-shadow-lg tracking-wider">{{ title }}</h1>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  image: string
  title: string
  initialCompleted?: boolean
}>()

const emit = defineEmits(['complete'])

const isCompleted = ref(false)
const mainImage = ref<HTMLImageElement | null>(null)
const clickFeedback = ref<{x: number, y: number} | null>(null)

interface Zone {
  id: number
  x: number // Percentage Center X
  y: number // Percentage Center Y
  size: number // Percentage Width (relative to container width)
  found: boolean
}

// Fixed zones relative to an image? 
// Since we don't know the image content, we'll pick generic visually interesting spots 
// or random spots if we trust the image is detailed everywhere.
// Better: Generic spots spread out.
const possibleZones: Zone[] = [
  { id: 1, x: 20, y: 30, size: 10, found: false },
  { id: 2, x: 80, y: 30, size: 12, found: false },
  { id: 3, x: 50, y: 50, size: 8, found: false },
  { id: 4, x: 30, y: 70, size: 11, found: false },
  { id: 5, x: 70, y: 70, size: 10, found: false },
]

const activeZones = ref<Zone[]>([])
const foundZones = computed(() => activeZones.value.filter(z => z.found))

const initGame = () => {
  if (props.initialCompleted) return
  // Pick 3 random zones
  activeZones.value = [...possibleZones]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
}

const handleImageClick = (e: MouseEvent) => {
  if (isCompleted.value || !mainImage.value) return
  
  const rect = mainImage.value.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top
  const xPct = (clickX / rect.width) * 100
  const yPct = (clickY / rect.height) * 100
  
  // Show click feedback
  clickFeedback.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  setTimeout(() => clickFeedback.value = null, 300)

  // Check collision
  let hit = false
  activeZones.value.forEach(zone => {
    if (zone.found) return
    
    // Simple distance check (assuming square aspect ratio for math simplicity)
    // Ideally we correct for aspect ratio, but for "Game feel" loose tolerance is fine.
    const dx = Math.abs(zone.x - xPct)
    const dy = Math.abs(zone.y - yPct) * (rect.height / rect.width) // Aspect correct Y
    
    // Hit radiuse roughly 5-8%
    if (Math.hypot(dx, dy) < 8) {
      zone.found = true
      hit = true
    }
  })

  if (hit) {
    checkWin()
  }
}

const checkWin = () => {
  if (activeZones.value.every(z => z.found)) {
    complete()
  }
}

const complete = () => {
  if (isCompleted.value) return
  isCompleted.value = true
  emit('complete')
}

onMounted(() => {
  if (props.initialCompleted) {
    isCompleted.value = true
  } else {
    // If image loads instantly (cached), trigger init
    if (mainImage.value?.complete) initGame()
  }
})
</script>

<style scoped>
.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}
</style>
