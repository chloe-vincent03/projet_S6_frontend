<template>
  <div 
    class="relative w-full h-full cursor-none overflow-hidden touch-none"
    @mousemove="handleMove"
    @touchmove="handleTouch"
    ref="container"
  >
    <!-- Background: The Image (Fully Visible but hidden by overlay) -->
    <img 
      :src="optimizedImage" 
      class="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-1000"
      :class="{ 'brightness-100': isCompleted, 'brightness-50': !isCompleted }"
    />

    <!-- The Darkness Overlay -->
    <!-- We use a mask to cut a hole in this black div -->
    <div 
      class="absolute inset-0 bg-black z-10 transition-opacity duration-1000 pointer-events-none"
      :class="{ 'opacity-0': isCompleted, 'opacity-100': !isCompleted }"
      :style="{
        'mask-image': `radial-gradient(circle 200px at ${x}px ${y}px, transparent 10%, black 100%)`,
        '-webkit-mask-image': `radial-gradient(circle 200px at ${x}px ${y}px, transparent 10%, black 100%)`
      }"
    ></div>

    <!-- UI Overlay -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
       <!-- Instruction Text -->
      <div class="mb-8 text-center transition-opacity duration-500 bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl mx-4" :class="{ 'opacity-0': isCompleted }">
        <h2 class="text-white font-serif text-2xl md:text-3xl mb-2 text-shadow-lg drop-shadow-md" style="color: white !important;">
           Explorez l'obscurité...
        </h2>
        <p class="text-white/80 text-sm max-w-md mx-auto drop-shadow font-medium">
           Utilisez votre lumière pour révéler les secrets de ce lieu.
        </p>
        <p class="text-white/50 text-xs mt-2">{{ Math.round(progress) }}% exploré</p>
      </div>

       <!-- Completion Title -->
      <div class="mb-20 text-center transition-all duration-1000 transform px-6 absolute top-1/2 -translate-y-1/2" 
           :class="isCompleted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'">
         <h1 class="text-white font-serif text-5xl md:text-7xl font-bold text-shadow-lg tracking-wider">{{ title }}</h1>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  image: string
  title: string
  initialCompleted?: boolean
}>()

const { optimizeImage } = useImageOptimization()
const optimizedImage = computed(() => optimizeImage(props.image, 1080))

const emit = defineEmits(['complete'])

const container = ref<HTMLElement | null>(null)
const x = ref(-500) // Start off-screen
const y = ref(-500)
const isCompleted = ref(false)

// Exploration Tracking
const visitedCells = new Set<string>()
const visitedCount = ref(0) // Reactive tracker
const TOTAL_CELLS_X = 10
const TOTAL_CELLS_Y = 10
const REQUIRED_COVERAGE = 0.6 // 60% needs to be visited

const progress = computed(() => {
  return Math.min(100, (visitedCount.value / (TOTAL_CELLS_X * TOTAL_CELLS_Y * REQUIRED_COVERAGE)) * 100)
})

const handleMove = (e: MouseEvent) => {
  if (isCompleted.value) return
  trackPosition(e.clientX, e.clientY)
}

const handleTouch = (e: TouchEvent) => {
  if (isCompleted.value) return
  const touch = e.touches[0]
  if (touch) {
    trackPosition(touch.clientX, touch.clientY)
  }
}

const trackPosition = (clientX: number, clientY: number) => {
  if (!container.value) return

  // Update light position
  const rect = container.value.getBoundingClientRect()
  x.value = clientX - rect.left
  y.value = clientY - rect.top

  // Track Grid Cell
  // We use relative position (0-1) to be responsive
  const relX = Math.max(0, Math.min(1, x.value / rect.width))
  const relY = Math.max(0, Math.min(1, y.value / rect.height))
  
  const cellX = Math.floor(relX * TOTAL_CELLS_X)
  const cellY = Math.floor(relY * TOTAL_CELLS_Y)
  
  const key = `${cellX}-${cellY}`
  if (!visitedCells.has(key)) {
     visitedCells.add(key)
     visitedCount.value = visitedCells.size
     checkCompletion()
  }
}

const checkCompletion = () => {
  if (progress.value >= 100 && !isCompleted.value) {
    isCompleted.value = true
    emit('complete')
  }
}

onMounted(() => {
  if (props.initialCompleted) {
    // If already completed, set state to full visited
    visitedCount.value = TOTAL_CELLS_X * TOTAL_CELLS_Y
    isCompleted.value = true
    emit('complete')
  }
})
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
</style>
