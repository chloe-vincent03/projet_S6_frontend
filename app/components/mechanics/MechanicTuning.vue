<template>
  <div class="relative w-full h-full bg-[#1a1a1a] overflow-hidden select-none flex flex-col items-center justify-center">
    
    <!-- Background Image with dynamic noise/blur -->
    <div class="absolute inset-0 z-0">
      <img 
        :src="image" 
        class="w-full h-full object-cover transition-all duration-300"
        :style="imageStyle"
      />
      <!-- Noise Overlay -->
      <div class="absolute inset-0 opacity-50 pointer-events-none mix-blend-overlay" 
           :style="{ opacity: noiseOpacity, backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)' }"></div>
    </div>

    <!-- UI Layer -->
    <div class="relative z-20 w-full max-w-md p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transition-all duration-500"
         :class="{ 'opacity-0 pointer-events-none': isCompleted }">
      
      <h2 class="text-white font-serif text-2xl mb-6 text-center text-shadow">Réglage de la fréquence...</h2>
      
      <!-- Oscilloscope / Wave Visualizer -->
      <div class="relative w-full h-32 bg-black/80 rounded-lg mb-8 overflow-hidden border border-green-500/30 shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        <!-- Target Wave (Ghost) -->
        <svg class="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 50 Q 25 10, 50 50 T 100 50" fill="none" stroke="#22c55e" stroke-width="2" vector-effect="non-scaling-stroke" />
        </svg>
        
        <!-- User Wave (Dynamic) -->
        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <!-- Dynamic Path based on tuning value -->
           <path :d="userWavePath" fill="none" :stroke="isSignalStrong ? '#22c55e' : '#ef4444'" stroke-width="3" vector-effect="non-scaling-stroke" class="transition-all duration-100" />
        </svg>

        <!-- Signal Strength Text -->
        <div class="absolute top-2 right-2 text-xs font-mono" :class="isSignalStrong ? 'text-green-400' : 'text-red-500'">
          SIGNAL: {{ signalStrength }}%
        </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-col gap-6">
        <!-- Frequency Dial / Slider -->
        <div>
          <label class="block text-white/50 text-xs uppercase tracking-widest mb-2">Fréquence (MHz)</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.1"
            v-model.number="currentValue"
            class="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>

        <!-- Confirm Button (Only active when signal > 95%) -->
        <button 
          @click="checkUnlock"
          class="w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg"
          :class="isSignalStrong ? 'bg-green-500 text-white hover:bg-green-400 hover:scale-[1.02] cursor-pointer' : 'bg-stone-800 text-white/20 cursor-not-allowed'"
          :disabled="!isSignalStrong"
        >
          {{ isSignalStrong ? 'Capter le signal' : 'Recherche...' }}
        </button>
      </div>

    </div>

    <!-- Completion Title -->
    <div class="absolute bottom-20 z-20 text-center transition-all duration-1000 transform px-6 w-full" 
         :class="isCompleted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'">
       <h1 class="text-white font-serif text-5xl md:text-7xl font-bold text-shadow-lg tracking-wider">{{ title }}</h1>
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

const emit = defineEmits(['complete'])

const isCompleted = ref(false)
const currentValue = ref(50) // User input 0-100
const targetValue = ref(0) // Random target

// Configuration
const TOLERANCE = 5 // +/- 5 units

onMounted(() => {
  if (props.initialCompleted) {
    isCompleted.value = true
    currentValue.value = targetValue.value 
  } else {
    // Generate random target between 10 and 90
    targetValue.value = 10 + Math.random() * 80
  }
})

// Calculations
const distance = computed(() => Math.abs(currentValue.value - targetValue.value))
const maxDist = 100

const signalStrength = computed(() => {
  if (distance.value > 20) return 0
  if (distance.value < 0.5) return 100
  // Linear interpolation for the "sweet spot" range
  return Math.round((1 - (distance.value / 20)) * 100)
})

const isSignalStrong = computed(() => signalStrength.value > 90)

const noiseOpacity = computed(() => {
  if (isCompleted.value) return 0
  // More noise when far from target
  return Math.min(0.8, distance.value / 30)
})

const imageStyle = computed(() => {
  if (isCompleted.value) return { filter: 'none', opacity: 1 }
  
  const blur = Math.min(20, distance.value / 2)
  const grayscale = Math.min(100, distance.value * 2)
  
  return {
    filter: `blur(${blur}px) grayscale(${grayscale}%)`,
    opacity: 0.3 + (0.7 * (signalStrength.value / 100))
  }
})

// Generate SVG Path for the sine wave
const userWavePath = computed(() => {
  // We want the wave to look "out of phase" or have different frequency when far
  // When close, it matches the Target Wave: M0 50 Q 25 10, 50 50 T 100 50
  
  // Target Freq factor = 1
  // User Freq factor varies from 0.5 to 2.0 based on slider
  // But actually, visually matching "Shift" (Translate) might be easier/better UX?
  // Let's do Shift/Phase shift.
  
  // Base Phase is set by targetValue. 
  // User slider adjusts phase.
  // Perfect match = same phase.
  
  // Actually, let's just distort the amplitude/freq based on error
  // If perfect: Standard Sine
  // If far: Flat line or chaotic? 
  
  // Let's simulate Phase Shift
  const diff = currentValue.value - targetValue.value
  const phaseShift = diff * 2 // Horizontal shift
  
  // Construct path points
  // Simple Quad Curve approx for sine: M0,50 Q25,(50-Amp) 50,50 T100,50
  const amp = 40 // Amplitude
  const p1y = 50 - amp
  const p1x = 25 + phaseShift
  const p2x = 50 + phaseShift
  const p3x = 100 + phaseShift
  
  // This is a bit hacky for SVG path but creates "movement"
  // A better way for a pure frequency tuner is changing the width/period
  
  // Let's try Period variations
  // Target period = 100 width
  // User period = 50 to 150
  
  // We want the visual to "Look like the target" (M0 50 Q 25 10, 50 50 T 100 50) when correct.
  // Target: One full cycle (0 to 100). Peak at 25, Cross at 50, Trough at 75?
  // The SVG path provided M0 50 Q 25 10, 50 50 T 100 50 assumes control point at 25,10 -> Peak is around there.
  
  const distortion = diff // -50 to +50
  
  // Simply shift the Q control point X
  const cp1x = 25 + (distortion * 2) 
  
  return `M0 50 Q ${cp1x} 10, 50 50 T 100 50`
})

const checkUnlock = () => {
  if (isSignalStrong.value) {
    // Snap to perfect
    currentValue.value = targetValue.value
    isCompleted.value = true
    emit('complete')
  }
}

</script>

<style scoped>
.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
</style>
