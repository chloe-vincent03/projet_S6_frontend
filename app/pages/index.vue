<template>
  <div class="container mx-auto px-4 py-12">
    <div v-if="pending" class="flex items-center justify-center min-h-[50vh]">
      <p class="text-stone-500 animate-pulse">Chargement des lieux...</p>
    </div>
    
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[50vh] text-red-500">
      <p class="font-bold">Erreur de chargement</p>
      <p class="text-sm mt-2">{{ error.message }}</p>
    </div>
    
    <div v-else class="space-y-32">
       <div v-if="places && places.length === 0" class="text-center text-stone-500 mt-20">
          Aucun lieu trouvé.
       </div>
       <PlaceCard 
         v-for="place in places" 
         :key="place._id" 
         :place="place" 
       />
       <!-- Spacing to allow scrolling for the last item's animation -->
       <div class="h-40"></div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const { data: places, pending, error } = await useFetch(`${config.public.apiBase}/places`)
</script>
