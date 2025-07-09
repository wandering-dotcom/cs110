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
import { ref, computed } from 'vue'
import { store } from '../stores/store.js'
import Logout from '../components/Logout.vue'

const emit = defineEmits(['auth-success'])

const creating = ref(false)
const loginInput = ref('')
const passwordInput = ref('')

const loginTouched = ref(false)
const passwordTouched = ref(false)

const loginEmpty = computed(() => loginInput.value.trim().length === 0)

const isEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(loginInput.value.trim())
})

const passwordEmpty = computed(() => passwordInput.value.length === 0)
const hasNumber = computed(() => /\d/.test(passwordInput.value))
const hasLetter = computed(() => /[a-zA-Z]/.test(passwordInput.value))
const passwordValid = computed(() => hasNumber.value && hasLetter.value)

const canSubmit = computed(() =>
  !loginEmpty.value && isEmail.value && !passwordEmpty.value && passwordValid.value
)

function submit() {
  if (!canSubmit.value) return

  const email = loginInput.value.trim()
  const password = passwordInput.value

  if (creating.value) {
    // Sign Up
    const existingUser = store.users.find(u => u.email === email)
    if (existingUser) {
      alert('Account already exists with that email.')
      return
    }

    const newUser = {
      email,
      password,
      username: email // generate a username from email
    }
    store.users.push(newUser)
    store.currentUser = newUser

    // Reset form, stay on login tab
    creating.value = false
    loginInput.value = ''
    passwordInput.value = ''
    loginTouched.value = false
    passwordTouched.value = false
  } else {
    // Log In
    const user = store.users.find(u => u.email === email && u.password === password)
    if (!user) {
      alert('Invalid email or password.')
      return
    }

    store.currentUser = user
    emit('auth-success', user)

    // Reset form
    loginInput.value = ''
    passwordInput.value = ''
    loginTouched.value = false
    passwordTouched.value = false
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