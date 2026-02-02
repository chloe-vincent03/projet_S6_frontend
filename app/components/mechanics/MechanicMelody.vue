<template>
  <div class="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
    
    <!-- Image with dynamic filters -->
    <div class="absolute inset-0 z-0">
      <img 
        :src="image" 
        class="w-full h-full object-cover transition-all duration-700 ease-out"
        :style="imageStyle"
        alt="Souvenir à recomposer"
      />
    </div>

    <!-- Notes Layer -->
    <div class="absolute inset-0 z-10 overflow-hidden pointer-events-none">
       <transition-group name="note-pop">
         <div 
           v-for="note in notes" 
           :key="note.id"
           class="absolute cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 transition-transform duration-200 p-4"
           :style="{ 
              left: `${note.x}%`, 
              top: `${note.y}%`,
              animation: `float ${note.duration}s ease-in-out infinite ${note.delay}s`
           }"
           @click="collectNote(note.id)"
         >
            <!-- SVG Icon: Note -->
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-lg text-white">
              <path v-if="note.type === 0" d="M9 18V5l12-2v13"></path>
              <path v-if="note.type === 0" d="M6 15h3a3 3 0 1 1-3 3v-3Z"></path>
              <circle v-if="note.type === 0" cx="18" cy="16" r="3"></circle>
              
              <path v-if="note.type === 1" d="M9 18V5l12-2v13"></path>
              <path v-if="note.type === 1" d="M6 15h3a3 3 0 1 1-3 3v-3Z"></path>
              
              <path v-if="note.type === 2" d="M11 5L6 9H2v6h4l5 4V5z"></path>
            </svg>
         </div>
       </transition-group>
    </div>

    <!-- UI Overlay -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
       <!-- Instructions -->
       <div class="mb-12 text-center transition-opacity duration-500 bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl mx-4" :class="{ 'opacity-0': isCompleted }">
         <h2 class="text-white font-serif text-2xl md:text-3xl mb-2 text-shadow-lg drop-shadow-md" style="color: white !important;">
            Attrapez la mélodie...
         </h2>
         <p class="text-white/80 text-sm max-w-md mx-auto drop-shadow font-medium">
            Cliquez sur les notes pour éclaircir le souvenir ({{ collectedCount }}/{{ totalNotes }}).
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
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  image: string
  title: string
  initialCompleted?: boolean
}>()

const emit = defineEmits(['complete'])

interface Note {
  id: number
  x: number
  y: number
  type: number
  duration: number
  delay: number
}

const totalNotes = 7
const notes = ref<Note[]>([])
const collectedCount = ref(0)
const isCompleted = ref(false)

// Initialize notes with random positions but centralized enough to be clickable
onMounted(() => {
  if (props.initialCompleted) {
    isCompleted.value = true
    collectedCount.value = totalNotes
    return
  }

  for (let i = 0; i < totalNotes; i++) {
    notes.value.push({
      id: i,
      x: 10 + Math.random() * 80, // 10% to 90% width
      y: 20 + Math.random() * 60, // 20% to 80% height (avoid edges)
      type: Math.floor(Math.random() * 3),
      duration: 3 + Math.random() * 3, // 3-6s float loop
      delay: Math.random() * 2 // 0-2s offset
    })
  }
})

const imageStyle = computed(() => {
  if (isCompleted.value) {
    return {
      filter: 'blur(0px) grayscale(0%) brightness(100%)',
      opacity: 1
    }
  }

  // Calculate progress (0 to 1)
  const progress = collectedCount.value / totalNotes
  
  const blur = 20 * (1 - progress)
  const grayscale = 100 * (1 - progress)
  const brightness = 30 + (70 * progress)

  return {
    filter: `blur(${blur}px) grayscale(${grayscale}%) brightness(${brightness}%)`,
    opacity: 0.3 + (0.7 * progress)
  }
})

const collectNote = (id: number) => {
  if (isCompleted.value) return
  
  // Remove note from list
  const idx = notes.value.findIndex(n => n.id === id)
  if (idx !== -1) {
    notes.value.splice(idx, 1)
    collectedCount.value++
    
    // Check completion
    if (collectedCount.value >= totalNotes) {
      complete()
    }
  }
}

const complete = () => {
  isCompleted.value = true
  emit('complete')
}

</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Note Pop Transition */
.note-pop-enter-active,
.note-pop-leave-active {
  transition: all 0.3s ease;
}
.note-pop-enter-from {
  opacity: 0;
  transform: scale(0);
}
.note-pop-leave-to {
  opacity: 0;
  transform: scale(1.5) rotate(20deg);
}
</style>
