<template>
  <div class="bottom-display">
    <svg class="bg" viewBox="-2 -2 104 104" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,0 50,0 63,17 72,17 100,17 100,100 0,100" fill="#3B4147" stroke="black" stroke-width="3" vector-effect="non-scaling-stroke"/>
    </svg>
    <div class="content">
      <svg class="hinge-dot" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5166 1C8.05411 1.00002 10.033 2.95464 10.0332 5.27148C10.0332 7.5885 8.05425 9.54393 5.5166 9.54395C2.97893 9.54395 1 7.58851 1 5.27148C1.00023 2.95463 2.97908 1 5.5166 1Z" fill="#961C17" stroke="black" stroke-width="2"/>
      </svg>
      <div class="app-label">Pokédex</div>
      <div class="lcd-display">
        <textarea
          class="rotom-input"
          :class="{ focused: isFocused }"
          placeholder="Ask Rotom..."
          @focus="isFocused = true"
          @blur="isFocused = false"
        />
      </div>
      <div class="rotom-button"><RotomButton/></div>
    </div>
  </div>
</template>

<style scoped>
.bottom-display {
  height: 160px;
  flex-shrink: 0;
  margin: 0px 20px 15px 20px;
  position: relative;
}

.bg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.app-label {
  position: absolute;
  top: 7px;
  left: 35px;
  width: 35%;
  height: 12%;
  background-color: #084236;
  border: 2.5px solid black;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: left;
  padding-left: 8px;
  font-family: 'Iceland', sans-serif;
  font-size: 20px;
  color: #E3F4EE;
}

.lcd-display {
  position: absolute;
  top: 33px;
  left: 13px;
  width: 85%;
  height: 70%;
  background-color: #101F13;
  border: 2.5px solid black;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 6px;
  box-sizing: border-box;
}

.hinge-dot {
  position: absolute;
  top: 10px;
  left: 18px;
}

.rotom-button {
  position: absolute;
  right: -20px;
  top: -12px;
}

.rotom-input {
  width: 100%;
  height: 16px;
  background: #101F13;
  border: 1.5px, solid #A2A3B1;
  border-radius: 2.5px;
  resize: none;
  overflow: hidden;
  font-family: 'Jura', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: #FFFFFF;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: height 0.25s ease;
  box-sizing: border-box;
  padding: 1px 4px;
}

.rotom-input::placeholder {
  color: rgba(214, 244, 255, 0.51);
}

.rotom-input.focused {
  height: 78px;
  overflow: auto;
}
</style>

<script setup>
import { ref } from 'vue'
import RotomButton from './buttons/RotomButton.vue'

const isFocused = ref(false)
</script>
