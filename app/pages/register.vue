<script lang="ts" setup>
const username = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const config = useRuntimeConfig()

async function onSubmit() {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const userData = {
      username: username.value,
      email: email.value,
      password: password.value
    }

    // Attempting connection to /user/register
    // Verified: app.use('/api/user', ...) and router.post('/register', ...) -> /api/user/register
    const response = await fetch(`${config.public.apiBase}/user/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    const responseText = await response.text()
    let data;

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      // If parsing fails, it's likely an HTML error page (404, 500, etc.)
      console.error('Réponse non-JSON reçue:', responseText)
      throw new Error(`Le serveur a renvoyé une réponse invalide (${response.status}). Vérifiez la console pour les détails.`)
    }

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription')
    }
    
    // Success
    // SUCCESS: Account created. Now Auto-Login.
    
    // 2. Auto-Login
    const loginResponse = await fetch(`${config.public.apiBase}/user/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const loginData = await loginResponse.json()

    if (!loginResponse.ok) {
       // Fallback: If auto-login fails, redirect to login page
       console.warn('Auto-login failed:', loginData.message)
       await navigateTo('/login')
       return
    }

    if (loginData.token) {
      // 3. Store Token & Redirect to Map
      // Note: We need to use useCookie here as well to be consistent
      const tokenCookie = useCookie('auth_token', {
        maxAge: 60 * 60 * 24 
      })
      tokenCookie.value = loginData.token
      
      await navigateTo('/map')
    } else {
       await navigateTo('/login')
    }
    
  } catch (err: any) {
    console.error('Erreur inscription:', err)
    errorMsg.value = err.message || 'Une erreur est survenue lors de l\'inscription.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f6fb] to-[#e9ecf5] p-4 font-sans">
    <div class="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
      
      <h1 class="text-3xl font-bold text-center mb-8" style="color: #2C3E50">
        Créer un compte
      </h1>

      <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
        
        <!-- Username -->
        <div class="flex flex-col gap-1.5">
          <label for="username" class="text-sm font-medium text-gray-700">
            Nom d'utilisateur
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Pseudo"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 outline-none transition-all placeholder-gray-400"
            style="accent-color: #2C3E50; caret-color: #2C3E50"
          />
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="exemple@test.com"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 outline-none transition-all placeholder-gray-400"
            style="accent-color: #2C3E50; caret-color: #2C3E50"
          />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Mot de passe"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 outline-none transition-all placeholder-gray-400"
            style="accent-color: #2C3E50; caret-color: #2C3E50"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
          {{ errorMsg }}
        </div>

        <!-- Actions -->
        <div class="flex flex-col items-center gap-4 mt-4">
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-3 px-4 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex justify-center items-center"
            style="background-color: #2C3E50"
          >
            <span v-if="isLoading">Inscription...</span>
            <span v-else>S'inscrire</span>
          </button>

          <p class="text-sm text-gray-600">
            Déjà un compte ?
            <NuxtLink to="/login" class="font-medium hover:underline transition-colors" style="color: #2C3E50">
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
