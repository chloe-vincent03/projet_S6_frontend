<template>
  <Transition name="fade-slow">
    <div 
      v-if="isActive" 
      class="fixed inset-0 z-[9000] pointer-events-none overflow-hidden"
    >
      <!-- Guardians (Lucioles) -->
      <div 
        v-for="i in particleCount" 
        :key="i"
        class="absolute rounded-full bg-[#3B82F6] blur-[2px] animate-float"
        :style="getStyle(i)"
      ></div>

      <!-- Optional: Subtle Vignette to darken edges -->
      <div class="absolute inset-0 bg-radial-gradient opacity-20"></div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isActive = ref(false)
let timer = null
const TIMEOUT = 5000 // 5 seconds of silence
const particleCount = 20

// Random properties for each firefly
const getStyle = (i) => {
  const top = Math.random() * 100 + '%'
  const left = Math.random() * 100 + '%'
  const size = Math.random() * 6 + 4 + 'px' // 4-10px (Plus voyant)
  const duration = Math.random() * 10 + 10 + 's' // 10-20s float duration
  const delay = Math.random() * -20 + 's'
  const opacity = Math.random() * 0.4 + 0.6 // 0.6 - 1.0 (Plus brillant)

  return {
    top,
    left,
    width: size,
    height: size,
    opacity,
    animationDuration: duration,
    animationDelay: delay,
    boxShadow: `0 0 ${Math.random() * 15 + 10}px #3B82F6` // Plus de glow
  }
}

const resetTimer = () => {
  if (isActive.value) {
    isActive.value = false
  }
  clearTimeout(timer)
  timer = setTimeout(() => {
    isActive.value = true
  }, TIMEOUT)
}

onMounted(() => {
  // Listen for activity
  window.addEventListener('mousemove', resetTimer)
  window.addEventListener('mousedown', resetTimer)
  window.addEventListener('keypress', resetTimer)
  window.addEventListener('wheel', resetTimer)
  window.addEventListener('touchmove', resetTimer)

  resetTimer()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', resetTimer)
  window.removeEventListener('mousedown', resetTimer)
  window.removeEventListener('keypress', resetTimer)
  window.removeEventListener('wheel', resetTimer)
  window.removeEventListener('touchmove', resetTimer)
  clearTimeout(timer)
})
</script>

<style scoped>
.fade-slow-enter-active,
.fade-slow-leave-active {
  transition: opacity 2s ease-in-out;
}

.fade-slow-enter-from,
.fade-slow-leave-to {
  opacity: 0;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(10px, -15px);
  }
  50% {
    transform: translate(-5px, -25px);
  }
  75% {
    transform: translate(-15px, -10px);
  }
}

.animate-float {
  animation-name: float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.bg-radial-gradient {
  background: radial-gradient(circle, transparent 60%, rgba(0,0,0,0.4) 100%);
}
</style>
