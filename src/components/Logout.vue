<template>
    <div v-if="user">
        <div class="out">
            <p><strong>@{{ user.username }}</strong></p>
            <button class="logout-btn" @click="logout">Log Out</button>
        </div>
    </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  user: Object
})

function logout() {
  store.currentUser = null
  router.push('/login')
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