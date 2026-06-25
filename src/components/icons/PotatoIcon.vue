<template>
  <div class="potato-icon" :class="sizeClass">
    <div class="potato-body">
      <div class="potato-blush potato-blush-left"></div>
      <div class="potato-blush potato-blush-right"></div>
      <div class="potato-eye potato-eye-left"></div>
      <div class="potato-eye potato-eye-right"></div>
      <div class="potato-mouth"></div>
      <div class="potato-shine"></div>
    </div>
    <div class="potato-sprout potato-sprout-1"></div>
    <div class="potato-sprout potato-sprout-2"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'md'
})

const sizeClass = computed(() => `potato-icon--${props.size}`)
</script>

<style scoped>
.potato-icon {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.potato-icon--sm {
  width: 20px;
  height: 22px;
}

.potato-icon--md {
  width: 28px;
  height: 30px;
}

.potato-icon--lg {
  width: 40px;
  height: 44px;
}

.potato-icon--xl {
  width: 56px;
  height: 60px;
}

.potato-body {
  position: relative;
  background: linear-gradient(135deg, #F5DEB3 0%, #DEB887 25%, #D2B48C 50%, #C4A574 75%, #B8860B 100%);
  border-radius: 50% 50% 45% 45% / 55% 55% 45% 45%;
  box-shadow: inset -3px -5px 10px rgba(139, 69, 19, 0.3), inset 3px 3px 8px rgba(255, 248, 220, 0.5);
}

.potato-icon--sm .potato-body {
  width: 18px;
  height: 16px;
}

.potato-icon--md .potato-body {
  width: 26px;
  height: 23px;
}

.potato-icon--lg .potato-body {
  width: 38px;
  height: 34px;
}

.potato-icon--xl .potato-body {
  width: 54px;
  height: 48px;
}

.potato-eye {
  position: absolute;
  background: #2d1810;
  border-radius: 50%;
  top: 30%;
}

.potato-icon--sm .potato-eye {
  width: 3px;
  height: 3px;
}

.potato-icon--md .potato-eye {
  width: 4px;
  height: 4px;
}

.potato-icon--lg .potato-eye {
  width: 6px;
  height: 6px;
}

.potato-icon--xl .potato-eye {
  width: 9px;
  height: 9px;
}

.potato-eye-left {
  left: 22%;
}

.potato-eye-right {
  right: 22%;
}

.potato-blush {
  position: absolute;
  background: rgba(255, 182, 193, 0.6);
  border-radius: 50%;
  top: 48%;
}

.potato-icon--sm .potato-blush {
  width: 3px;
  height: 2px;
}

.potato-icon--md .potato-blush {
  width: 5px;
  height: 3px;
}

.potato-icon--lg .potato-blush {
  width: 7px;
  height: 4px;
}

.potato-icon--xl .potato-blush {
  width: 10px;
  height: 6px;
}

.potato-blush-left {
  left: 12%;
}

.potato-blush-right {
  right: 12%;
}

.potato-mouth {
  position: absolute;
  width: 18%;
  height: 10%;
  border-bottom: 2px solid #2d1810;
  border-radius: 0 0 50% 50%;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
}

.potato-icon--sm .potato-mouth {
  border-width: 1px;
  width: 15%;
}

.potato-icon--xl .potato-mouth {
  border-width: 3px;
}

.potato-shine {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  top: 18%;
  right: 22%;
}

.potato-icon--sm .potato-shine {
  width: 3px;
  height: 2px;
}

.potato-icon--md .potato-shine {
  width: 5px;
  height: 3px;
}

.potato-icon--lg .potato-shine {
  width: 7px;
  height: 5px;
}

.potato-icon--xl .potato-shine {
  width: 10px;
  height: 7px;
}

.potato-sprout {
  position: absolute;
  background: linear-gradient(180deg, #90EE90 0%, #6B8E23 100%);
  border-radius: 50% 50% 0 0;
  top: 0;
}

.potato-icon--sm .potato-sprout-1 {
  width: 3px;
  height: 7px;
  left: 45%;
  transform: rotate(-10deg);
}

.potato-icon--sm .potato-sprout-2 {
  width: 2px;
  height: 5px;
  left: 58%;
  top: 2px;
  transform: rotate(15deg);
}

.potato-icon--md .potato-sprout-1 {
  width: 4px;
  height: 10px;
  left: 45%;
  transform: rotate(-10deg);
}

.potato-icon--md .potato-sprout-2 {
  width: 3px;
  height: 7px;
  left: 58%;
  top: 3px;
  transform: rotate(15deg);
}

.potato-icon--lg .potato-sprout-1 {
  width: 6px;
  height: 14px;
  left: 45%;
  transform: rotate(-10deg);
}

.potato-icon--lg .potato-sprout-2 {
  width: 4px;
  height: 10px;
  left: 58%;
  top: 4px;
  transform: rotate(15deg);
}

.potato-icon--xl .potato-sprout-1 {
  width: 8px;
  height: 20px;
  left: 45%;
  transform: rotate(-10deg);
}

.potato-icon--xl .potato-sprout-2 {
  width: 6px;
  height: 14px;
  left: 58%;
  top: 6px;
  transform: rotate(15deg);
}
</style>