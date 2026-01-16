<template>
  <div>
    <nav class="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-stone-200">
      <div class="container mx-auto px-6 h-16 flex items-center justify-between">
        <h1 class="text-xl font-bold text-stone-800 tracking-tight">La Ville Lente</h1>
      </div>
    </nav>
    
    <main class="pt-16 min-h-screen bg-stone-50">
      <slot />
    </main>
  </div>
</template>
