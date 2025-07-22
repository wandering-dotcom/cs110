<template>
  <div class="annotate-box">
    <h3>Annotate Post</h3>

    <p
      class="post-content"
      ref="textRef"
      @mouseup="handleHighlight"
    >
      {{ content }}
    </p>

    <div v-if="highlightedText" class="highlighted-preview">
      <strong>Selected:</strong> "{{ highlightedText }}"
    </div>

    <textarea
      v-model="annotation"
      placeholder="Add a comment or forever hold your peace."
    ></textarea>

    <button :disabled="!highlightedText" @click="emitAnnotation">
      Add Annotation
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['annotate'])

const highlightedText = ref('')
const annotation = ref('')
const textRef = ref(null)

function handleHighlight() {
  const selection = window.getSelection()
  const selected = selection.toString().trim()

  if (!selected) return

  // Ensure selected text comes from this component
  const anchorNode = selection.anchorNode
  if (textRef.value && textRef.value.contains(anchorNode)) {
    highlightedText.value = selected
  }
}

function emitAnnotation() {
  emit('annotate', {
    quote: highlightedText.value,
    comment: annotation.value
  })

  // Optionally reset
  annotation.value = ''
  highlightedText.value = ''
}
</script>

<style scoped>
.annotate-box {
  padding: 1rem;
  background: rgb(144, 183, 186); /* match login form bg */
  border: 2px solid #ffffff;
  border-radius: 8px;
  margin-top: 1rem;
  color: #fffdfd;
}

.post-content {
  border: 2px solid #ffffff;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.85); /* lightly transparent white */
  cursor: text;
  user-select: text;
  border-radius: 6px;
  color: #222;
}

.highlighted-preview {
  margin-top: 0.5rem;
  font-style: italic;
  background: #a5e1e8;
  padding: 0.5rem;
  border-left: 3px solid #053136;
  border-radius: 4px;
  color: #333;
}

textarea {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #43525c;
  box-sizing: border-box;
  background: #f0fafa;
  color: #222;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background-color: #43525c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover:not(:disabled) {
  background-color: #43525c;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>