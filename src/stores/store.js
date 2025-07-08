import { reactive } from 'vue'

export const store = reactive({
  currentUser: null, // or { username: 'testuser' }

  allPosts: [
    {
      id: 1,
      author: 'user1',
      content: 'Welcome to the app!',
      timestamp: new Date()
    }
  ],

  users: [
    { username: 'user1' },
    { username: 'user2' },
    { username: 'user3' },
    { username: 'user4' },
    { username: 'user5' },
    { username: 'user6' }
  ],

  userPosts: {},
  following: {},
  followers: {}
})