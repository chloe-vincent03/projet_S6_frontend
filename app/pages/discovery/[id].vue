<template>
  <div :class="['relative w-full transition-all duration-1000', { 'h-screen overflow-hidden': !isCompleted, 'min-h-screen bg-stone-50': isCompleted }]">
    
    <!-- Loading / Error -->
    <div v-if="pending" class="absolute inset-0 flex items-center justify-center text-white/50 z-50 bg-black">
      <p class="animate-pulse">Initialisation de la mémoire...</p>
    </div>
    <div v-else-if="error || !place" class="absolute inset-0 flex items-center justify-center text-red-500 z-50 bg-black">
      <p>Souvenir introuvable.</p>
      <NuxtLink to="/map" class="block mt-4 text-white underline">Retour</NuxtLink>
    </div>

    <!-- Main Hero / Mechanic Interface -->
    <div v-else class="relative w-full h-screen sticky top-0 z-0 bg-black">
      
      <!-- Dynamic Mechanic Component (Only if NOT completed) -->
      <component 
        v-if="!isCompleted"
        :is="currentMechanic"
        :image="place.watercolorLayer"
        :title="place.title"
        :initial-completed="false"
        @complete="completeDiscovery"
      />

      <!-- Static Image View (If Already Completed) -->
      <div v-else class="relative w-full h-full">
         <img 
          :src="place.watercolorLayer" 
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/20 pointer-events-none"></div>
        
        <!-- Title Overlay -->
        <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
           <h1 class="text-white font-serif text-5xl md:text-7xl font-bold text-shadow-lg tracking-wider animate-fade-in-up" style="color: white !important;">{{ place.title }}</h1>
        </div>
      </div>

      <!-- Scroll Indicator (Always visible when completed) -->
      <div v-if="isCompleted" class="absolute bottom-8 left-0 right-0 z-30 flex justify-center animate-bounce">
           <div class="p-3 bg-white/20 backdrop-blur-md rounded-full text-white cursor-pointer shadow-lg border border-white/10 hover:bg-white/30 transition-colors" @click="scrollToContent">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
           </div>
      </div>

    </div>

    <!-- Scrollable Content Section -->
    <section id="details" class="relative z-30 bg-white min-h-[50vh]" v-if="place">
       <div class="container mx-auto px-6 py-24 max-w-4xl text-center">
          <span class="text-sm font-bold uppercase tracking-widest text-stone-500 block mb-4">Chapitre {{ place.order }}</span>
          <h2 class="text-4xl md:text-5xl font-serif text-[#2C3E50] leading-tight mb-8">{{ place.title }}</h2>
          
          <div class="w-24 h-1 bg-stone-200 mx-auto mb-12"></div>
          
          <p class="text-xl text-stone-600 leading-loose font-light mb-16">
            {{ place.description }}
          </p>

          <div class="flex flex-col md:flex-row gap-4 justify-center">
             <NuxtLink to="/map" class="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#2C3E50] text-[#2C3E50] rounded-full font-bold shadow-sm hover:bg-stone-50 hover:scale-105 transition-all">
                <span>Retour à la Carte</span>
             </NuxtLink>

             <NuxtLink v-if="nextPlace" :to="`/discovery/${nextPlace._id}`" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2C3E50] text-white rounded-full font-bold shadow-lg hover:bg-[#34495E] hover:scale-105 transition-all">
                <span>Chapitre Suivant</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </NuxtLink>
          </div>
       </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MechanicFocus from '~/components/mechanics/MechanicFocus.vue'
import MechanicFlashlight from '~/components/mechanics/MechanicFlashlight.vue'

import MechanicPuzzle from '~/components/mechanics/MechanicPuzzle.vue'

import MechanicRotate from '~/components/mechanics/MechanicRotate.vue'
import MechanicMelody from '~/components/mechanics/MechanicMelody.vue'

import MechanicDifference from '~/components/mechanics/MechanicDifference.vue'
import MechanicSequence from '~/components/mechanics/MechanicSequence.vue'
import MechanicTuning from '~/components/mechanics/MechanicTuning.vue'

const route = useRoute()
const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')
const router = useRouter()

const placeId = route.params.id as string
const isCompleted = ref(false)

// Fetch place details
const { data: place, pending, error } = await useFetch<any>(`${config.public.apiBase}/places/${placeId}`)

// Check if already unlocked
const { data: user } = await useFetch<any>(`${config.public.apiBase}/user/profile`, {
  headers: {
    'Authorization': `Bearer ${tokenCookie.value}`
  }
})

if (user.value && user.value.progress && place.value) {
  const isUnlocked = user.value.progress.some((p: any) => p.placeId === placeId && p.isCompleted)
  if (isUnlocked) {
    isCompleted.value = true
  }
}

// Mechanic Selection Logic
const currentMechanic = computed(() => {
  if (!place.value) return MechanicFocus
  
  switch (place.value.order) {
    case 3:
      return MechanicFlashlight
    case 4:
      return MechanicMelody
    case 5:
      return MechanicPuzzle
    case 6:
      return MechanicRotate
    case 7:
      return MechanicDifference
    case 8:
      return MechanicSequence
    case 9:
      return MechanicTuning
    default:
      return MechanicFocus
  }
})

const completeDiscovery = async () => {
  if (isCompleted.value) return
  isCompleted.value = true

  // Save progress
  if (tokenCookie.value) {
     try {
        await fetch(`${config.public.apiBase}/user/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenCookie.value}`
          },
          body: JSON.stringify({ placeId: placeId })
        })
     } catch (err) {
       console.error('Failed to save progress', err)
     }
  }
}

// Fetch all places to find the next one
const { data: allPlaces } = await useFetch<any[]>(`${config.public.apiBase}/places`)

const nextPlace = computed(() => {
  if (!place.value || !allPlaces.value) return null
  return allPlaces.value.find(p => p.order === place.value.order + 1)
})

const scrollToContent = () => {
  document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
