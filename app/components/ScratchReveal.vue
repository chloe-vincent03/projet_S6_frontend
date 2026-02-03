<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden cursor-crosshair touch-none">
    <!-- Ink Layer (Background - B&W if same image) -->
    <img 
      :src="optimInk" 
      alt="Background" 
      class="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-filter duration-300"
      :class="{ 'grayscale': optimInk === optimWatercolor }"
    />

    <!-- Canvas Layer (Drawing Surface) -->
    <canvas 
      ref="canvasRef"
      class="absolute inset-0 w-full h-full z-10"
      @mousemove="draw"
      @touchmove="handleTouch"
    ></canvas>
    
    <!-- Loading State -->
    <div v-if="!isLoaded" class="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-20">
      <span class="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">Chargement...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  inkLayer: { type: String, required: true },
  watercolorLayer: { type: String, required: true },
  brushSize: { type: Number, default: 50 }
})

// Auto-optimize images
const { optimizeImage } = useImageOptimization()
const optimInk = computed(() => optimizeImage(props.inkLayer, 1080))
const optimWatercolor = computed(() => optimizeImage(props.watercolorLayer, 1080))

const containerRef = ref(null)
const canvasRef = ref(null)
const isLoaded = ref(false)

let ctx = null
let watercolorImg = null
let animationFrameId = null

// Optimization: Offscreen Canvas
let offCanvas = null
let offCtx = null
const PROCESS_RES = 64

// Load the watercolor image
const loadImages = () => {
  watercolorImg = new Image()
  watercolorImg.crossOrigin = "Anonymous"
  watercolorImg.src = optimWatercolor.value
  
  watercolorImg.onload = () => {
    isLoaded.value = true
    initCanvas()
  }
}

// Initialize Canvas size
const initCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return
  
  const canvas = canvasRef.value
  const container = containerRef.value
  
  // Set internal resolution to match display size for sharpness
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  
  ctx = canvas.getContext('2d', { willReadFrequently: true }) // Optimization
  
  // Init offscreen
  offCanvas = document.createElement('canvas')
  offCanvas.width = PROCESS_RES
  offCanvas.height = PROCESS_RES
  offCtx = offCanvas.getContext('2d', { willReadFrequently: true })
}

// Draw function
const draw = (e) => {
  if (!isLoaded.value || !ctx || !watercolorImg || !offCtx) return

  // Get mouse position relative to canvas
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Perform Drawing on Main Canvas (Visuals)
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, props.brushSize, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(watercolorImg, 0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.restore()
  
  // Perform Drawing on Offscreen Canvas (Logic)
  const relX = x / canvasRef.value.width
  const relY = y / canvasRef.value.height
  const offX = relX * PROCESS_RES
  const offY = relY * PROCESS_RES
  // Calculate relative brush size
  const offBrush = (props.brushSize / canvasRef.value.width) * PROCESS_RES

  offCtx.fillStyle = '#000000' // Draw solid color
  offCtx.beginPath()
  offCtx.arc(offX, offY, offBrush, 0, Math.PI * 2)
  offCtx.fill() // We fill (add ink) to represent "scratched area"

  throttleProgressCheck()
}

// Handle Touch
const handleTouch = (e) => {
  e.preventDefault() // Prevent scrolling while coloring
  const touch = e.touches[0]
  // Create a mock mouse event structure
  draw({
    clientX: touch.clientX,
    clientY: touch.clientY
  })
}

// Progress Detection
const emit = defineEmits(['progress', 'complete'])
let lastCheckTime = 0
const CHECK_INTERVAL = 200 // Faster check interval now that it's cheap

const throttleProgressCheck = () => {
  const now = Date.now()
  if (now - lastCheckTime > CHECK_INTERVAL) {
    checkProgress()
    lastCheckTime = now
  }
}

const checkProgress = () => {
  if (!offCtx || !offCanvas) return
  
  // Read small canvas
  const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height)
  const data = imageData.data
  let coloredPixels = 0
  const totalPixels = data.length / 4 
  
  for (let i = 3; i < data.length; i += 4) {
     if (data[i] > 0) {
        coloredPixels++
     }
  }
  
  const progress = Math.round((coloredPixels / totalPixels) * 100)
  
  emit('progress', progress)
  
  if (progress > 85) {
    emit('complete', true)
  }
}

// Resize Observer to handle window resizing
let resizeObserver
onMounted(() => {
  loadImages()
  
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Optional: Clear canvas or redraw revealed areas on resize? 
      // For simplicity, we just reset resolution. User might lose progress, 
      // but 'Responsive Canvas' with persistent state is complex.
      // We will just re-init canvas which clears it.
      initCanvas() 
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})
</script>
