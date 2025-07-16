<script setup>
import { onMounted, onUnmounted } from 'vue'
import Login from '../components/Login.vue'
import emitter from '../eventBus'
import { useRouter } from 'vue-router'
import { store } from '../stores/store.js'

const router = useRouter()

function goHome(user) {
  console.log('Redirecting to home. Authenticated user:', user)
  console.log('Current user in store:', store.currentUser)
  router.push('/')
}

function handleLogout() {
  console.log('Logout event received')
  store.currentUser = null
  router.push('/login') 
}

onMounted(() => {
  emitter.on('auth-success', goHome)
  emitter.on('logout', handleLogout)
})

onUnmounted(() => {
  emitter.off('auth-success', goHome)
  emitter.off('logout', handleLogout)
})
</script>

<template>
  <Login />
</template>
