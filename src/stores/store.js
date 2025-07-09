import { reactive } from 'vue'

export const store = reactive({
  currentUser: null, // e.g. { id: 1, username: 'user1' }

  users: [
    { email: 'hello@gmail.com', password: 'd123', id: 10, username: 'hello@gmail.com' },
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' },
    { id: 3, username: 'carol' },
    { id: 4, username: 'rebecca' },
    { id: 5, username: 'user5' },
    { id: 6, username: 'user6' }
  ],

  userPosts: {
    'alice': [
    {
      id: 201,
      userId: 'alice',
      content: 'Alice post!',
      timestamp: new Date()
    }
  ],
  'bob': [
    {
      id: 202,
      author: 'bob',
      content: 'Bob post!',
      timestamp: new Date()
    }
  ],
  'rebecca': [
    {
      id: 203,
      author: 'rebecca',
      content: 'Hello from Seoul!',
      timestamp: new Date('2025-09-07T12:30:00')
    },
    {
      id: 204,
      author: 'rebecca',
      content: 'Next stop: Nara!',
      timestamp: new Date('2025-12-07T12:30:00')
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
    'alice': [2],      // alice follows bob
    'bob': [1],      // bob follows alice
    'carol': [1]        // carol follows bob
  },
  followers: {
    'alice': [2],      // alice is followed by bob
    'bob': [1, 3],   // bob is followed by alice and carol
    'carol': [2]       // carol is followed by bob
  },
  globalPosts: [
  {
    id: 101,
    author: 'guestUser1',
    content: 'This is a global guest post',
    timestamp: new Date('2023-07-01T12:30:00')
  },
  {
    id: 102,
    author: 'guestUser2',
    content: 'Another global post for the feed',
    timestamp: new Date('2023-07-01T12:30:01')
  },
  {
    id: 101,
    author: 'guestUser1',
    content: 'Man, I am still here.',
    timestamp: new Date('2023-07-01T12:30:02')
  },
  {
    id: 101,
    author: 'guestUser1',
    content: 'It\'s kind of lonely like this',
    timestamp: new Date('2023-07-01T12:30:03')
  },
  {
    id: 102,
    author: 'guestUser2',
    content: 'What am I? chopped liver?',
    timestamp: new Date('2023-07-01T12:30:04')
  },
  {
    id: 102,
    author: 'guestUser2',
    content: 'Good luck finding someone else here. I\'m done.',
    timestamp: new Date('2023-07-01T12:30:05')
  },
  {
    id: 101,
    author: 'guestUser1',
    content: 'wait nooooooooooo',
    timestamp: new Date('2023-07-01T12:30:06')
  },
  {
    id: 101,
    author: 'guestUser1',
    content: 'This is embarrassing.',
    timestamp: new Date('2023-07-01T12:30:07')
  },
  {
    id: 101,
    author: 'guestUser1',
    content: 'You never know something until you\'ve lost it.',
    timestamp: new Date('2023-07-01T12:30:08')
  },
  {
    id: 101,
    author: 'guestUser1',
    content: 'it\'s going to be alright, it\'s going to be alright',
    timestamp: new Date('2023-07-01T12:30:09')
  },
  {
    id: 101,
    author: 'guestUser1',
    content: 'hahahahahahahahahahhahaha, you know what, I\'m the last one standing. King of the world!',
    timestamp: new Date('2023-07-01T12:30:10')
  },
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
export function addPost(content) {
  const username = store.currentUser?.username
  if (!username) return

  const newPost = { id: Date.now(), author: username, content, timestamp: new Date() }

  if (!store.userPosts[username]) store.userPosts[username] = []
  store.userPosts[username].unshift(newPost)

  updateAllPosts()
}
