<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import type { LatLngBoundsExpression } from 'leaflet'

// IMPORTANT: Leaflet must be imported dynamically in onMounted to work with Nuxt SSR

const config = useRuntimeConfig()
const tokenCookie = useCookie('auth_token')
const router = useRouter()

const mapContainer = ref<HTMLElement | null>(null)
const isLoading = ref(true)
const errorMsg = ref('')
const discoveredPlaces = ref<Place[]>([]) // Reactive state for the sidebar
const nextPlace = ref<Place | null>(null)

// Placeholder map image
const MAP_IMAGE_URL = 'https://res.cloudinary.com/dveki8qer/image/upload/v1768829196/Gemini_Generated_Image_2pq9hf2pq9hf2pq9_v1c0fi.png'
const MAP_WIDTH = 2000
const MAP_HEIGHT = 1500

interface Place {
  _id: string
  title: string
  description: string
  watercolorLayer: string 
  coordinates?: {
    x: number
    y: number
  }
}

interface UserProfile {
  username: string
  progress: Array<{
    placeId: string
    isCompleted: boolean
  }>
}

const mapInstance = ref<any>(null) // Store map instance

// Hardcoded coordinates for the map (2000x1500) based on place order
// Adjusted to likely street positions
const getPlaceCoordinates = (place: Place) => {
  if (place.coordinates && place.coordinates.x && place.coordinates.y) {
    return place.coordinates
  }
  // Default fallback if missing (should not happen if DB is correct)
  return { x: 1000, y: 750 }
}

const flyToPlace = (place: Place) => {
  const coords = getPlaceCoordinates(place)
  if (mapInstance.value && coords) {
    // In Simple CRS, coords are mapped to LatLng as [y, x]
    mapInstance.value.flyTo([coords.y, coords.x], 1)
  }
}

