<template>
  <div class="login-form">
    <Logout v-if="store.currentUser" :user="store.currentUser" />
    
    <div v-else>
      <!-- Tabs -->
      <div class="mode-tabs">
        <button 
          :class="{ active: !creating }" 
          @click="creating = false"
        >
          Login
        </button>
        <button 
          :class="{ active: creating }" 
          @click="creating = true"
        >
          Sign Up
        </button>
      </div>

      <!-- Email input -->
      <input 
        type="text" 
        v-model="loginInput" 
        placeholder="Email" 
        @input="loginTouched = true" 
      />
      <!-- Email validations -->
      <ul>
        <li style="color:red" v-if="loginEmpty && loginTouched">Enter an email</li>
        <li style="color:red" v-if="!loginEmpty && !isEmail && loginTouched">Enter a valid email</li>
        <li style="color:green" v-if="!loginEmpty && isEmail && loginTouched">Email looks good</li>
      </ul>

      <!-- Password input -->
      <input 
        type="password" 
        v-model="passwordInput" 
        placeholder="Password" 
        @input="passwordTouched = true" 
      />
      <!-- Password validations -->
      <ul>
        <li style="color:red" v-if="passwordEmpty && passwordTouched">Enter a password</li>
        <template v-else-if="passwordTouched && !passwordValid">
          <li style="color:red" v-if="!hasNumber">Must include at least one number</li>
          <li style="color:red" v-if="!hasLetter">Must include at least one letter</li>
        </template>
        <li style="color:green" v-if="passwordValid && passwordTouched">Password is valid</li>
      </ul>

      <!-- Submit button -->
      <button :disabled="!canSubmit" @click="submit">
        {{ creating ? 'Create' : 'Log In' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { store } from '../stores/store.js'
import Logout from '../components/Logout.vue'
import emitter from '../eventBus'
import { login, register } from '../services/authService'

const creating = ref(false)
const loginInput = ref('')
const passwordInput = ref('')

const loginTouched = ref(false)
const passwordTouched = ref(false)

const loginEmpty = computed(() => loginInput.value.trim().length === 0)
const isEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput.value.trim()))
const passwordEmpty = computed(() => passwordInput.value.length === 0)
const hasNumber = computed(() => /\d/.test(passwordInput.value))
const hasLetter = computed(() => /[a-zA-Z]/.test(passwordInput.value))
const passwordValid = computed(() => hasNumber.value && hasLetter.value)
const canSubmit = computed(() => !loginEmpty.value && isEmail.value && !passwordEmpty.value && passwordValid.value)

watch(creating, () => {
  loginInput.value = ''
  passwordInput.value = ''
  loginTouched.value = false
  passwordTouched.value = false
})

function extractUsernameFromEmail(email) {
  return email.split('@')[0]
}

async function submit() {
  if (!canSubmit.value) return

  const email = loginInput.value.trim()
  const password = passwordInput.value
  let user

  try {
    if (creating.value) {
      // Firebase register
      user = await register(email, password)

      // Add to local mock store
      const newStoreUser = {
        id: Date.now(),
        email,
        password,
        username: extractUsernameFromEmail(email)
      }

      store.users.push(newStoreUser)
      store.userPosts[newStoreUser.username] = []
      store.following[newStoreUser.username] = []
      store.followers[newStoreUser.username] = []

      store.currentUser = {
        ...user,
        username: newStoreUser.username
      }
    } else {
      // Firebase login
      user = await login(email, password)

      // Match with local store
      const matchedUser = store.users.find(u => u.email === user.email)

      if (!matchedUser) {
        alert('User not found in store. Try signing up first.')
        return
      }

      store.currentUser = {
        ...user,
        username: matchedUser.username
      }
    }

    emitter.emit('auth-success', store.currentUser)

    loginInput.value = ''
    passwordInput.value = ''
    loginTouched.value = false
    passwordTouched.value = false
  } catch (error) {
    alert(error.message)
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 5rem auto; /* center vertically and horizontally */
  display: flex;
  flex-direction: column;
  align-items: stretch; /* ensure children stretch */
  gap: 1rem;
  font-family: sans-serif;
  padding: 2rem;
  border: 2px solid #43525c;
  border-radius: 8px;
  background-color: rgba(189, 240, 245, 0.672);
}

.mode-tabs {
  display: flex;
  width: 100%;
  gap: 0;
  margin-bottom: 1rem;
}

.mode-tabs button {
  flex: 1;
  padding: 0.75rem;
  font-size: 1.1rem;
  cursor: pointer;
  background: none;
  border: 2px solid rgba(189, 240, 245, 0.672);
  border-bottom: none;
  color: rgba(189, 240, 245, 0.672);
  border-radius: 5px 5px 0 0;
  transition: background-color 0.2s ease;
}

.mode-tabs button.active {
  background-color: rgba(189, 240, 245, 0.672);
  color: white;
  cursor: default;
}

input {
  padding: 0.75rem;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.75rem;
  font-size: 1rem;
  width: 100%;
  cursor: pointer;
  border: none;
  background-color: rgba(189, 240, 245, 0.672);
  color: #333;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

button:hover:not(:disabled) {
  background-color: #a5e1e8;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

ul {
  padding-left: 1rem;
  margin: 0;
}
</style>