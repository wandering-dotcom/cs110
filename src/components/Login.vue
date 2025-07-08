<template>
  <div class="login-form">
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

    <label>Username:</label>
    <input type="text" v-model="loginInput" />
    <ul>
      <li style="color:red" v-if="loginEmpty">Enter a username</li>
      <li style="color:green" v-else>Username is valid</li>
    </ul>

    <label>Password:</label>
    <input type="password" v-model="passwordInput" />
    <ul>
      <li style="color:red" v-if="passwordEmpty">Enter a password</li>
      <template v-else-if="!passwordValid">
        <li style="color:red" v-if="!hasNumber">Must include at least one number</li>
        <li style="color:red" v-if="!hasLetter">Must include at least one letter</li>
      </template>
      <li style="color:green" v-else>Password is valid</li>
    </ul>

    <button :disabled="!canSubmit" @click="submit">
      {{ creating ? 'Create' : 'Log In' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['auth-success'])

const creating = ref(false)
const loginInput = ref('')
const passwordInput = ref('')

const loginEmpty = computed(() => loginInput.value.trim().length === 0)
const passwordEmpty = computed(() => passwordInput.value.length === 0)
const hasNumber = computed(() => /\d/.test(passwordInput.value))
const hasLetter = computed(() => /[a-zA-Z]/.test(passwordInput.value))
const passwordValid = computed(() => hasNumber.value && hasLetter.value)

const canSubmit = computed(() =>
  !loginEmpty.value && !passwordEmpty.value && passwordValid.value
)

function submit() {
  if (!canSubmit.value) return

  const user = {
    username: loginInput.value
  }

  loginInput.value = ''
  passwordInput.value = ''

  emit('auth-success', user)
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 3rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: sans-serif;
}

.mode-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mode-tabs button {
  flex: 1;
  padding: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  background: none;
  border: 2px solid #1c7198;
  border-bottom: none;
  color: #1c7198;
  border-radius: 5px 5px 0 0;
  transition: background-color 0.2s ease;
}

.mode-tabs button.active {
  background-color: #1c7198;
  color: white;
  cursor: default;
}

input {
  padding: 0.5rem;
  font-size: 1rem;
}

button {
  padding: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
