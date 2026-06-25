<template>
  <div class="potato-icon" :class="sizeClass">
    <div class="potato-body">
      <div class="potato-eye potato-eye-left"></div>
      <div class="potato-eye potato-eye-right"></div>
      <div class="potato-mouth"></div>
      <div class="potato-shine"></div>
    </div>
    <div class="potato-stem"></div>
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
  height: 20px;
}

.potato-icon--md {
  width: 28px;
  height: 28px;
}

.potato-icon--lg {
  width: 40px;
  height: 40px;
}

.potato-icon--xl {
  width: 56px;
  height: 56px;
}

.potato-body {
  position: relative;
  background: linear-gradient(135deg, #D4A574 0%, #B8860B 50%, #8B4513 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow: inset -4px -4px 8px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.3);
}

.potato-icon--sm .potato-body {
  width: 18px;
  height: 16px;
}

.potato-icon--md .potato-body {
  width: 26px;
  height: 22px;
}

.potato-icon--lg .potato-body {
  width: 38px;
  height: 32px;
}

.potato-icon--xl .potato-body {
  width: 54px;
  height: 46px;
}

.potato-eye {
  position: absolute;
  width: 25%;
  height: 20%;
  background: #3d2914;
  border-radius: 50%;
  top: 35%;
}

.potato-icon--sm .potato-eye {
  width: 4px;
  height: 3px;
}

.potato-icon--md .potato-eye {
  width: 6px;
  height: 4px;
}

.potato-icon--lg .potato-eye {
  width: 9px;
  height: 6px;
}

.potato-icon--xl .potato-eye {
  width: 13px;
  height: 9px;
}

.potato-eye-left {
  left: 15%;
}

.potato-eye-right {
  right: 15%;
}

.potato-mouth {
  position: absolute;
  width: 30%;
  height: 15%;
  border-bottom: 2px solid #3d2914;
  border-radius: 0 0 50% 50%;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
}

.potato-icon--sm .potato-mouth {
  border-width: 1px;
}

.potato-icon--xl .potato-mouth {
  border-width: 3px;
}

.potato-shine {
  position: absolute;
  width: 20%;
  height: 15%;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  top: 20%;
  right: 20%;
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

.potato-stem {
  position: absolute;
  width: 25%;
  height: 30%;
  background: linear-gradient(90deg, #556B2F 0%, #6B8E23 50%, #556B2F 100%);
  border-radius: 5px 5px 0 0;
  top: 0;
}

.potato-icon--sm .potato-stem {
  width: 5px;
  height: 6px;
}

.potato-icon--md .potato-stem {
  width: 7px;
  height: 8px;
}

.potato-icon--lg .potato-stem {
  width: 10px;
  height: 12px;
}

.potato-icon--xl .potato-stem {
  width: 14px;
  height: 17px;
}
</style>