onMounted(async () => {
  if (!tokenCookie.value) {
    router.push('/login')
    return
  }

  try {
    // Dynamically load Leaflet on client only
    // @ts-ignore
    const L = await import('leaflet')

    // 1. Fetch User Profile
    const userRes = await fetch(`${config.public.apiBase}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenCookie.value}`,
        'Accept': 'application/json'
      }
    })
    if (!userRes.ok) throw new Error('Impossible de charger le profil')
    const user: UserProfile = await userRes.json()

    // 2. Fetch All Places
    const placesRes = await fetch(`${config.public.apiBase}/places`)
    if (!placesRes.ok) throw new Error('Impossible de charger les lieux')
    const allPlaces: Place[] = await placesRes.json()

    // 3. Filter Discovered Places
    const unlockedIds = user.progress
      .filter(p => p.isCompleted)
      .map(p => p.placeId)

    discoveredPlaces.value = allPlaces.filter(p => unlockedIds.includes(p._id))

    // Find the first place that is NOT discovered
    const undiscovered = allPlaces.filter(p => !unlockedIds.includes(p._id))
    if (undiscovered.length > 0) {
      // Sort by order just in case
      undiscovered.sort((a: any, b: any) => (a.order || 99) - (b.order || 99))
      nextPlace.value = undiscovered[0] as Place
    }

    // 4. Initialize Map
    await nextTick() 
    if (mapContainer.value) {
      // Use Simple CRS for flat image maps
      const map = L.map(mapContainer.value, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomSnap: 0.5
      })

      mapInstance.value = map // Save instance

      // Define bounds for the image
      const bounds: LatLngBoundsExpression = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]]

      
      // PROGRESSIVE COLORIZATION LOGIC
      // 0 places -> Saturation 0 (Black & White)
      // 9 places -> Saturation 1 (Full Color)
      // We use CSS Variables injected into the container to handle this smoothly without FOUC
      const totalPlaces = 9
      const discoveredCount = discoveredPlaces.value.length
      // Cap ratio at 1 (100%)
      const ratio = Math.min(discoveredCount / totalPlaces, 1)
      
      // Calculate Saturation Value: 0 -> 1
      const saturationVal = ratio
      
      if (mapContainer.value) {
        mapContainer.value.style.setProperty('--map-saturation', `${saturationVal}`)
      }

      // Add overlay with a specific class that uses the CSS variable
      const overlay = L.imageOverlay(MAP_IMAGE_URL, bounds, {
        className: 'map-procedure-layer'
      }).addTo(map)
      
      map.fitBounds(bounds)

      // Add Markers (In Simple CRS: [y, x])
      discoveredPlaces.value.forEach(place => {
        const coords = getPlaceCoordinates(place)
        
        if (coords) {
          const popupContent = `
            <div class="text-center">
              <h3 class="font-bold text-[#2C3E50] mb-2">${place.title}</h3>
              <img src="${place.watercolorLayer}" alt="${place.title}" class="w-24 h-24 object-cover rounded-lg mx-auto mb-2 shadow-sm" />
              <p class="text-xs text-gray-600 line-clamp-2">${place.description}</p>
            </div>
          `
          
          // Define Custom Icon with Emoji
          const emojiIcon = L.divIcon({
            className: 'custom-emoji-marker',
            html: '<div style="font-size: 2rem; transform: translate(-50%, -50%); filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">📍</div>',
            iconSize: [0, 0], // Valid size to avoid Leaflet errors, but we handle layout via CSS/HTML
            iconAnchor: [0, 10] // Adjust anchor to put tip of pin on the point
          })

          L.marker([coords.y, coords.x], { icon: emojiIcon })
            .addTo(map)
            .bindPopup(popupContent)
        }
      })
      
      if (discoveredPlaces.value.length === 0) {
        errorMsg.value = "Aucun lieu découvert pour le moment."
      }
    }

  } catch (err: any) {
    console.error('Erreur map:', err)
    errorMsg.value = err.message || 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex h-screen w-full bg-[#e9ecf5]"> <!-- Main Flex Container -->
    
    <!-- Left Sidebar -->
    <aside class="w-80 bg-white shadow-xl z-20 flex flex-col border-r border-stone-200">
      <!-- Header / Back -->
      <div class="p-6 border-b border-stone-100 bg-stone-50 relative">
        <h1 class="text-xl font-serif text-[#2C3E50] font-bold">Mes Découvertes</h1>
        <p class="text-xs text-stone-500 mt-1" v-if="!isLoading">{{ discoveredPlaces.length }} lieux révélés</p>
        
        <!-- NEXT STEP CTA -->
        <div v-if="nextPlace" class="mt-6">
          <NuxtLink :to="`/discovery/${nextPlace._id}`" class="block w-full py-3 px-4 bg-[#2C3E50] text-white text-center rounded-xl font-bold hover:bg-[#34495E] hover:scale-[1.02] transition-all shadow-md">
            ✨ Continuer l'aventure
          </NuxtLink>
        </div>
      </div>

      <!-- Scrollable List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <div v-for="n in 3" :key="n" class="bg-stone-50 rounded-xl p-3 animate-pulse flex items-center gap-3">
            <div class="w-16 h-16 bg-stone-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-stone-200 rounded w-3/4"></div>
              <div class="h-3 bg-stone-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="discoveredPlaces.length === 0" class="text-center py-10 text-stone-500">
          <p class="mb-2">👻</p>
          <p class="text-sm">Votre carte est vide...</p>
          <p class="text-xs mt-2">Explorez la ville pour remplir votre carnet !</p>
        </div>

        <!-- Place Item (Click to Navigate) -->
        <div v-for="place in discoveredPlaces" :key="place._id" 
             @click="router.push(`/discovery/${place._id}`)"
             class="group bg-white border border-stone-100 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer flex gap-3 items-center">
          <img :src="place.watercolorLayer" :alt="place.title" class="w-16 h-16 object-cover rounded-lg bg-stone-100 shadow-sm" />
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-[#2C3E50] text-sm truncate">{{ place.title }}</h3>
            <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">{{ place.description }}</p>
          </div>
        </div>

      </div>
    </aside>

    <!-- Map Area (Takes remaining space) -->
    <div class="flex-1 relative h-full bg-[#e9ecf5]">
      
      <!-- Error Overlay in Map Area -->
      <div v-if="errorMsg && !isLoading" class="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-white px-6 py-4 rounded-xl shadow-xl text-center">
         <p class="text-gray-600 mb-2">{{ errorMsg }}</p>
      </div>

      <!-- Map Container -->
      <div ref="mapContainer" class="w-full h-full z-0 outline-none"></div>
    </div>

  </div>
</template>

<style scoped>
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}
:deep(.leaflet-popup-content) {
  margin: 1rem;
}
</style>

<!-- Global styles for dynamic Leaflet elements -->
<style>
/* 
  Target the map overlay image specifically using the class 
  passed to L.imageOverlay options.
  MUST be global because Leaflet moves elements around and scoped styles might miss.
*/
.map-procedure-layer {
  /* Default to 0 saturation (B&W) if variable missing */
  filter: saturate(var(--map-saturation, 0));
  transition: filter 1.5s ease-out;
}
</style>
