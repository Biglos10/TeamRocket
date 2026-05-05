<template>
  <div class="library-content">

    <!----LIBRARY MODE ---->
    <template v-if="mode === 'library'">
      <div class="card-grid">
        <div
          v-for="card in displayedCards"
          :key="card.id"
          class="card-item"
          :class="card.tag ?? 'undiscovered'"
        >
          <!-- Undiscovered: silhouette + question mark -->
          <template v-if="card.tag === null">
            <div class="card-silhouette">
              <span class="question-mark">?</span>
            </div>
          </template>

          <!-- Known or unowned: show image -->
          <template v-else>
            <img :src="card.image" :alt="card.name" class="card-img" draggable="false" />
          </template>
        </div>
      </div>
    </template>

    <!----SCANS MODE---->
    <template v-else>
      <div class="scan-grid">
        <div
          v-for="scan in displayedScans"
          :key="scan.id"
          class="scan-item"
          :class="scan.tag"
        >
          <img :src="scan.image" :alt="scan.name" class="scan-img" draggable="false" />
          <span class="scan-label">{{ scan.name }}</span>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLibraryStore } from '../composables/useLibraryStore.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'library',   // 'library' | 'scans'
  },
  activeFilter: {
    type: String,
    default: null,        // 'owned' | 'unowned' | null
  },
})

const { filteredCards, filteredScans } = useLibraryStore()

const displayedCards = computed(() => filteredCards(props.activeFilter))
const displayedScans = computed(() => filteredScans(props.activeFilter))
</script>

<style scoped>
/* ── Scroll container ──────────────────────────────────────────────────── */
.library-content {
  position: absolute;
  top: 132px;         /* clear panel bar (86px) + filter buttons (33px) + gap */
  bottom: 108px;      /* clear the bottom bar */
  left: 0;
  right: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 10px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  /* subtle scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #2FABD0 transparent;
}
.library-content::-webkit-scrollbar { width: 4px; }
.library-content::-webkit-scrollbar-thumb { background: #2FABD0; border-radius: 2px; }

/* ── Card grid ─────────────────────────────────────────────────────────── */
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
}

.card-item {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 5 / 7;   /* standard TCG card ratio */
  position: relative;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
  transition: filter 0.2s ease;
}

/* Owned - normal */
.card-item.owned .card-img {
  filter: none;
}

/* Unowned - greyed out and dimmed */
.card-item.unowned .card-img {
  filter: grayscale(1);
}

/* Undiscovered - black silhouette card shape with yellow ? */
.card-silhouette {
  width: 100%;
  height: 100%;
  background: #0a0a0a;
  border-radius: 8px;
  border: 2px solid #222;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-mark {
  font-family: 'Jura', sans-serif;
  font-size: 52px;
  color: #FFD624;
  -webkit-text-stroke: 2px #333;
  user-select: none;
}

/*--- Scan grid ---*/
.scan-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
}

.scan-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 5 / 7;
}

.scan-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

/* Known scan — normal */
.scan-item.known {
  box-shadow: none;
}

/* Unknown scan — thin red border */
.scan-item.unknown {
  outline: 2px solid #e03030;
  outline-offset: -2px;
}

.scan-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.65);
  color: white;
  font-family: 'Jura', sans-serif;
  font-size: 14px;
  text-align: center;
  padding: 3px 0;
  pointer-events: none;
}
</style>
