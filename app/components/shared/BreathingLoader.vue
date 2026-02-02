<template>
  <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-opacity duration-500">
    
    <!-- Animation Container -->
    <div class="relative flex items-center justify-center w-64 h-64">
      
      <!-- Expanding Circle (Breath) -->
      <div 
        class="absolute rounded-full blur-2xl transition-all duration-[4000ms] ease-in-out"
        :style="{ backgroundColor: '#2C3E5020' }" 
        :class="{ 'w-64 h-64 opacity-100': isInhaling, 'w-16 h-16 opacity-30': !isInhaling }"
      ></div>

      <!-- Core Circle -->
      <div 
        class="absolute rounded-full transition-all duration-[4000ms] ease-in-out border"
        :style="{ backgroundColor: '#2C3E5040', borderColor: '#2C3E5020' }"
        :class="{ 'w-48 h-48': isInhaling, 'w-12 h-12': !isInhaling }"
      ></div>

      <!-- Guidance Text -->
      <p 
        class="relative z-10 font-serif text-xl font-light tracking-widest transition-opacity duration-1000"
        :style="{ color: 'var(--theme-dynamic)' }"
      >
        {{ instruction }}
      </p>

    </div>

    <!-- Progress indication (subtle) -->
    <div class="mt-8 font-light text-sm tracking-wide animate-pulse" :style="{ color: '#2C3E5080' }">
      Laissez le temps au temps...
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 4000 // Total cycle time (Inhale + Exhale approx)
  },
  minCycles: {
    type: Number,
    default: 1
  },
  color: {
    type: String,
    default: '#2C3E50'
  }
})

const emit = defineEmits(['complete'])

const isInhaling = ref(false)
const instruction = ref("Inspirez...")
let intervalId = null
let timeoutId = null

onMounted(() => {
  startBreathing()
})

onUnmounted(() => {
  clearInterval(intervalId)
  clearTimeout(timeoutId)
})

const startBreathing = () => {
  // Start Inhale
  isInhaling.value = true
  instruction.value = "Inspirez..."

  // Switch to Exhale after half duration
  timeoutId = setTimeout(() => {
    isInhaling.value = false
    instruction.value = "Expirez..."
  }, props.duration / 2)

  // Complete after full duration
  setTimeout(() => {
    emit('complete')
  }, props.duration)
}
</script>

<style scoped>
/* Optional: specific ease curve for more natural breathing */
.ease-breath {
  transition-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
}
</style>
