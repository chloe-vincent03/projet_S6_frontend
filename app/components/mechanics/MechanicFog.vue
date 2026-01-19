<template>
  <div class="relative w-full h-full touch-none select-none overflow-hidden">
    <!-- Background Image (Always visible underneath) -->
    <img 
      :src="image" 
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
      <div class="mb-8 text-center transition-opacity duration-500 px-6" :class="{ 'opacity-0': isCompleted }">
        <h2 class="text-[#2C3E50] font-serif text-2xl md:text-3xl mb-2 drop-shadow-md">
           Buée sur la vitre...
        </h2>
        <p class="text-[#2C3E50]/80 text-sm max-w-md mx-auto font-medium">
           Essuyez l'écran pour voir à travers.
        </p>
        <p class="text-[#2C3E50]/60 text-xs mt-2">{{ Math.round(progress) }}% nettoyé</p>
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
}>()

const emit = defineEmits(['complete'])

const canvas = ref<HTMLCanvasElement | null>(null)
const isCompleted = ref(false)
const progress = ref(0)
let ctx: CanvasRenderingContext2D | null = null

// Fog Configuration
const FOG_COLOR = 'rgba(230, 235, 240, 0.95)' // Milky white/blueish fog
const BRUSH_SIZE = 60
const BLUR_AMOUNT = 20

// Resize Observer
let resizeObserver: ResizeObserver | null = null

const initCanvas = () => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  const resize = () => {
    if (!canvas.value || !ctx) return
    const rect = canvas.value.getBoundingClientRect()
    canvas.value.width = rect.width
    canvas.value.height = rect.height
    
    // Fill with Fog
    ctx.fillStyle = FOG_COLOR
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
    
    // Reset composite operation to default for filling
    ctx.globalCompositeOperation = 'source-over'
  }

  resizeObserver = new ResizeObserver(() => {
    // We only resize if it's the first time or huge change, 
    // real-time resize might clear progress which is annoying but acceptable for MVP
    // For now, simple init
    if (canvas.value && canvas.value.width === 0) resize()
  })
  resizeObserver.observe(canvas.value)
  
  // Initial fill
  resize()
}

const wipe = (x: number, y: number) => {
  if (!canvas.value || !ctx || isCompleted.value) return

  // We use destination-out to erase the fog
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(x, y, BRUSH_SIZE, 0, Math.PI * 2)
  ctx.fill()
  
  // Add some "dripping" or soft edges? 
  // For now simple circle is fast. Use CSS blur on canvas to soften edges visually?
  // Or shadowBlur in context
  
  checkProgress()
}

// Optimization: Check progress only every X frames or on mouseup? 
// Checking every pixel every move is expensive.
// We can approximate by counting wipe events or just sampling a small grid.
let throttleCounter = 0
const checkProgress = () => {
  throttleCounter++
  if (throttleCounter % 10 !== 0) return // Check every 10 wipes

  if (!canvas.value || !ctx) return
  
  // Create a small offscreen canvas to measure coverage
  // or sample pixel data from the main canvas (can be slow on large screens)
  
  const w = canvas.value.width
  const h = canvas.value.height
  
  // Sample a grid of 20x20 points
  const itemsX = 20
  const itemsY = 20
  let transparentCount = 0
  
  // Performance optimization: getImageData is slow.
  // Instead of full image, we could track "total wiped area" roughly.
  // But let's try sampling.
  
  try {
      // Get the alpha channel of every 10th pixel maybe?
      // Actually, reading 1x1 pixels is very slow due to multiple readbacks.
      // Better to read entire small simplified image? 
      // Let's just assume simple "Strokes count" for smoother UI? 
      // No, user wants percentage.
      
      const imgData = ctx.getImageData(0, 0, w, h)
      const data = imgData.data
      const totalPixels = data.length / 4
      const step = 100 // Check every 100th pixel
      let clearPixels = 0
      let checkedPixels = 0

      for (let i = 3; i < data.length; i += 4 * step) {
        checkedPixels++
        if (data[i] < 128) { // Alpha less than 50%
          clearPixels++
        }
      }
      
      const percent = (clearPixels / checkedPixels) * 100
      progress.value = percent
      
      if (percent > 60) { // 60% clear = success
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
  e.preventDefault() // Stop scroll
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const touch = e.touches ? e.touches[0] : null
  if (touch) {
    wipe(touch.clientX - rect.left, touch.clientY - rect.top)
  }
}

onMounted(() => {
  initCanvas()
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
