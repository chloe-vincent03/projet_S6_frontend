<template>
  <div class="relative w-full h-full touch-none select-none overflow-hidden">
    <!-- Background Image (Always visible underneath) -->
    <img 
      :src="optimizedImage" 
      class="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />

    <!-- Canvas Layer for Fog -->
    <canvas 
      ref="canvas"
      class="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
      @mousemove="handleMove"
      @touchmove="handleTouch"
    ></canvas>

    <!-- UI Overlay -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
       <!-- Instruction Text -->
      <div class="mb-8 text-center transition-opacity duration-500 bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl mx-4" :class="{ 'opacity-0': isCompleted }">
        <h2 class="text-white font-serif text-2xl md:text-3xl mb-2 drop-shadow-md text-shadow-lg" style="color: white !important;">
           Buée sur la vitre...
        </h2>
        <p class="text-white/80 text-sm max-w-md mx-auto font-medium drop-shadow">
           Essuyez l'écran pour voir à travers.
        </p>
        <p class="text-white/60 text-xs mt-2">{{ Math.round(progress) }}% nettoyé</p>
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
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'

const props = defineProps<{
  image: string
  title: string
  initialCompleted?: boolean
}>()

const { optimizeImage } = useImageOptimization()
const optimizedImage = computed(() => optimizeImage(props.image, 1080))

const emit = defineEmits(['complete'])

const canvas = ref<HTMLCanvasElement | null>(null)
const isCompleted = ref(false)
const progress = ref(0)
let ctx: CanvasRenderingContext2D | null = null

// Optimization: Offscreen small canvas for progress tracking
let offCanvas: HTMLCanvasElement | null = null
let offCtx: CanvasRenderingContext2D | null = null
const PROCESS_RES = 64 // Calculate progress on a 64x64 grid

// Fog Configuration
const FOG_COLOR = 'rgba(230, 235, 240, 0.95)' // Milky white/blueish fog
const FOG_COLOR_SOLID = '#E6EBF0' // Solid color for offscreen
const BRUSH_SIZE = 120
const BLUR_AMOUNT = 20

// Resize Observer
let resizeObserver: ResizeObserver | null = null

const initCanvas = () => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  // Init Offscreen
  offCanvas = document.createElement('canvas')
  offCanvas.width = PROCESS_RES
  offCanvas.height = PROCESS_RES
  offCtx = offCanvas.getContext('2d', { willReadFrequently: true })

  const resize = () => {
    if (!canvas.value || !ctx || !offCtx || !offCanvas) return
    const rect = canvas.value.getBoundingClientRect()
    canvas.value.width = rect.width
    canvas.value.height = rect.height
    
    // Fill Main Canvas with Fog
    ctx.fillStyle = FOG_COLOR
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
    ctx.globalCompositeOperation = 'source-over'

    // Fill Offscreen Canvas with solid color
    offCtx.fillStyle = FOG_COLOR_SOLID
    offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height)
    offCtx.globalCompositeOperation = 'source-over'
  }

  resizeObserver = new ResizeObserver(() => {
    if (canvas.value && canvas.value.width === 0) resize()
  })
  resizeObserver.observe(canvas.value)
  
  // Initial fill
  resize()
}

const wipe = (x: number, y: number) => {
  if (!canvas.value || !ctx || !offCtx || isCompleted.value) return

  // 1. Draw Visuals on Main Canvas
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(x, y, BRUSH_SIZE, 0, Math.PI * 2)
  ctx.fill()
  
  // 2. Draw Logic on Offscreen Canvas (Scaled)
  // Calculate relative position (0.0 to 1.0)
  const relX = x / canvas.value.width
  const relY = y / canvas.value.height
  
  // Apply to small canvas
  const offX = relX * PROCESS_RES
  const offY = relY * PROCESS_RES
  const offBrush = (BRUSH_SIZE / canvas.value.width) * PROCESS_RES

  offCtx.globalCompositeOperation = 'destination-out'
  offCtx.beginPath()
  offCtx.arc(offX, offY, offBrush, 0, Math.PI * 2)
  offCtx.fill()
  
  checkProgress()
}

let throttleCounter = 0
const checkProgress = () => {
  throttleCounter++
  if (throttleCounter % 5 !== 0) return // Check every 5 wipes (more responsive now that it's fast)

  if (!offCtx || !offCanvas) return
  
  try {
      // Read mostly-free operation now (64x64 pixels = 4KB data)
      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height)
      const data = imgData.data
      let clearPixels = 0
      let totalPixels = data.length / 4

      // We can scan every pixel of this tiny image instantly
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 128) { // Alpha check
          clearPixels++
        }
      }
      
      const percent = (clearPixels / totalPixels) * 100
      progress.value = percent
      
      if (percent > 40) { // 40% clear = success
        complete()
      }
  } catch (e) {
    console.warn('Unable to read canvas data', e)
  }
}

const complete = () => {
  if (isCompleted.value) return
  isCompleted.value = true
  progress.value = 100
  
  // Fade out remaining fog
  if (canvas.value) {
    canvas.value.style.transition = 'opacity 1s ease-out'
    canvas.value.style.opacity = '0'
  }
  
  emit('complete')
}

const handleMove = (e: MouseEvent) => {
  wipe(e.offsetX, e.offsetY)
}

const handleTouch = (e: TouchEvent) => {
  e.preventDefault() 
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const touch = e.touches ? e.touches[0] : null
  if (touch) {
    wipe(touch.clientX - rect.left, touch.clientY - rect.top)
  }
}

onMounted(() => {
  if (props.initialCompleted) {
    isCompleted.value = true
    progress.value = 100
    emit('complete')
  } else {
    initCanvas()
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
</style>
