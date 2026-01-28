<template>
  <div class="min-h-screen bg-[#e9ecf5] flex items-center justify-center p-6">
    <div class="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-stone-100 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 left-0 w-full h-2 bg-[#2C3E50]"></div>

        <h1 class="font-serif text-3xl md:text-4xl text-[#2C3E50] font-bold mb-6 mt-4">Contactez-nous</h1>
        
        <p class="text-stone-600 mb-8 leading-relaxed">
            Vous avez une question, une suggestion ou vous souhaitez simplement échanger avec nous ? N'hésitez pas à nous écrire.
        </p>

        <a href="mailto:contact@lavillelente.fr" class="inline-flex items-center gap-3 px-8 py-4 bg-[#2C3E50] text-white rounded-xl font-bold hover:bg-[#34495E] hover:scale-105 transition-all shadow-lg group">
            <span class="text-xl">📧</span>
            <span>contact@lavillelente.fr</span>
        </a>

        <div class="mt-8 pt-6 border-t border-stone-100">
             <NuxtLink to="/" class="text-stone-400 hover:text-[#2C3E50] text-sm font-medium transition-colors">
                ← Retour à l'accueil
             </NuxtLink>
        </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Contact - La Ville Lente',
  meta: [
    { name: 'description', content: 'Contactez l\'équipe de La Ville Lente.' }
  ]
})
</script>
