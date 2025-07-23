<template>
  <div class="home-container">
    <div class="left-panel">
      <UserStats
        :user="currentUser"
        :postsCount="userStats.postsCount"
        :followingCount="userStats.followingCount"
        :followersCount="userStats.followersCount"
      />
    </div>
    
    <div class="center-panel">
      <!-- Toggle buttons only if logged in -->
      <div v-if="currentUser" class="feed-toggle">
        <button
          :class="{ active: showPersonalFeed }"
          @click="setFeed('personal')"
        >
          Personal Feed
        </button>
        <button
          :class="{ active: !showPersonalFeed }"
          @click="setFeed('global')"
        >
          Global Feed
        </button>
      </div>

      <!-- Pass isPersonalFeed so PostFeed knows which feed it is -->
      <PostFeed :posts="feedPosts" :isPersonalFeed="showPersonalFeed" />
      <PostInput v-if="currentUser" @new-post="addPost" />
    </div>
    
    <div class="right-panel">
      <SuggestedFollowers
        :suggestions="suggestedFollowers"
        :canFollow="!!currentUser"
        @follow="handleFollow"
        @unfollow="handleUnfollow"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from '../stores/store.js'
import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

import { fetchUserById } from '../services/userService.js'
import { followUser, unfollowUser } from '../services/followService.js'
import { watchFeedPosts } from '../services/feedService.js'
import { fetchFeedPosts } from '../services/feedService.js'
import { createPost } from '../services/postService.js'
import { fetchSuggestedUsers } from '../services/followService.js'
import { firestore } from '../firebaseResources.js'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

const currentUser = ref(null)
const userStats = ref({ postsCount: 0, followingCount: 0, followersCount: 0 })
const feedPosts = ref([])
const suggestedFollowers = ref([])
const showPersonalFeed = ref(true)
let unsubscribeFeed = null

async function loadCurrentUser() {
  const uid = store.currentUser?.uid
  if (!uid) return

  const userData = await fetchUserById(uid)
  currentUser.value = userData

  userStats.value = {
    postsCount: userData.posts?.length || 0,
    followingCount: userData.following?.length || 0,
    followersCount: userData.followers?.length || 0
  }
}

// Enrich posts with author usernames
async function enrichPostsWithUsernames(posts) {
  const uniqueAuthorIds = [...new Set(posts.map(post => post.authorId))]
  const userDocs = await Promise.all(
    uniqueAuthorIds.map(uid => getDoc(doc(firestore, 'users', uid)))
  )
  const uidToUsername = {}
  userDocs.forEach(docSnap => {
    if (docSnap.exists()) {
      uidToUsername[docSnap.id] = docSnap.data().username || 'Unknown'
    }
  })

  return posts.map(post => ({
    ...post,
    authorUsername: uidToUsername[post.authorId] || 'Unknown',
    originalPostId: post.originalPostId || null,
    highlightedQuote: post.highlightedQuote || null,
    repostComment: post.repostComment || null,
    isRepost: !!post.originalPostId
  }))
}

// Enrich reposts by fetching original post data
async function enrichRepostsWithOriginalContent(posts) {
  const reposts = posts.filter(post => post.originalPostId)
  if (reposts.length === 0) return posts

  const originalPostIds = reposts.map(post => post.originalPostId)
  const originalPostDocs = await Promise.all(
    originalPostIds.map(id => getDoc(doc(firestore, 'posts', id)))
  )

  const originalPostsMap = {}
  for (const docSnap of originalPostDocs) {
    if (docSnap.exists()) {
      originalPostsMap[docSnap.id] = docSnap.data()
    }
  }

  return posts.map(post => {
    if (post.originalPostId && originalPostsMap[post.originalPostId]) {
      const original = originalPostsMap[post.originalPostId]
      return {
        ...post,
        originalPostContent: original.content,
        originalPostAuthorId: original.authorId,
        originalPostTimestamp: original.timestamp
      }
    }
    return post
  })
}

async function loadFeedPosts() {
  if (unsubscribeFeed) {
    unsubscribeFeed()
    unsubscribeFeed = null
  }

  if (!currentUser.value) {
    // No user → global feed
    let posts = await fetchFeedPosts(null)
    posts = await enrichPostsWithUsernames(posts)
    posts = await enrichRepostsWithOriginalContent(posts)
    feedPosts.value = posts
  } else if (showPersonalFeed.value) {
    // Personal feed (realtime)
    const following = currentUser.value.following || []
    const authorIds = following.slice(0, 10)

    unsubscribeFeed = watchFeedPosts(authorIds, async (posts) => {
      let enriched = await enrichPostsWithUsernames(posts)
      enriched = await enrichRepostsWithOriginalContent(enriched)
      feedPosts.value = enriched
    })
  } else {
    // Global feed (logged-in, static)
    let posts = await fetchFeedPosts(null)
    posts = await enrichPostsWithUsernames(posts)
    posts = await enrichRepostsWithOriginalContent(posts)
    feedPosts.value = posts
  }
}

async function loadSuggestions() {
  if (currentUser.value) {
    suggestedFollowers.value = await fetchSuggestedUsers(
      currentUser.value.uid,
      currentUser.value.following || []
    )
  } else {
    suggestedFollowers.value = await fetchSuggestedUsers()
  }
}

async function refreshUserStats() {
  const uid = currentUser.value?.uid
  if (!uid) return
  const userData = await fetchUserById(uid)
  currentUser.value = userData

  userStats.value = {
    postsCount: userData.posts?.length || 0,
    followingCount: userData.following?.length || 0,
    followersCount: userData.followers?.length || 0
  }
}

async function handleFollow(targetUser) {
  await followUser(currentUser.value.uid, targetUser.uid)

  const snap = await getDoc(doc(firestore, 'users', targetUser.uid))
  const targetPosts = snap.data().posts || []

  if (targetPosts.length > 0) {
    await updateDoc(doc(firestore, 'users', currentUser.value.uid), {
      feed: arrayUnion(...targetPosts)
    })
  }

  await refreshUserStats()
  await loadFeedPosts()
  await loadSuggestions()
}

async function handleUnfollow(targetUser) {
  await unfollowUser(currentUser.value.uid, targetUser.uid)

  await refreshUserStats()
  await loadFeedPosts()
  await loadSuggestions()
}

async function addPost(content) {
  try {
    const username = currentUser.value.username || 'Unknown'
    await createPost(currentUser.value.uid, content, username)

    userStats.value.postsCount++
    await refreshUserStats()

    if (!showPersonalFeed.value) {
      const posts = await fetchFeedPosts(null)
      feedPosts.value = posts
    }
  } catch (err) {
    console.error('Failed to create post:', err)
    alert('Failed to create post: ' + err.message)
  }
}

function setFeed(feedType) {
  showPersonalFeed.value = feedType === 'personal'
  loadFeedPosts()
}

onMounted(async () => {
  await loadCurrentUser()
  await loadSuggestions()
  await loadFeedPosts()
})

onUnmounted(() => {
  if (unsubscribeFeed) unsubscribeFeed()
})
</script>

<style scoped>
.home-container {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.left-panel, .right-panel {
  flex: 1;
  max-width: 250px;
}

.center-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feed-toggle {
  display: flex;
  width: 100%;
  margin-bottom: 0rem;
}

.feed-toggle button {
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

.feed-toggle button.active {
  background-color: rgba(189, 240, 245, 0.672);
  color: white;
  cursor: default;
}
</style>