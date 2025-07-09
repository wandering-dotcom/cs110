<template>
  <div class="post-feed">
    <h2>Posts</h2>
    <div v-if="posts.length === 0">
      <p>No posts yet.</p>
    </div>
    <div v-else>
      <PostItem v-for="post in postsToShow" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup>
import PostItem from '../components/PostItem.vue'
const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  }
})

const postsToShow = props.posts.slice(0, 10)
</script>

<style scoped>
.post-feed {
    border: 3px solid #ddd;
    background: rgba(189, 240, 245, 0.672);
    margin-bottom: 1rem;
    padding: 0.5rem;
}
h2 {
  margin-bottom: 0rem;
}
</style>