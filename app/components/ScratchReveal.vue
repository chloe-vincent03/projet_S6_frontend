<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden cursor-crosshair touch-none">
    <!-- Ink Layer (Background - B&W if same image) -->
    <img 
      :src="inkLayer" 
      alt="Background" 
      class="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-filter duration-300"
      :class="{ 'grayscale': inkLayer === watercolorLayer }"
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
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  inkLayer: { type: String, required: true },
  watercolorLayer: { type: String, required: true },
  brushSize: { type: Number, default: 50 }
})

const containerRef = ref(null)
const canvasRef = ref(null)
const isLoaded = ref(false)

let ctx = null
let watercolorImg = null
let animationFrameId = null

// Load the watercolor image
const loadImages = () => {
  watercolorImg = new Image()
  watercolorImg.crossOrigin = "Anonymous"
  watercolorImg.src = props.watercolorLayer
  
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
}

// Draw function
const draw = (e) => {
  if (!isLoaded.value || !ctx || !watercolorImg) return

  // Get mouse position relative to canvas
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Perform Drawing
  // Strategy: Clip a circle at mouse pos, then draw the aligned image inside it
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, props.brushSize, 0, Math.PI * 2)
  ctx.clip()
  // Draw the full image stretched to canvas size (same as CSS object-cover essentially)
  // Note: For perfect 'object-cover' matching in canvas, more complex math is needed if aspect ratios differ.
  // Assuming aspect-video container matches image aspect ratio roughly or acceptable stretch.
  ctx.drawImage(watercolorImg, 0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.restore()
  
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
const CHECK_INTERVAL = 500 // Check every 500ms msg

const throttleProgressCheck = () => {
  const now = Date.now()
  if (now - lastCheckTime > CHECK_INTERVAL) {
    checkProgress()
    lastCheckTime = now
  }
}

const checkProgress = () => {
  if (!ctx || !canvasRef.value) return
  
  const width = canvasRef.value.width
  const height = canvasRef.value.height
  
  // Optimization: Read small grid or use random sampling instead of full image data if performance is bad.
  // For modern devices, full HD read is okay-ish every 500ms, but let's be careful.
  // We will sample 1 pixel every 10 to speed it up significantly.
  
  // Actually, getImageData is the slow part. We must grab the 'drawn' area usage.
  // To keep it performant, allow Main Thread to breathe.
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  let coloredPixels = 0
  const totalPixels = data.length / 4 // RGBA = 4 bytes
  
  // Simple check: Alpha > 0 means drawn.
  // Step by 32 (skip lots of pixels) for speed approx
  const step = 32 
  let sampledPixels = 0
  
  for (let i = 3; i < data.length; i += 4 * step) {
     sampledPixels++
     if (data[i] > 0) {
        coloredPixels++
     }
  }
  
  const progress = Math.round((coloredPixels / sampledPixels) * 100)
  
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
