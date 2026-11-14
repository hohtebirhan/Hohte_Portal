<template>
  <div style="padding: 16px; color: #fff; font-family: sans-serif;">
    <h3>Date picker v-model test</h3>

    <p>Registered: <b>{{ registered }}</b></p>

    <div style="background: #fff; padding: 12px; border-radius: 8px;">
      <ec-date-picker v-model="testDate" max-today lang="en" />
    </div>

    <p>testDate: <b>{{ testDate || '(empty)' }}</b></p>

    <button style="margin-top: 12px; padding: 8px 16px;" @click="testDate = '2024-09-11'">
      Set to 2024-09-11 via JS
    </button>
    <button style="margin-top: 12px; padding: 8px 16px;" @click="testDate = ''">
      Clear
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const testDate = ref('')
const registered = ref('checking...')

onMounted(() => {
  registered.value = !!customElements.get('ec-date-picker') ? 'YES' : 'NO'
})
</script>