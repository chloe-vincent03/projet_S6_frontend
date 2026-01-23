<template>
  <!-- Main Container: Light Theme -->
  <div class="min-h-screen bg-[#f4f6fb] text-[#2C3E50] font-sans">
    
    <!-- No Header as requested -->
    <!-- But maybe a back button? User said "pas de header", assuming they want clean look. -->
    <!-- No Header as requested -->
    <!-- But maybe a back button? User said "pas de header", assuming they want clean look. -->

    <div class="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start justify-center min-h-screen">
      
      <!-- Left Column: The Totems Gallery (Stacked in Single Card) -->
      <div class="w-full lg:w-5/12 h-auto z-10 flex flex-col order-2 lg:order-1 sticky top-12">
        
        <div class="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] w-full flex flex-col overflow-hidden divide-y divide-stone-100">
            
            <div class="p-6 pb-2 text-center border-b border-stone-50">
                <h2 class="font-serif text-3xl text-[#2C3E50] font-bold">Totems</h2>
            </div>

            <div 
                v-for="totem in availableTotems" 
                :key="totem.id"
                @click="activeTotemId = totem.id"
                class="relative p-6 flex flex-col items-center cursor-pointer transition-all duration-300"
                :class="activeTotemId === totem.id ? 'bg-stone-50' : 'hover:bg-stone-50/50'"
            >
                <!-- Active Indicator -->
                <div v-if="activeTotemId === totem.id" class="absolute left-0 top-0 bottom-0 w-2 bg-[#2C3E50]"></div>

                <div class="w-full relative">
                    <TotemCanvas 
                        :totemId="totem.id"
                        :completedImage="totem.image"
                        :scale="2" 
                        heightClass="h-[300px]"
                        :isCompleted="isTotemCompleted(totem.id)"
                        class="transition-opacity duration-300"
                        :class="activeTotemId === totem.id ? 'opacity-100' : 'opacity-70 grayscale-[0.5]'"
                    />
                </div>
            </div>

        </div>

      </div>

      <!-- Right Column: The Enigmas (Scrollable) -->
      <div class="w-full lg:w-6/12 flex flex-col gap-8 order-1 lg:order-2">
        
        <div class="mb-4">
           <h1 class="text-4xl md:text-5xl font-serif font-bold text-[#2C3E50] mb-4">Le Grimoire</h1>
           <p class="text-lg text-stone-500 leading-relaxed border-l-4 border-[#2C3E50] pl-4 py-1">
             Les secrets de la ville ne se révèlent qu'à ceux qui savent regarder. Répondez aux énigmes du <strong>{{ activeTotem.name }}</strong>.
           </p>
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
             :initiallySolved="store.isUnlocked(enigma.id)"
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
      <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl transform scale-100 animate-[bounce-in_0.5s_ease-out]">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            
            <h2 class="text-3xl font-serif text-[#2C3E50] font-bold mb-4">Le Totem est Complet !</h2>
            <p class="text-stone-600 mb-8 leading-relaxed">
               Vous avez rassemblé tous les fragments. L'esprit de la ville est réveillé.
            </p>
            
            <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 mb-8">
               <p class="text-[#2C3E50] font-bold flex items-center justify-center gap-2">
                 ✨ Le Totem a été ajouté à votre profil
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
// Use relative path to avoid alias issues if valid
import TotemCanvas from '../components/grimoire/TotemCanvas.vue'
import EnigmaCard from '../components/grimoire/EnigmaCard.vue'

const store = useGrimoireStore()

// Use shared totem metadata
const { totemMetadata } = useTotems()

// Fetch Enigmas from Backend
const config = useRuntimeConfig()
const { data: enigmas } = await useFetch(`${config.public.apiBase}/enigmas`)
const tokenCookie = useCookie('auth_token')

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

const activeTotemId = ref(1)

// Ensure active totem exists in list, default to first if not
watch(availableTotems, (newVal) => {
    if (newVal.length > 0 && !newVal.find(t => t.id === activeTotemId.value)) {
        activeTotemId.value = newVal[0].id
    }
}, { immediate: true })

const activeTotem = computed(() => {
    return availableTotems.value.find(t => t.id === activeTotemId.value) || availableTotems.value[0] || {}
})

// Get enigmas for current totem (Weak comparison for string/number safety)
const currentEnigmas = computed(() => {
  if (!enigmas.value) return []
  return enigmas.value.filter(e => (e.totem_id || 1) == activeTotemId.value)
})

onMounted(async () => {
  if (tokenCookie.value) {
    try {
      const res = await fetch(`${config.public.apiBase}/user/profile`, {
        headers: { 'Authorization': `Bearer ${tokenCookie.value}` }
      })
      if (res.ok) {
        const user = await res.json()
        if (user.unlockedFragments) {
            // Restore state in store
            if (enigmas.value) {
               user.unlockedFragments.forEach(pf => {
                  const enigma = enigmas.value.find(e => e.reward.fragment_id === pf.fragmentId)
                  if (enigma) {
                      store.unlockFragment({
                          id: enigma.id,
                          totemId: enigma.totem_id || 1, // Store totemId!
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
      }
    } catch (e) {
      console.error('Failed to restore grimoire progress', e)
    }
  }
})

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

const showSuccessModal = ref(false)

// Watch for completion to show modal (Only once)
// Watch for completion to show modal (Only once per totem)
watch(isCurrentTotemCompleted, (newVal) => {
  if (newVal) {
    if (process.client) {
       const key = `totem_completion_seen_v1_${activeTotemId.value}`
       const hasSeen = localStorage.getItem(key)
       if (!hasSeen) {
           showSuccessModal.value = true
           localStorage.setItem(key, 'true')
       }
    }
  }
}, { immediate: true })

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
