<template>
  <div class="min-h-screen bg-slate-100 p-10 font-sans">
    <h1 class="text-3xl font-bold text-emerald-800 mb-5">Test de la Ville Lente</h1>
    
    <div v-if="places && places.length">
      <div v-for="place in places" :key="place._id" class="bg-white p-5 rounded-lg shadow-md mb-4">
        <h2 class="text-xl font-semibold">{{ place.title }}</h2>
        <p class="text-gray-600">{{ place.description }}</p>
      </div>
    </div>

    <div v-else-if="pending" class="text-blue-500">Recherche de la boulangerie dans la base de données...</div>

    <div v-else class="text-red-500 bg-red-50 p-4 border border-red-200">
      <p>❌ Erreur : Impossible de joindre le backend.</p>
      <p class="text-sm">Vérifie que ton serveur Express tourne bien sur le port 3001.</p>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
// On appelle la route GET /api/places de ton backend
const { data: places, pending } = await useFetch(`${config.public.apiBase}/places`)
</script>