<template>
  <!-- Main Container: Light Theme -->
  <!-- Main Container: Light Theme (Subtle Gradient from main.css handles bg) -->
  <div class="min-h-screen text-[#2C3E50] font-sans">
    
    <!-- No Header as requested -->
    <!-- But maybe a back button? User said "pas de header", assuming they want clean look. -->
    <!-- No Header as requested -->
    <!-- But maybe a back button? User said "pas de header", assuming they want clean look. -->

    <div class="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start justify-center min-h-screen">
      
      <!-- Left Column: The Totems Gallery -->
      <!-- Mobile: Horizontal Scroll (Top) -->
      <!-- Desktop: Stacked Vertical (Left) -->
      <div class="w-full lg:w-5/12 h-auto z-10 flex flex-col order-1 lg:order-1 lg:sticky lg:top-12">
        
        <div class="bg-white rounded-3xl w-full flex lg:flex-col flex-row justify-center lg:justify-start overflow-x-auto lg:overflow-visible divide-x lg:divide-x-0 lg:divide-y divide-stone-100 shadow-sm border border-stone-100 no-scrollbar snap-x snap-mandatory scroll-px-4 lg:scroll-px-0">
            
            <div class="hidden lg:block p-6 pb-2 text-center border-b border-stone-50">
                <h2 class="font-serif text-3xl text-[#2C3E50] font-bold">Totems</h2>
            </div>

            <div 
                v-for="totem in availableTotems" 
                :key="totem.id"
                @click="activeTotemId = totem.id"
                class="relative p-2 lg:p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-w-[90px] lg:min-w-0 snap-start shrink-0 group"
                :class="activeTotemId === totem.id ? 'bg-stone-50 lg:bg-stone-50' : 'hover:bg-stone-50/50'"
            >
                <!-- Active Indicator (Left for Desktop, Ring for Mobile) -->
                <div v-if="activeTotemId === totem.id" class="absolute left-0 top-0 bottom-0 w-2 bg-[#2C3E50] hidden lg:block"></div>
                
                <!-- Mobile Active Ring Background -->
                <div v-if="activeTotemId === totem.id" class="absolute inset-2 bg-[#2C3E50]/5 rounded-xl lg:hidden"></div>

                <div class="w-full relative flex flex-col items-center justify-center gap-2">
                    <TotemCanvas 
                        :totemId="totem.id"
                        :completedImage="totem.image"
                        :scale="2" 
                        heightClass="h-[60px] lg:h-[300px]"
                        paddingClass="p-1 lg:p-8"
                        emptyIconClass="text-2xl lg:text-6xl"
                        :isCompleted="isTotemCompleted(totem.id)"
                        class="transition-transform duration-300"
                        :class="activeTotemId === totem.id ? 'scale-110 lg:scale-100 opacity-100' : 'opacity-70 grayscale-[0.5] group-hover:scale-105'"
                    />
                </div>
            </div>

        </div>

      </div>

      <!-- Right Column: The Enigmas (Scrollable) -->
      <!-- Mobile: Below Totems -->
      <div class="w-full lg:w-6/12 flex flex-col gap-8 order-2 lg:order-2">
        
        <div class="mb-4">
           <h1 class="text-4xl md:text-5xl font-serif font-bold text-[#2C3E50] mb-4">Le Grimoire</h1>
           <p class="text-lg text-stone-500 leading-relaxed border-l-4 border-[#2C3E50] pl-4 py-1 italic mb-4">
             "{{ activeTotem.description }}"
           </p>
           
           <!-- Locate Button -->
           <NuxtLink :to="`/map?focusTotem=${activeTotemId}`" class="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-sm font-bold transition-colors">
              <span>Localiser le Sanctuaire</span>
           </NuxtLink>
        </div>

        <!-- Enigma List -->
        <TransitionGroup 
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="transform translate-y-10 opacity-0"
            leave-active-class="absolute opacity-0 hidden" 
            tag="div" 
            class="flex flex-col gap-6 relative"
        >
           <EnigmaCard 
             v-for="enigma in currentEnigmas" 
             :key="enigma.id"
             :enigmaId="enigma.id"
             :question="enigma.question"
             :hint="enigma.hint"
             :initiallySolved="store.isUnlocked(enigma.id)"
             :themeColor="activeTotemColor"
             :answerProp="enigma.answer"
             @unlocked="handleUnlock"
           />
           <div v-if="currentEnigmas.length === 0" key="empty" class="text-center py-12 text-stone-400 italic">
                Aucune énigme trouvée pour ce totem.
           </div>
        </TransitionGroup>
      </div>

    </div>
    <!-- Success Modal Overlay -->
    <Transition>
      <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
         <div class="bg-white p-12 max-w-lg w-full text-center rounded-3xl transform scale-100 animate-[bounce-in_0.5s_ease-out] shadow-2xl">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            
            <h2 class="text-3xl font-serif text-[#2C3E50] font-bold mb-4">Le Totem est Complet !</h2>
            <p class="text-stone-600 mb-8 leading-relaxed">
               Vous avez rassemblé tous les fragments. L'esprit de la ville est réveillé.
            </p>
            
            <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 mb-8">
               <p class="text-[#2C3E50] font-bold flex items-center justify-center gap-2">
                 Le Totem a été ajouté à votre profil
               </p>
            </div>

            <div class="flex flex-col gap-3">
               <NuxtLink to="/profile" class="w-full py-4 bg-[#2C3E50] text-white rounded-xl font-bold hover:bg-[#34495E] hover:scale-105 transition-all shadow-lg">
                  Voir mon Profil
               </NuxtLink>
               <button @click="closeSuccessModal" class="text-stone-400 text-sm hover:text-stone-600 underline mt-2">
                  Rester sur le Grimoire
               </button>
            </div>
         </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useGrimoireStore } from '~/stores/grimoire'
