<template>
<header class="navbar">
    <div class="nav-container">
      <nav class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
  import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
header {
  background: rgba(189, 240, 245, 0.672);
  padding: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
nav {
  display: flex;
  align-items: center;
}
nav a {
  text-decoration: none;
  color: white;
  font-weight: bold;
  padding: 0 1rem;
}

nav a.router-link-exact-active {
  text-decoration: underline;
}
</style>
