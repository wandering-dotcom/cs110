<template>
  <div v-if="user">
    <div class="out">
      <p><strong>@{{ user.username || user.email }}</strong></p>
      <button class="logout-btn" @click="handleLogout">Log Out</button>
    </div>
  </div>
</template>

<script setup>
import { logout } from '../services/authService'
import emitter from '../eventBus'

const props = defineProps({
  user: Object
})

async function handleLogout() {
  try {
    await logout()
    emitter.emit('logout') // Fire event
  } catch (error) {
    alert('Logout failed: ' + error.message)
  }
}
</script>

<style scoped>
.out {
  border: 3px solid #ddd;
  background: rgba(189, 240, 245, 0.672);
  padding: 0.5rem;
  text-align: center;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #43525c;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 1.5rem;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>