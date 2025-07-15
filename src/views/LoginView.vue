<script setup>
import { onMounted, onUnmounted } from 'vue'
import Login from '../components/Login.vue'
import emitter from '../eventBus'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome(user) {
  console.log('User logged in:', user)
  router.push('/')
}

onMounted(() => {
  emitter.on('auth-success', goHome)
})

onUnmounted(() => {
  emitter.off('auth-success', goHome)
})
</script>

<template>
  <Login />
</template>