const route = useRoute()
// Use relative path to avoid alias issues if valid
import TotemCanvas from '../components/grimoire/TotemCanvas.vue'
import EnigmaCard from '../components/grimoire/EnigmaCard.vue'

const store = useGrimoireStore()

// Use shared totem metadata
const { totemMetadata } = useTotems()

useHead({
  title: 'Le Grimoire',
  meta: [
    { name: 'description', content: 'Consultez le Grimoire de La Ville Lente. Retrouvez tous les fragments de totems collectés et les histoires dévoilées.' },
    { property: 'og:title', content: 'Le Grimoire - La Ville Lente' },
    { property: 'og:description', content: 'Retrouvez tous les fragments de totems collectés et les histoires dévoilées.' }
  ]
})


// Fetch Enigmas from Backend
const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')

const { data: enigmas } = await useFetch(`${config.public.apiBase}/enigmas`, {
    headers: {
        Authorization: tokenCookie.value ? `Bearer ${tokenCookie.value}` : ''
    }
})

// Compute available totems dynamically from enigmas
const availableTotems = computed(() => {
  if (!enigmas.value) return []
  
  // Extract unique totem IDs from enigmas
  const uniqueIds = [...new Set(enigmas.value.map(e => e.totem_id || 1))].sort((a, b) => a - b)
  
  return uniqueIds.map(id => {
    const meta = totemMetadata[id]
    return {
      id: id,
      name: meta?.name || `Totem #${id}`,
      image: meta?.image || "", // Provide a default placeholder URL if needed, or empty
      description: meta?.description || "Un nouveau mystère à résoudre."
    }
  })
})

// Define a color palette for totems
const totemPalette = {
  1: '#10B981', // Emerald (Nature)
  2: '#F59E0B', // Amber (Warmth/Light)
  3: '#3B82F6', // Blue (Water/Sky)
  4: '#8B5CF6', // Purple (Mystery)
  5: '#EC4899', // Pink (Love/Charm)
  6: '#6366F1'  // Indigo
}

