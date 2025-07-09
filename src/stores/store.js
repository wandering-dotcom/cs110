import { reactive } from 'vue'

export const store = reactive({
  currentUser: null, // e.g. { id: 1, username: 'user1' }

  allPosts: [
    {
      id: 1,
      author: 1, // user id instead of username
      content: 'Welcome to the app!',
      timestamp: new Date()
    }
  ],

  users: [
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
    { id: 3, username: 'carol' },
    { id: 4, username: 'user4' },
    { id: 5, username: 'user5' },
    { id: 6, username: 'user6' }
  ],

  userPosts: {
    '1': [
      { id: 101, authorId: 1, content: 'Hello world', timestamp: new Date() }
    ],
    '2': [
      { id: 102, authorId: 2, content: 'Hi there!', timestamp: new Date() }
    ],
    '3': []
  },
  following: {
    '1': [2],      // alice follows bob
    '2': [1],      // bob follows alice
    '3': []        // carol follows no one
  },
  followers: {
    '1': [2],      // alice is followed by bob
    '2': [1, 3],   // bob is followed by alice and carol
    '3': [2]       // carol is followed by bob
  },

  allPosts: []
})

function updateAllPosts() {
  store.allPosts = Object.values(store.userPosts)
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)
}

updateAllPosts()