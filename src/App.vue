<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseResources'
import { store } from './stores/store'
import { ref, onMounted } from 'vue'

const authReady = ref(false)

onMounted(() => {
  onAuthStateChanged(auth, user => {
    store.currentUser = user
    authReady.value = true
  })
})
</script>

<template>
  <div class="app-wrapper">
    <Navbar />
    <main class="page-content">
      <div v-if="authReady">
        <RouterView />
      </div>
      <div v-else>
        Loading...
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-wrapper {
  width: 100%;
  padding: 0 1rem;
  max-width: none; 
  margin: 0; 
}

.page-content {
  padding-top: 60px;
}
nav {
  width: 100%;
  font-size: 12px;
  text-align: left;
  margin-top: 0rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1200px) {
  .app-wrapper {
    max-width: 1200px;
    margin: 0 auto; 
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
