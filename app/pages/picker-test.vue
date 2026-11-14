<template>
  <div style="padding: 16px; color: #fff; font-family: sans-serif;">
    <h3>Date picker test</h3>

    <p>Registered: <b>{{ registered }}</b></p>

    <div style="background: #fff; padding: 12px; border-radius: 8px;">
      <ec-date-picker
        :value="testDate"
        max-today
        lang="en"
        @change="onChange"
      />
    </div>

    <p>Value: <b>{{ testDate || '(empty)' }}</b></p>
    <p>Last change event: <b>{{ lastEvent || '(none yet)' }}</b></p>
    <p>User agent: <small>{{ ua }}</small></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const testDate = ref('')
const registered = ref('checking...')
const lastEvent = ref('')
const ua = ref('')

onMounted(() => {
  registered.value = !!customElements.get('ec-date-picker') ? 'YES' : 'NO'
  ua.value = navigator.userAgent
})

function onChange(event) {
  testDate.value = event.detail.value
  lastEvent.value = JSON.stringify(event.detail)
}
</script>