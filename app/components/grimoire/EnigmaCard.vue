<template>
  <div class="relative p-6 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all">
    
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-[#2C3E50] font-serif text-xl font-bold tracking-wide">
        Énigme #{{ enigmaId }}
      </h3>
      <span v-if="isSolved" aria-label="Statut : Énigme résolue" class="text-green-600 text-xs font-bold uppercase tracking-widest bg-green-50 border border-green-100 px-2 py-1 rounded">
        Résolu
      </span>
    </div>

    <!-- Question -->
    <p class="text-stone-600 font-light leading-relaxed mb-6">
      {{ question }}
    </p>

    <!-- Success Message (Visible if solved) -->
    <div v-if="isSolved" class="text-center py-2">
      <p class="text-[#2C3E50] font-serif font-bold text-lg mb-1">{{ displayedAnswer || 'Énigme Résolue' }}</p>
      <p class="text-stone-500 italic font-serif text-xs opacity-70">"Le fragment s'est révélé..."</p>
    </div>

    <!-- Input Form (Visible if NOT solved) -->
    <form v-else @submit.prevent="verifyAnswer" class="flex flex-col gap-4">
      <input 
        v-model="answer" 
        type="text" 
        placeholder="Votre réponse..." 
        aria-label="Réponse à l'énigme"
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

      <p v-if="error" role="alert" aria-live="assertive" class="text-red-500 text-xs text-center mt-1">
        {{ error }}
      </p>

      <!-- Hint Section -->
      <div v-if="hint && !isSolved" class="mt-2 text-center">
          <button 
            type="button" 
            @click="showHint = !showHint"
            class="text-xs text-stone-400 hover:text-[#2C3E50] underline transition-colors"
          >
            {{ showHint ? "Masquer l'indice" : "Besoin d'un indice ?" }}
          </button>
          <div v-if="showHint" class="mt-2 p-3 bg-stone-50 rounded-lg text-sm text-stone-500 italic border border-stone-100 animate-fade-in">
             {{ hint }}
          </div>
      </div>
    </form>
    
  </div>

  <!-- Meditative Loader -->
  <Teleport to="body">
    <BreathingLoader 
      v-if="isMeditating" 
      :duration="4000"
      :color="themeColor"
      @complete="onMeditationComplete"
    />
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import BreathingLoader from '~/components/shared/BreathingLoader.vue'

const props = defineProps({
  enigmaId: { type: String, required: true },
  question: { type: String, required: true },
  answerProp: { type: String, default: '' },
  hint: { type: String, default: '' },
  initiallySolved: { type: Boolean, default: false },
  themeColor: { type: String, default: '#2C3E50' }
})

const emit = defineEmits(['unlocked'])

const answer = ref('')
const isLoading = ref(false)
const isMeditating = ref(false)
const showHint = ref(false)
const pendingResponse = ref(null) // Stores the API result/error while meditating
const error = ref('')
const isSolved = ref(props.initiallySolved)
const displayedAnswer = ref(props.answerProp)

// Key for localStorage
const storageKey = `enigma_answer_${props.enigmaId}`

onMounted(() => {
  // Check local storage for previously solved answer
  const savedAnswer = localStorage.getItem(storageKey)
  if (savedAnswer) {
    displayedAnswer.value = savedAnswer
    // Note: We don't force isSolved=true here because initiallySolved prop 
    // from parent (backend source of truth) should handle the state. 
    // But if backend says solved but no answer, displayedAnswer will take over.
  }
})

watch(() => props.initiallySolved, (newVal) => {
  if (newVal) {
    isSolved.value = true
  }
})

watch(() => props.answerProp, (newVal) => {
    if (newVal) displayedAnswer.value = newVal
})

const verifyAnswer = async () => {
  isLoading.value = true
  error.value = ''
  pendingResponse.value = null

  try {
    const token = useCookie('auth_token').value

    const res = await fetch(`${config.public.apiBase}/enigmas/verify`, {
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

    const data = await res.json()

    if (res.ok && data.success) {
         // Success! Queue the result and start breathing
         pendingResponse.value = { success: true, data }
         isMeditating.value = true
         // isLoading remains true until meditation completes
    } else {
         // Failure - No breathing
         isLoading.value = false
         error.value = "La réponse n'est pas celle attendue par le totem."
    }

  } catch (e) {
    isLoading.value = false
    console.error(e)
    error.value = "Les esprits semblent perturbés (Erreur serveur)."
  }
}

const onMeditationComplete = () => {
  isMeditating.value = false
  isLoading.value = false

  // Process the result that (hopefully) arrived during the breath
  if (pendingResponse.value) {
      if (pendingResponse.value.success) {
          const data = pendingResponse.value.data
          if (data.success) {
              isSolved.value = true
              
              // Save answer to local storage
              localStorage.setItem(storageKey, answer.value)
              displayedAnswer.value = answer.value

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
      } else {
          // Network/Server error
          console.error(pendingResponse.value.err)
          error.value = "Les esprits semblent perturbés (Erreur serveur)."
      }
  } else {
      // Should technically not happen if request takes < 4s, but fallsafe
      error.value = "Pas de réponse des esprits..."
  }
}
const config = useRuntimeConfig()
</script>
