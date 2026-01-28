<template>
  <div class="min-h-screen bg-[#e9ecf5] flex items-center justify-center p-6">
    
    <div v-if="pending" class="text-stone-500 animate-pulse">Chargement du profil...</div>
    
    <div v-else-if="error" class="text-center">
      <p class="text-red-500 font-bold mb-4">Impossible de charger le profil</p>
      <NuxtLink to="/login" class="text-[#2C3E50] underline">Se reconnecter</NuxtLink>
    </div>

    <div v-else class="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
      
      <!-- Header with pattern/color -->
      <div class="h-32 bg-[#2C3E50] relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <!-- Back Button -->
        <NuxtLink to="/" class="absolute top-6 left-6 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium">
           ← Accueil
        </NuxtLink>
      </div>

      <!-- Profile Info -->
      <div class="px-8 pb-8 -mt-16 relative z-10">
        
        <!-- Avatar Placeholder -->
        <div class="w-32 h-32 mx-auto bg-stone-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-[#2C3E50] mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>

        <div class="text-center mb-8">
          <h1 class="text-2xl font-serif font-bold text-[#2C3E50]">{{ user.username || 'Explorateur' }}</h1>
          <p class="text-stone-500 text-sm">{{ user.email }}</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-stone-50 p-4 rounded-2xl text-center border border-stone-100">
             <span class="block text-3xl font-bold text-[#2C3E50] mb-1">{{ unlockedCount }}</span>
             <span class="text-xs text-stone-500 uppercase tracking-widest font-bold">Lieux Découverts</span>
          </div>
          <div class="bg-stone-50 p-4 rounded-2xl text-center border border-stone-100">
             <span class="block text-3xl font-bold text-[#2C3E50] mb-1">{{ progressPercentage }}%</span>
             <span class="text-xs text-stone-500 uppercase tracking-widest font-bold">Progression</span>
          </div>
        </div>

        <!-- Totem Collection Section -->
        <div class="mb-8">
           <h3 class="text-[#2C3E50] font-serif font-bold text-lg mb-4 flex items-center gap-2">
             Mes Totems
           </h3>
           
           <div class="bg-stone-50 rounded-2xl p-4 border border-stone-100">
               <!-- Carousel Container -->
               <div class="relative w-full aspect-[2/3] bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group">
                  
                  <!-- Slides -->
                  <div v-if="completedTotems.length > 0" class="relative w-full h-full">
                      <Transition name="fade" mode="out-in">
                          <div :key="currentSlide" class="w-full h-full relative flex flex-col items-center justify-center p-4 animate-fade-in">
                                <img 
                                  :src="completedTotems[currentSlide].image" 
                                  :alt="completedTotems[currentSlide].name" 
                                  class="w-full h-full object-contain p-4 drop-shadow-xl"
                                />
                                <div class="absolute bottom-4 bg-white/90 px-4 py-2 rounded-full shadow-sm">
                                     <span class="text-sm font-bold text-stone-600 font-serif">{{ completedTotems[currentSlide].name }}</span>
                                </div>
                          </div>
                      </Transition>

                      <!-- Controls -->
                      <button 
                        v-if="completedTotems.length > 1"
                        @click="prevSlide" 
                        class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow text-stone-600 hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100"
                      >
                         ❮
                      </button>
                      
                      <button 
                        v-if="completedTotems.length > 1"
                        @click="nextSlide" 
                        class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow text-stone-600 hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100"
                      >
                         ❯
                      </button>

                      <!-- Indicators -->
                      <div v-if="completedTotems.length > 1" class="absolute bottom-1 w-full flex justify-center gap-2 pb-2">
                          <button 
                            v-for="(_, index) in completedTotems" 
                            :key="index"
                            @click="currentSlide = index"
                            class="w-2 h-2 rounded-full transition-all"
                            :class="currentSlide === index ? 'bg-stone-600 w-4' : 'bg-stone-300 hover:bg-stone-400'"
                          ></button>
                      </div>
                  </div>

                  <!-- Empty State -->
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                     <div class="text-4xl mb-2 opacity-30">🔮</div>
                     <p class="italic text-sm">Aucun totem complété pour l'instant.</p>
                  </div>
               </div>
           </div>
        </div>

        <!-- Actions -->
        <div class="space-y-4">
          <NuxtLink to="/map" class="block w-full py-4 bg-[#2C3E50] text-white text-center rounded-xl font-bold hover:bg-[#34495E] hover:scale-[1.02] transition-all shadow-lg">
            Accéder à la Carte
          </NuxtLink>

          <NuxtLink to="/grimoire" class="block w-full py-4 border-2 border-[#2C3E50] text-[#2C3E50] text-center rounded-xl font-bold hover:bg-stone-50 hover:scale-[1.02] transition-all shadow-sm">
            Ouvrir le Grimoire
          </NuxtLink>

          <button @click="logout" class="block w-full py-4 border border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-colors">
            Déconnexion
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGrimoireStore } from '~/stores/grimoire'

