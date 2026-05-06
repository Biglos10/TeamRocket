<template>
  <div class="screen">
    <div class="header">
      <span class="prompt-label">QUERY</span>
      <span class="query-text">{{ lastQuery }}</span>
    </div>
    <div class="divider" />
    <div class="body">
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-else class="response">
        {{ lastResponse }}<span v-if="isLoading" class="cursor">▮</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRotom } from '../../composables/useRotom'

const { lastQuery, lastResponse, isLoading, errorMessage } = useRotom()
</script>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  background-color: #084236;
  color: #E3F4EE;
  font-family: 'Jura', sans-serif;
  padding: 10px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-shrink: 0;
}

.prompt-label {
  font-family: 'Iceland', sans-serif;
  font-size: 13px;
  letter-spacing: 1px;
  color: #7FD9C2;
}

.query-text {
  font-size: 12px;
  color: #E3F4EE;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  height: 1px;
  background-color: rgba(127, 217, 194, 0.4);
  margin: 6px 0 8px;
  flex-shrink: 0;
}

.body {
  flex: 1;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.45;
}

.response {
  white-space: pre-wrap;
  word-break: break-word;
}

.error {
  color: #FF8A82;
  font-size: 12px;
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  animation: blink 1s steps(1) infinite;
  color: #7FD9C2;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
