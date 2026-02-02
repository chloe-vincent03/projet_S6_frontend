<template>
  <div class="relative w-full h-full flex flex-col items-center justify-center bg-black/90 p-4 overflow-hidden">
    
    <!-- Puzzle Container -->
    <div 
      class="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      
      <!-- Base Image (Ghost/Guide - Faint) -->
      <img :src="image" class="absolute inset-0 w-full h-full object-cover rounded-full opacity-20 pointer-events-none blur-sm" />

      <!-- Rings -->
      <div 
        v-for="(ring, index) in rings" 
        :key="index"
        class="absolute inset-0 w-full h-full rounded-full cursor-grab active:cursor-grabbing transition-transform duration-300 ease-out will-change-transform shadow-2xl"
        :class="{ 'duration-1000 ease-in-out': isCompleted }"
        :style="{
          transform: `rotate(${ring.currentAngle}deg)`,
          maskImage: ring.mask,
          WebkitMaskImage: ring.mask,
          zIndex: 10 + index
        }"
      >
        <img :src="image" class="w-full h-full object-cover pointer-events-none select-none" />
      </div>

    </div>

    <!-- UI Overlay -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
       <!-- Instruction Text -->
      <div class="mb-8 text-center transition-opacity duration-500 bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl mx-4" :class="{ 'opacity-0': isCompleted }">
        <h2 class="text-white font-serif text-2xl md:text-3xl mb-2 text-shadow-lg drop-shadow-md" style="color: white !important;">
           Alignez le souvenir...
        </h2>
        <p class="text-white/80 text-sm max-w-md mx-auto drop-shadow font-medium">
           Faites tourner les cercles pour que l'image soit parfaitement alignée, droite au centre.
        </p>
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
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  image: string
  title: string
  initialCompleted?: boolean
}>()

const emit = defineEmits(['complete'])

interface Ring {
  id: number
  currentAngle: number
  targetAngle: number // Always 0 (or multiple of 360) for solution
  mask: string
}

const rings = ref<Ring[]>([
  // Inner Ring (0% - 35%)
  { 
    id: 0, 
    currentAngle: Math.floor(Math.random() * 360), 
    targetAngle: 0,
    mask: 'radial-gradient(circle closest-side, black 35%, transparent 35.5%)' 
  },
  // Middle Ring (35% - 65%)
  { 
    id: 1, 
    currentAngle: Math.floor(Math.random() * 360), 
    targetAngle: 0,
    mask: 'radial-gradient(circle closest-side, transparent 35%, black 35.5%, black 65%, transparent 65.5%)' 
  },
  // Outer Ring (65% - 100%)
  { 
    id: 2, 
    currentAngle: Math.floor(Math.random() * 360), 
    targetAngle: 0,
    mask: 'radial-gradient(circle closest-side, transparent 65%, black 65.5%)' 
  }
])

const isCompleted = ref(false)
let activeRingIndex: number | null = null
let startAngle = 0
let startMouseAngle = 0
let centerX = 0
let centerY = 0

const getAngle = (clientX: number, clientY: number) => {
  return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
}

const getDistanceFromCenter = (x: number, y: number) => {
  return Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
}

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (isCompleted.value) return
  
  e.preventDefault()
  
  const target = e.currentTarget as HTMLElement // Container
  const rect = target.getBoundingClientRect()
  centerX = rect.left + rect.width / 2
  centerY = rect.top + rect.height / 2
  const maxRadius = rect.width / 2
  
  // Safe touch access
  let clientX = 0
  let clientY = 0
  if ('touches' in e && e.touches.length > 0) {
     clientX = e.touches[0]!.clientX
     clientY = e.touches[0]!.clientY
  } else if ('clientX' in e) {
     clientX = (e as MouseEvent).clientX
     clientY = (e as MouseEvent).clientY
  }
  
  // Hit Testing logic
  const dist = getDistanceFromCenter(clientX, clientY)
  const radiusPct = dist / maxRadius
  
  if (radiusPct <= 0.35) {
    activeRingIndex = 0 // Inner
  } else if (radiusPct <= 0.65) {
    activeRingIndex = 1 // Middle
  } else if (radiusPct <= 1.0) {
    activeRingIndex = 2 // Outer
  } else {
    return // Clicked outside
  }

  startMouseAngle = getAngle(clientX, clientY)
  if (activeRingIndex !== null) {
    const ring = rings.value[activeRingIndex]
    if (ring) {
      startAngle = ring.currentAngle
    }
  }
  
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (activeRingIndex === null) return
  
  let clientX = 0
  let clientY = 0
   if ('touches' in e && e.touches.length > 0) {
     clientX = e.touches[0]!.clientX
     clientY = e.touches[0]!.clientY
  } else if ('clientX' in e) {
     clientX = (e as MouseEvent).clientX
     clientY = (e as MouseEvent).clientY
  }
  
  const currentMouseAngle = getAngle(clientX, clientY)
  const delta = currentMouseAngle - startMouseAngle
  
  const ring = rings.value[activeRingIndex]
  if (ring) {
     ring.currentAngle = startAngle + delta
  }
}

const stopDrag = () => {
  if (activeRingIndex === null) return
  
  const ring = rings.value[activeRingIndex]
  if (ring) {
    let normalized = ring.currentAngle % 360
    if (normalized < 0) normalized += 360
    
    // If close to 0 (or 360), snap to 0
    if (normalized < 10 || normalized > 350) { // Slightly tighter snap
       ring.currentAngle = 0 
    }
  }
  
  checkCompletion()
  
  activeRingIndex = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

const checkCompletion = () => {
  // Check if all rings are at 0 (or very close if we didn't snap perfectly, but we snap)
  const allAligned = rings.value.every(r => r.currentAngle === 0)
  
  if (allAligned) {
    isCompleted.value = true
    emit('complete')
  }
}

onMounted(() => {
  if (props.initialCompleted) {
    isCompleted.value = true
    rings.value.forEach(r => r.currentAngle = 0)
    emit('complete')
  }
})

</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
</style>