const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')
const router = useRouter()
const { getTotemMetadata } = useTotems()

// Fetch user profile
const { data: user, pending, error } = await useFetch<any>(`${config.public.apiBase}/user/profile`, {
  headers: {
    'Authorization': `Bearer ${tokenCookie.value}`
  },
  immediate: computed(() => !!tokenCookie.value && tokenCookie.value !== 'null' && tokenCookie.value !== 'undefined').value,
  watch: [tokenCookie]
})

// Fetch enigmas to determine totem structure
const { data: enigmas } = await useFetch<any[]>(`${config.public.apiBase}/enigmas`)

// Computed Stats
const unlockedCount = computed(() => {
  if (!user.value || !user.value.progress) return 0
  return user.value.progress.filter((p: any) => p.isCompleted).length
})

// Fetch all places to get count
const { data: places } = await useFetch<any[]>(`${config.public.apiBase}/places`)

const totalPlaces = computed(() => places.value?.length || 0)

const progressPercentage = computed(() => {
  if (totalPlaces.value === 0) return 0
  return Math.round((unlockedCount.value / totalPlaces.value) * 100)
})

const currentSlide = ref(0) // State for carousel

const nextSlide = () => {
    if (currentSlide.value < completedTotems.value.length - 1) {
        currentSlide.value++
    } else {
        currentSlide.value = 0 // Loop back
    }
}

const prevSlide = () => {
    if (currentSlide.value > 0) {
        currentSlide.value--
    } else {
        currentSlide.value = completedTotems.value.length - 1 // Loop to end
    }
}

const completedTotems = computed(() => {
    if (!enigmas.value || !user.value?.unlockedFragments) return []
    
    // Group enigmas by totem
    const totems: Record<number, string[]> = {}
    enigmas.value.forEach(e => {
        const tId = e.totem_id || 1
        if (!totems[tId]) totems[tId] = []
        
        // Use the fragment_id from the reward, as that's what's saved in the user profile
        if (e.reward && e.reward.fragment_id) {
            totems[tId].push(e.reward.fragment_id)
        }
    })

    const completed: any[] = []
    Object.keys(totems).forEach(tIdKey => {
        const tId = Number(tIdKey)
        const totemEnigmas = totems[tId] || []
        if (totemEnigmas.length === 0) return

        // Check if user has ALL fragments for this totem
        const isComplete = totemEnigmas.every((eId: string) => 
            user.value.unlockedFragments.some((uf: any) => {
                // Loose comparison might be safer if IDs are mixed types
                return String(uf.fragmentId) === String(eId)
            })
        )

        if (isComplete) {
            completed.push(getTotemMetadata(tId))
        }
    })
    
    return completed
})

const logout = () => {
  // Clear local state
  const store = useGrimoireStore()
  store.resetStore()
  
  // Clear auth
  tokenCookie.value = null
  router.push('/login')
}
</script>
