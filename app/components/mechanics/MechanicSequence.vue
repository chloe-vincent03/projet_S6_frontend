<template>
  <div class="relative w-full h-full bg-black overflow-hidden select-none">
    <!-- Background Image -->
    <img 
      :src="image" 
      class="absolute inset-0 w-full h-full object-cover opacity-40"
      :class="{ 'opacity-100 transition-opacity duration-1000': isCompleted }"
    />

    <!-- Spotlights Container -->
    <div v-if="!isCompleted" class="absolute inset-0 z-10 flex items-center justify-center">
      <div class="relative w-full max-w-lg aspect-square">
        
        <!-- Lights -->
        <!-- Positioned in a cross or diamond pattern -->
        <div 
          v-for="(light, index) in lights"
          :key="index"
          class="absolute w-24 h-24 rounded-full border-4 border-white/50 cursor-pointer transition-all duration-200 flex items-center justify-center"
          :class="[
            light.positionClass,
            activeLight === index ? 'bg-yellow-100 shadow-[0_0_50px_20px_rgba(255,255,200,0.8)] scale-110 border-white' : 'bg-black/50 hover:bg-white/10'
          ]"
          @click="handleInput(index)"
        >
          <div class="w-full h-full bg-white/20 rounded-full blur-md" v-if="activeLight === index"></div>
        </div>

      </div>
    </div>

    <!-- UI Interaction Layer -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
      
       <!-- Status Message -->
       <div class="mb-12 text-center transition-opacity duration-300 pointer-events-auto" v-if="!isCompleted">
         <h2 class="text-white font-serif text-2xl mb-2 text-shadow-lg">
           {{ statusMessage }}
         </h2>
         <div class="flex gap-2 justify-center mt-4">
            <!-- Progress Dots -->
            <div 
              v-for="i in totalRounds" 
              :key="i"
              class="w-3 h-3 rounded-full transition-colors"
              :class="currentRound >= i ? 'bg-yellow-400 shadow-glow' : 'bg-stone-600'"
            ></div>
         </div>
         <button v-if="gameState === 'FAIL' || gameState === 'IDLE'" 
                 @click="startGame"
                 class="mt-6 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-yellow-400 transition-colors pointer-events-auto">
           {{ gameState === 'FAIL' ? 'Réessayer' : 'Commencer' }}
         </button>
       </div>

       <!-- Completion Title -->
       <div class="mb-20 text-center transition-all duration-1000 transform px-6 absolute top-1/2 -translate-y-1/2 w-full" 
            :class="isCompleted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'">
          <h1 class="text-white font-serif text-5xl md:text-7xl font-bold text-shadow-lg tracking-wider">{{ title }}</h1>
       </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  image: string
  title: string
  initialCompleted?: boolean
}>()

const emit = defineEmits(['complete'])

const isCompleted = ref(false)
const activeLight = ref<number | null>(null)
const lights = [
  { positionClass: 'top-10 left-1/2 -translate-x-1/2' }, // Top
  { positionClass: 'bottom-10 left-1/2 -translate-x-1/2' }, // Bottom
  { positionClass: 'left-10 top-1/2 -translate-y-1/2' }, // Left
  { positionClass: 'right-10 top-1/2 -translate-y-1/2' } // Right
]

// Game State
type GameState = 'IDLE' | 'PLAYING_SEQUENCE' | 'WAITING_INPUT' | 'SUCCESS' | 'FAIL'
const gameState = ref<GameState>('IDLE')
const statusMessage = ref('Mémorisez la séquence...')

const sequence = ref<number[]>([])
const playerInput = ref<number[]>([])
const currentRound = ref(0)
const totalRounds = 3

const startGame = () => {
  currentRound.value = 0
  startRound()
}

const startRound = async () => {
  gameState.value = 'PLAYING_SEQUENCE'
  statusMessage.value = 'Observez...'
  playerInput.value = []
  
  // Generate sequence based on round (Round 1 = 3 steps, Round 2 = 4 steps, etc.)
  const length = 3 + currentRound.value
  sequence.value = Array.from({ length }, () => Math.floor(Math.random() * 4))
  
  await playSequence()
  
  gameState.value = 'WAITING_INPUT'
  statusMessage.value = 'À vous !'
}

const playSequence = async () => {
  for (let i = 0; i < sequence.value.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 500)) // Pause between
    const lightIndex = sequence.value[i]
    if (lightIndex !== undefined) {
      activateLight(lightIndex)
    }
    await new Promise(resolve => setTimeout(resolve, 600)) // Light duration
  }
}

const activateLight = (index: number) => {
  activeLight.value = index
  // Optional: Play sound here
  setTimeout(() => {
    activeLight.value = null
  }, 400)
}

const handleInput = (index: number) => {
  if (gameState.value !== 'WAITING_INPUT') return
  
  activateLight(index)
  playerInput.value.push(index)
  
  // Check validity
  const currentIndex = playerInput.value.length - 1
  const expected = sequence.value[currentIndex]
  
  if (expected === undefined || playerInput.value[currentIndex] !== expected) {
    gameState.value = 'FAIL'
    statusMessage.value = 'Oups ! Séquence incorrecte.'
    return
  }
  
  // Check if round complete
  if (playerInput.value.length === sequence.value.length) {
    currentRound.value++
    if (currentRound.value >= totalRounds) {
      complete()
    } else {
      statusMessage.value = 'Bien joué ! Niveau suivant...'
      setTimeout(startRound, 1000)
    }
  }
}

const complete = () => {
  if (isCompleted.value) return
  gameState.value = 'SUCCESS'
  isCompleted.value = true
  emit('complete')
}

onMounted(() => {
  if (props.initialCompleted) {
    isCompleted.value = true
  } else {
    // Auto start after a moment? Or wait for button
    statusMessage.value = 'Prêt à commencer ?'
  }
})
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.8);
}
.shadow-glow {
  box-shadow: 0 0 10px #FACC15;
}
</style>
