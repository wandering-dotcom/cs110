import { reactive } from 'vue'

export const store = reactive({
  currentUser: null, // e.g. { id: 1, username: 'user1' }

  users: [
    { email: 'hello@gmail.com', password: 'd123', username: 'hello@gmail.com' },
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
    { id: 3, username: 'carol' },
    { id: 4, username: 'user4' },
    { id: 5, username: 'user5' },
    { id: 6, username: 'user6' }
  ],

  userPosts: {
    '1': [
    {
      id: 201,
      userId: 'alice',
      content: 'Alice post!',
      timestamp: new Date()
    }
  ],
  '2': [
    {
      id: 202,
      author: 'bob',
      content: 'Bob post!',
      timestamp: new Date()
    }
  ],
  'hello@gmail.com': [
    {
      id: 301,
      author: 'hello@gmail.com',
      content: 'Just signed up and saying hello!',
      timestamp: new Date()
    }
  ]
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
  globalPosts: [
  {
    id: 9991,
    author: 'guestUser1',
    content: 'This is a global guest post',
    timestamp: new Date()
  },
  {
    id: 9992,
    author: 'guestUser2',
    content: 'Another global post for the feed',
    timestamp: new Date()
  }
],
  allPosts: []
})

function updateAllPosts() {
  store.allPosts = Object.values(store.userPosts)
    .flat()
    .map(post => {
      const author = store.users.find(u => u.username === post.author || u.email === post.author)
      return {
        ...post,
        authorUsername: author ? author.username : post.author
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)
}

updateAllPosts()
