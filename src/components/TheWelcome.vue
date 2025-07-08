<template>
  <div>
    Login:
    <input type=login v-model="loginInput" />
    <br>
    <ul>
      <li style="color:red" v-if="isEmpty">Enter a username</li>
      <li style="color:green" v-else>Username is valid</li>
    </ul>
  </div>
  <div>
    Password:
    <input type=password v-model="passwordInput" />
    <br>
    <ul>
      <li style="color:red" v-if="isEmpty">Enter a password</li>
      <template v-else-if="!isValid">
        <li style="color:red" v-if="!hasNumber">Password must include at least one number</li>
        <li style="color:red" v-if="!hasLetter">Password must include at least one letter</li>
      </template>
      <li style="color:green" v-else>Password is valid</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginInput: '',
      passwordInput: ''
    }
  },
  computed: {
    isEmpty() {
      return this.passwordInput.length === 0;
    },
    hasNumber() {
      return /[0-9]/.test(this.passwordInput);
    },
    hasLetter() {
      return /[a-zA-Z]/.test(this.passwordInput);
    },
    isValid() {
      return this.hasNumber && this.hasLetter;
    }
  },
}
</script>
