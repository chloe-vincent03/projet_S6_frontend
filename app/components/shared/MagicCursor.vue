<template>
  <canvas 
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-[9999]"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animationFrameId = null
let particles = []
let width = 0
let height = 0

// Configuration
const particleColor = '59, 130, 246' // Blue-500 RGB (Thème)
const particleLife = 60 // Frames (approx 1s at 60fps)

class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.size = Math.random() * 3 + 1 // Size between 1 and 4
    this.life = particleLife
    this.vx = (Math.random() - 0.5) * 1 // Random slight drift X
    this.vy = (Math.random() - 0.5) * 1 // Random slight drift Y
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.life--
    this.size *= 0.95 // Shrink
  }

  draw(context) {
    const opacity = this.life / particleLife
    context.fillStyle = `rgba(${particleColor}, ${opacity})`
    context.beginPath()
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    context.fill()
  }
}

const resize = () => {
  if (canvasRef.value) {
    width = window.innerWidth
    height = window.innerHeight
    canvasRef.value.width = width
    canvasRef.value.height = height
  }
}

const addParticle = (e) => {
  // Add a few particles per event for density
  for (let i = 0; i < 2; i++) {
    particles.push(new Particle(e.clientX, e.clientY))
  }
}

const burst = (e) => {
  // Explosion of particles on click
  for (let i = 0; i < 12; i++) {
    const p = new Particle(e.clientX, e.clientY)
    // Overwrite velocity for explosion effect
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 2
    p.vx = Math.cos(angle) * speed
    p.vy = Math.sin(angle) * speed
    p.life = particleLife * 1.5 // Last longer
    particles.push(p)
  }
}

const animate = () => {
  if (!ctx) return
  
  ctx.clearRect(0, 0, width, height)

  for (let i = 0; i < particles.length; i++) {
    particles[i].update()
    particles[i].draw(ctx)
    
    // Remove dead particles
    if (particles[i].life <= 0) {
      particles.splice(i, 1)
      i--
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', addParticle)
    window.addEventListener('mousedown', burst) // Add burst on click/touch
    animate()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', addParticle)
  window.removeEventListener('mousedown', burst)
  cancelAnimationFrame(animationFrameId)
})
</script>
