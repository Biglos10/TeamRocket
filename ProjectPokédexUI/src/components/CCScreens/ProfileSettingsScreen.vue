<template>
  <div class="screen">
    <div class="scroll-content">

      <!-- Header -->
      <h1 class="title">Profile</h1>
      <div class="divider"></div>

      <!-- Two-column section -->
      <div class="columns">

        <!-- Left: avatar -->
        <div class="left-col">
          <div class="avatar-circle">
            <span class="avatar-plus">+</span>
          </div>
        </div>

        <!-- Right: bullet list -->
        <div class="right-col">

          <!-- Username (non-editable, no edit button) -->
          <div class="field-row">
            <span class="bullet">•</span>
            <span class="field-text muted">{{ username }}</span>
          </div>

          <!-- Editable fields -->
          <div class="field-row" v-for="f in fields" :key="f.key">
            <span class="bullet">•</span>

            <template v-if="f.editing">
              <input
                class="inline-input"
                :type="f.inputType"
                v-model="f.draft"
                :placeholder="f.value || '—'"
                @keydown.enter="save(f, $event)"
                @blur="save(f, $event)"
                :ref="el => { if (el) el.focus() }"
              />
            </template>
            <template v-else>
              <span class="field-text">{{ f.value || '—' }}</span>
            </template>

            <!-- Polygon edit button -->
            <svg
              v-if="!f.editing"
              class="edit-btn"
              :class="{ pressed: f.pressed }"
              width="13" height="11"
              viewBox="0 0 13 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click="startEdit(f)"
              @pointerdown="f.pressed = true"
              @pointerup="f.pressed = false"
              @pointerleave="f.pressed = false"
            >
              <!-- Tag/arrow polygon -->
              <polygon
                points="0,0 9,0 13,5.5 9,11 0,11"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                stroke-width="1"
              />
              <!-- Pencil line -->
              <line x1="3" y1="3.5" x2="8" y2="3.5" stroke="rgba(255,255,255,0.55)" stroke-width="1" stroke-linecap="round"/>
              <line x1="3" y1="5.5" x2="7" y2="5.5" stroke="rgba(255,255,255,0.55)" stroke-width="1" stroke-linecap="round"/>
              <line x1="3" y1="7.5" x2="6" y2="7.5" stroke="rgba(255,255,255,0.55)" stroke-width="1" stroke-linecap="round"/>
            </svg>
          </div>

        </div>
      </div>

      <!-- Description -->
      <h2 class="subtitle">Description</h2>
      <div class="divider"></div>
      <div class="bio-wrapper">
        <textarea
          class="bio-input"
          v-model="bio"
          placeholder="Enter a bio..."
          @focus="bioFocused = true"
          @blur="onBioBlur"
        ></textarea>
        <div class="send-wrapper" :class="{ visible: bioFocused }">
          <svg
            class="send-btn"
            :class="{ pressed: sendPressed }"
            width="18" height="14"
            viewBox="0 0 18 14"
            xmlns="http://www.w3.org/2000/svg"
            @pointerdown="sendPressed = true"
            @pointerup="sendPressed = false"
            @pointerleave="sendPressed = false"
            @click="submitBio"
          >
            <polygon points="0,0 18,7 0,14 4,7" fill="white"/>
          </svg>
        </div>
      </div>

      <!-- Security -->
      <h2 class="subtitle">Security</h2>
      <div class="divider"></div>
      <button
        class="btn"
        :class="{ pressed: changePassPressed }"
        @pointerdown="changePassPressed = true"
        @pointerup="changePassPressed = false"
        @pointerleave="changePassPressed = false"
      >
        Change Password
      </button>

    </div>
  </div>
</template>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  background-color: #084236;
  overflow-y: auto;
  box-sizing: border-box;
}

.screen::-webkit-scrollbar { display: none; }
.screen { scrollbar-width: none; }

.scroll-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 12px 16px;
  gap: 6px;
  box-sizing: border-box;
  min-height: 100%;
}

