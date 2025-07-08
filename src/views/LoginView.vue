<script setup>
import { useRouter } from 'vue-router'
import Login from '../components/Login.vue'

const router = useRouter()

function goHome(user) {
  console.log('User logged in:', user) // Optional mock user data
  router.push('/') // Go to home on success
}
</script>

<template>
  <Login @auth-success="goHome" />
</template>
