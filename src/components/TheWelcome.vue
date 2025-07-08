<template>
  <div>
    Counter Value: {{ count }}
    <br>
    <template v-if="isEven">The counter is even</template>
    <template v-else>The counter is odd</template>
    <br>
    <button @click="increment">Increment</button>
    <ul>
      <template v-for="n in count">
        <li>{{ n }}</li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
    }
  },
  computed: {
    isEven() {
      return this.count % 2 == 0
    }
  },
  methods: {
    increment() {
      this.count = this.count + 1;
    }
  }
}
</script>
