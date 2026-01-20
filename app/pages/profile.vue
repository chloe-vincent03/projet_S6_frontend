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

        <!-- Actions -->
        <div class="space-y-4">
          <NuxtLink to="/map" class="block w-full py-4 bg-[#2C3E50] text-white text-center rounded-xl font-bold hover:bg-[#34495E] hover:scale-[1.02] transition-all shadow-lg">
            Accéder à la Carte
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

const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')
const router = useRouter()

// Fetch user profile
const { data: user, pending, error } = await useFetch<any>(`${config.public.apiBase}/user/profile`, {
  headers: {
    'Authorization': `Bearer ${tokenCookie.value}`
  }
})

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

const logout = () => {
  tokenCookie.value = null
  router.push('/login')
}
</script>
