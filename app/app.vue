<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTelegram } from '~/composables/useTelegram'
import { useSchool } from '~/composables/useSchool'

const { isTelegram } = useTelegram()
const { initializeSchool, isInitialized, schoolError } = useSchool()

// THIS is the fix. It forces Nuxt to inject the script into the <head>
useHead({
  script: [
    {
      src: '/ec-date-picker.js',
      tagPriority: 'critical'
    }
  ]
})

onMounted(() => {
  initializeSchool()

  if (isTelegram.value) {
    document.documentElement.style.setProperty('--tg-viewport-height', window.innerHeight + 'px')
  }

  if (schoolError.value) {
    console.error('School initialization error:', schoolError.value)
  }

  // Small delay to ensure the DOM processes the head injection
  setTimeout(() => {
    console.log('Check if registered:', !!customElements.get('ec-date-picker'))
  }, 1000)
})
</script>

<style>
:root {
  --tg-viewport-height: 100vh;
}

html, body {
  height: var(--tg-viewport-height);
  overflow: hidden;
  margin: 0;
  padding: 0;
}

body {
  -webkit-overflow-scrolling: touch;
  overflow: auto;
  background: #1e3971;
}

body {
  background-color: var(--tg-bg-color, #1e3971);
  color: var(--tg-text-color, #ffffff);
}

.tg-button {
  background-color: var(--tg-button-color, #FFC125);
  color: var(--tg-button-text-color, #1e3971);
}
</style>