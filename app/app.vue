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

onMounted(() => {
  initializeSchool()

  if (isTelegram.value) {
    document.documentElement.style.setProperty('--tg-viewport-height', window.innerHeight + 'px')
  }

  if (schoolError.value) {
    console.error('School initialization error:', schoolError.value)
  }

  const s = document.createElement('script')
  s.src = '/ec-date-picker.js'
  s.onload = () => console.log('✅ script onload, registered =', !!customElements.get('ec-date-picker'))
  s.onerror = (e) => console.error('❌ script failed to load', e)
  document.head.appendChild(s)
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