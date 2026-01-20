<template>
  <div class="relative p-6 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all">
    
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-[#2C3E50] font-serif text-xl font-bold tracking-wide">
        Énigme #{{ enigmaId }}
      </h3>
      <span v-if="isSolved" class="text-green-600 text-xs font-bold uppercase tracking-widest bg-green-50 border border-green-100 px-2 py-1 rounded">
        Résolu
      </span>
    </div>

    <!-- Question -->
    <p class="text-stone-600 font-light leading-relaxed mb-6">
      {{ question }}
    </p>

    <!-- Success Message (Visible if solved) -->
    <div v-if="isSolved" class="text-center py-2">
      <p class="text-[#2C3E50] italic font-serif opacity-70">"Le fragment s'est révélé..."</p>
    </div>

    <!-- Input Form (Visible if NOT solved) -->
    <form v-else @submit.prevent="verifyAnswer" class="flex flex-col gap-4">
      <input 
        v-model="answer" 
        type="text" 
        placeholder="Votre réponse..." 
        class="w-full bg-stone-50 border border-stone-200 text-[#2C3E50] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#2C3E50]/20 focus:border-[#2C3E50] outline-none transition-all placeholder-stone-400"
        :disabled="isLoading"
      />
      
      <button 
        type="submit" 
        :disabled="!answer || isLoading"
        class="w-full py-3 bg-[#2C3E50] text-white font-bold rounded-xl hover:bg-[#34495E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
      >
        <span v-if="isLoading" class="animate-pulse">Invocation...</span>
        <span v-else>Invoquer</span>
      </button>

      <p v-if="error" class="text-red-500 text-xs text-center mt-1">
        {{ error }}
      </p>
    </form>
    
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  enigmaId: { type: String, required: true },
  question: { type: String, required: true },
  initiallySolved: { type: Boolean, default: false }
})

const emit = defineEmits(['unlocked'])

const answer = ref('')
const isLoading = ref(false)
const error = ref('')
const isSolved = ref(props.initiallySolved)

watch(() => props.initiallySolved, (newVal) => {
  if (newVal) {
    isSolved.value = true
  }
})

const verifyAnswer = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Verify with Backend
    const config = useRuntimeConfig()
    const token = useCookie('auth_token').value // Helper from Nuxt

    const response = await fetch(`${config.public.apiBase}/enigmas/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        id: props.enigmaId,
        answer: answer.value
      })
    })

    const data = await response.json()

    if (data.success) {
       isSolved.value = true
       // Use reward data from API
       const reward = data.reward
       
       const fragmentData = {
         id: props.enigmaId,
         url: reward.fragment_svg_path,
         x: reward.x, 
         y: reward.y,
         width: reward.width,
         zIndex: reward.zIndex
       }
       emit('unlocked', fragmentData)
    } else {
       error.value = "La réponse n'est pas celle attendue par le totem."
    }
  } catch (e) {
    console.error(e)
    error.value = "Les esprits semblent perturbés (Erreur serveur)."
  } finally {
    isLoading.value = false
  }
}
const config = useRuntimeConfig()
</script>