/* ── Title ── */
.title {
  font-family: 'Jaro', sans-serif;
  font-size: 22px;
  font-weight: 400;
  color: #ffffff;
  margin: 0;
  letter-spacing: 1px;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.4);
  margin-bottom: 4px;
}

/* ── Two columns ── */
.columns {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.left-col {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.avatar-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 1.5px dashed rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-plus {
  font-family: 'Jura', sans-serif;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1;
  user-select: none;
}

/* ── Right column ── */
.right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.bullet {
  font-family: 'Jura', sans-serif;
  font-size: 10px;
  color: #ffffff;
  flex-shrink: 0;
  line-height: 1;
}

.field-text {
  font-family: 'Jura', sans-serif;
  font-size: 9px;
  color: #ffffff;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-text.muted {
  color: rgba(255, 255, 255, 0.45);
}

.inline-input {
  flex: 1;
  min-width: 0;
  height: 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  font-family: 'Jura', sans-serif;
  font-size: 9px;
  color: #ffffff;
  padding: 0 2px;
  box-sizing: border-box;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  caret-color: #ffffff;
}

.inline-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* ── Edit polygon button ── */
.edit-btn {
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: filter 0.08s ease, transform 0.08s ease;
  margin-left: auto;
}

.edit-btn.pressed {
  filter: brightness(0.5);
  transform: scale(0.9);
}

/* ── Subtitles ── */
.subtitle {
  font-family: 'Iceland', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
  margin: 4px 0 0;
  letter-spacing: 0.5px;
}

/* ── Bio wrapper ── */
.bio-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  width: 100%;
}

/* ── Bio textarea ── */
.bio-input {
  width: 100%;
  height: 52px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  font-family: 'Jura', sans-serif;
  font-size: 9px;
  color: #ffffff;
  padding: 4px 6px;
  box-sizing: border-box;
  outline: none;
  resize: none;
  -webkit-tap-highlight-color: transparent;
  caret-color: #ffffff;
  line-height: 1.4;
}

.bio-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

/* ── Send button wrapper (animates height + opacity) ── */
.send-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.25s ease, opacity 0.2s ease;
}

.send-wrapper.visible {
  max-height: 22px;
  opacity: 1;
}

/* ── Send (paper airplane) button ── */
.send-btn {
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: filter 0.08s ease, transform 0.08s ease;
}

.send-btn.pressed {
  filter: brightness(0.5);
  transform: scale(0.9);
}

/* ── Change password button ── */
.btn {
  width: fit-content;
  padding: 3px 12px;
  background: transparent;
  border: 1.5px solid #ffffff;
  border-radius: 3px;
  font-family: 'Jura', sans-serif;
  font-size: 11px;
  color: #ffffff;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition: filter 0.08s ease, transform 0.08s ease;
}

.btn.pressed {
  filter: brightness(0.6);
  transform: scale(0.96);
}
</style>

<script setup>
import { ref, reactive } from 'vue'

const username = ref('trainer_red')

const fields = reactive([
  { key: 'name',  inputType: 'text',  value: 'Red',                   draft: '', editing: false, pressed: false },
  { key: 'phone', inputType: 'tel',   value: 'phone',          draft: '', editing: false, pressed: false },
  { key: 'email', inputType: 'email', value: 'email',   draft: '', editing: false, pressed: false },
])

function startEdit(field) {
  field.draft = field.value
  field.editing = true
}

function save(field, event) {
  const trimmed = field.draft.trim()
  if (trimmed) field.value = trimmed
  field.editing = false
}

const bio = ref('')
const bioFocused = ref(false)
const sendPressed = ref(false)
let bioBlurTimer = null

function onBioBlur() {
  bioBlurTimer = setTimeout(() => { bioFocused.value = false }, 150)
}

function submitBio() {
  clearTimeout(bioBlurTimer)
  bioFocused.value = false
}

const changePassPressed = ref(false)
</script>
