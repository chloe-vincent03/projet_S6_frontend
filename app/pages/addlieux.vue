<template>
  <div class="container mx-auto px-4 py-24 max-w-2xl text-stone-800">
    <h1 class="text-3xl font-serif font-bold mb-8 text-center text-emerald-800">Ajouter un nouveau lieu</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-6">
      
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-stone-600 mb-1">Titre du lieu</label>
        <input 
          v-model="form.title" 
          type="text" 
          required 
          placeholder="Ex: La Librairie Cachée"
          class="w-full px-4 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-stone-600 mb-1">Description</label>
        <textarea 
          v-model="form.description" 
          required 
          rows="4"
          placeholder="Raconte l'histoire de ce lieu..."
          class="w-full px-4 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        ></textarea>
      </div>

      <!-- Order (Hidden/Automatic) -->
      <!-- Input removed as requested -->

      <!-- Upload Main Image (Color) -->
      <div>
        <label class="block text-sm font-medium text-stone-600 mb-1">Image Principale (Couleur)</label>
        <div class="flex items-center gap-4">
          <input type="file" @change="e => handleFileSelect(e, 'watercolor')" accept="image/*" class="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
          <span v-if="files.watercolor" class="text-xs text-emerald-600 font-medium">Fichier sélectionné</span>
        </div>
      </div>

      <!-- Upload Optional Ink (BW) -->
      <div>
        <label class="block text-sm font-medium text-stone-600 mb-1 flex justify-between">
          <span>Image "Avant" (Noir & Blanc)</span>
          <span class="text-stone-400 font-normal italic">Optionnel (sera généré auto si vide)</span>
        </label>
        <div class="flex items-center gap-4">
          <input type="file" @change="e => handleFileSelect(e, 'ink')" accept="image/*" class="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"/>
          <span v-if="files.ink" class="text-xs text-stone-600 font-medium">Fichier sélectionné</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="isUploading"
        class="mt-4 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
      >
        <span v-if="isUploading">Envoi en cours...</span>
        <span v-else>Ajouter le lieu</span>
      </button>

      <!-- Status Message -->
      <div v-if="status.message" :class="['p-4 rounded-lg text-sm text-center', status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700']">
        {{ status.message }}
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const config = useRuntimeConfig()

// CONFIGURATION CLOUDINARY
const CLOUD_NAME = 'dveki8qer' 
// IMPORTANT: Si vous avez l'erreur "Upload preset must be whitelisted for unsigned uploads":
// 1. Allez sur https://cloudinary.com/console/settings/upload
// 2. Cherchez "Upload presets".
// 3. Cliquez sur "Add upload preset".
// 4. Mettez "Signing Mode" sur "Unsigned".
// 5. Copiez le "Name" (ex: "ml_default" ou autre) et collez-le ci-dessous :
const UPLOAD_PRESET = 'ml_default'

const form = reactive({
  title: '',
  description: '',
  order: 1, // Will be updated automatically
  inkLayer: '',
  watercolorLayer: ''
})

// Fetch existing places to calculate next order
const { data: existingPlaces } = await useFetch(`${config.public.apiBase}/places`)
if (existingPlaces.value && existingPlaces.value.length > 0) {
  const maxOrder = Math.max(...existingPlaces.value.map(p => p.order || 0))
  form.order = maxOrder + 1
}

const files = reactive({
  ink: null,
  watercolor: null
})

const isUploading = ref(false)
const status = reactive({ type: '', message: '' })

const handleFileSelect = (event, type) => {
  const file = event.target.files[0]
  if (file) {
    files[type] = file
  }
}

const uploadToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Erreur upload')
    return data.secure_url
  } catch (err) {
    console.error('Upload Error:', err)
    throw err
  }
}

const handleSubmit = async () => {
  if (!files.watercolor) {
    status.type = 'error'
    status.message = 'L\'image principale (Couleur) est requise.'
    return
  }

  isUploading.value = true
  status.message = ''

  try {
    // 1. Upload Images
    // Upload Watercolor (Mandatory)
    const watercolorUrl = await uploadToCloudinary(files.watercolor)
    
    // Upload Ink (Optional) or use Watercolor URL
    let inkUrl = watercolorUrl
    if (files.ink) {
      inkUrl = await uploadToCloudinary(files.ink)
    }

    // 2. Prepare Data
    const placeData = {
      ...form,
      inkLayer: inkUrl,
      watercolorLayer: watercolorUrl
    }

    // 3. Send to Backend
    const { error } = await useFetch(`${config.public.apiBase}/places`, {
      method: 'POST',
      body: placeData
    })

    if (error.value) throw new Error(error.value.message)

    status.type = 'success'
    status.message = 'Lieu ajouté avec succès !'
    
    // Reset Form
    form.title = ''
    form.description = ''
    files.ink = null
    files.watercolor = null

  } catch (err) {
    status.type = 'error'
    status.message = `Erreur: ${err.message}.`
  } finally {
    isUploading.value = false
  }
}
</script>