const activeTotemColor = computed(() => {
  return totemPalette[activeTotemId.value] || '#2C3E50'
})

const activeTotemId = ref(1)

// Ensure active totem exists in list, default to first if not
watch(availableTotems, (newVal) => {
    // Check route query for initial totem
    const rawQuery = Array.isArray(route.query.totemId) ? route.query.totemId[0] : route.query.totemId
    const queryTotemId = parseInt(rawQuery)

    if (queryTotemId && newVal.find(t => t.id === queryTotemId)) {
        activeTotemId.value = queryTotemId
    } else if (newVal.length > 0 && !newVal.find(t => t.id === activeTotemId.value)) {
        activeTotemId.value = newVal[0].id
    }
}, { immediate: true })

const activeTotem = computed(() => {
    return availableTotems.value.find(t => t.id === activeTotemId.value) || availableTotems.value[0] || {}
})

// Get enigmas for current totem (Weak comparison for string/number safety)
const currentEnigmas = computed(() => {
  if (!enigmas.value) return []
  return enigmas.value
    .filter(e => (e.totem_id || 1) == activeTotemId.value)
    .sort((a, b) => a.id - b.id)
})

const showSuccessModal = ref(false)
const isRestoring = ref(true) // Start as true to block initial triggers

// Check if current totem is completed (Computed for the Modal)
const isCurrentTotemCompleted = computed(() => {
  if (currentEnigmas.value.length === 0) return false
  return currentEnigmas.value.every(e => store.isUnlocked(e.id))
})

// Helper for template loop
const isTotemCompleted = (tId) => {
  const totemEnigmas = enigmas.value ? enigmas.value.filter(e => (e.totem_id || 1) === tId) : []
  if (totemEnigmas.length === 0) return false
  return totemEnigmas.every(e => store.isUnlocked(e.id))
}

// Watch for completion to show modal
watch(isCurrentTotemCompleted, (newVal, oldVal) => {
  // Only show if we are NOT restoring data and it's a fresh completion
  if (newVal && !oldVal && !isRestoring.value) {
     showSuccessModal.value = true
  }
})

onMounted(async () => {
  if (tokenCookie.value) {
    try {
      const res = await fetch(`${config.public.apiBase}/user/profile`, {
        headers: { 'Authorization': `Bearer ${tokenCookie.value}` }
      })
      if (res.ok) {
        const user = await res.json()
        if (user.unlockedFragments && enigmas.value) {
             user.unlockedFragments.forEach(pf => {
                  const enigma = enigmas.value.find(e => e.reward.fragment_id === pf.fragmentId)
                  if (enigma) {
                      store.unlockFragment({
                          id: enigma.id,
                          totemId: enigma.totem_id || 1, 
                          url: enigma.reward.fragment_svg_path,
                          x: enigma.reward.x, 
                          y: enigma.reward.y,
                          width: enigma.reward.width,
                          zIndex: enigma.reward.zIndex
                      })
                  }
             })
        }
      }
    } catch (e) {
      console.error('Failed to restore grimoire progress', e)
    }
  }
  
  // Allow modals after restoration is done
  setTimeout(() => {
    isRestoring.value = false
  }, 500)
})

const closeSuccessModal = () => {
    showSuccessModal.value = false
}

const handleUnlock = (fragment) => {
  // fragment from EnigmaCard might not have totemId if not passed down.
  // Actually EnigmaCard doesn't know about totemId unless we pass it.
  // We can lookup enigma by fragment.id (which is enigma.id)
  const enigma = enigmas.value.find(e => e.id === fragment.id)
  if (enigma) {
      store.unlockFragment({
          ...fragment,
          totemId: enigma.totem_id || 1
      })
  } else {
      store.unlockFragment(fragment)
  }
}
</script>

<style scoped>
/* Simple fade transition for the modal */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
