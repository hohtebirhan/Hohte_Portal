<template>
  <div>
    <!-- This forces the script to load natively, bypassing Nuxt and Telegram -->
    <div v-html="scriptTag" style="display: none;"></div>
    
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useTelegram } from '~/composables/useTelegram'
import { useSchool } from '~/composables/useSchool'

const { isTelegram } = useTelegram()
const { initializeSchool, isInitialized, schoolError } = useSchool()

// We inject the script tag via v-html so the browser MUST parse it
const scriptTag = ref('<script src="/ec-date-picker.js"><\/script>')

onMounted(() => {
  initializeSchool()

  if (isTelegram.value) {
    document.documentElement.style.setProperty('--tg-viewport-height', window.innerHeight + 'px')
  }

  if (schoolError.value) {
    console.error('School initialization error:', schoolError.value)
  }
  
  // Check if it loaded after a small delay
  setTimeout(() => {
    console.log('REGISTERED?', !!customElements.get('ec-date-picker'))
  }, 500)
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