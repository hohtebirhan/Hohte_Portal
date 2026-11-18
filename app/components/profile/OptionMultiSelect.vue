<template>
  <div class="option-multi">
    <!-- Selected chips -->
    <div v-if="selectedChips.length" class="chips">
      <span
        v-for="chip in selectedChips"
        :key="chip.value"
        class="chip"
      >
        {{ chip.label }}
        <button
          type="button"
          class="chip-remove"
          @click="remove(chip.value)"
          :aria-label="removeLabel"
        >×</button>
      </span>
    </div>

    <!-- Searchable picker: one box that matches Amharic and English labels,
         with small grey category headings inside the list -->
    <div v-if="searchable" ref="pickerRoot" class="searchable">
      <input
        v-model="searchTerm"
        type="text"
        class="text-input"
        :placeholder="searchPlaceholder"
        @focus="open = true"
        @keydown.esc="open = false"
        @keydown.enter.prevent="pickFirstMatch"
      />
      <ul v-if="open" class="list">
        <template v-for="group in filteredGroups" :key="group.name || '_'">
          <li v-if="group.name" class="list-heading">{{ group.name }}</li>
          <li
            v-for="opt in group.items"
            :key="opt.value"
            class="list-item"
            :class="{ picked: isPicked(opt.value) }"
            @mousedown.prevent="pickValue(opt.value)"
          >
            {{ opt.label }}
          </li>
        </template>
        <li v-if="!filteredGroups.length" class="list-empty">{{ noResultsLabel }}</li>
      </ul>
    </div>

    <!-- Add picker -->
    <div v-else class="picker-row">
      <select class="select-input" @change="onPick">
        <option value="">{{ placeholder }}</option>
        <optgroup
          v-for="group in groupedOptions"
          :key="group.name || '_'"
          :label="group.name || undefined"
        >
          <option
            v-for="opt in group.items"
            :key="opt.value"
            :value="opt.value"
            :disabled="isPicked(opt.value)"
          >
            {{ opt.label }}
          </option>
        </optgroup>
      </select>
    </div>

    <!-- Other free-text list -->
    <div v-if="maxOthers > 0" class="other-block">
      <div v-if="otherList.length" class="chips">
        <span
          v-for="(val, idx) in otherList"
          :key="'other-' + idx"
          class="chip chip-other"
        >
          {{ val }}
          <button
            type="button"
            class="chip-remove"
            @click="removeOther(idx)"
          >×</button>
        </span>
      </div>

      <div class="other-input-row">
        <input
          v-model="otherDraft"
          type="text"
          class="text-input"
          :placeholder="otherPlaceholder"
          :disabled="otherList.length >= maxOthers"
          @keydown.enter.prevent="addOther"
        />
        <button
          type="button"
          class="add-btn"
          :disabled="!otherDraft.trim() || otherList.length >= maxOthers"
          @click="addOther"
        >{{ addLabel }}</button>
      </div>

      <p v-if="otherList.length >= maxOthers" class="hint">
        {{ maxOthersLabel.replace('{max}', String(maxOthers)) }}
      </p>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // array of codes/ids (strings/numbers)
  modelValue: { type: Array, default: () => [] },
  // array of free-text strings
  otherModelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Choose...' },
  otherPlaceholder: { type: String, default: 'Type your answer' },
  addLabel: { type: String, default: 'Add' },
  removeLabel: { type: String, default: 'Remove' },
  maxOthers: { type: Number, default: 10 },
  maxOthersLabel: { type: String, default: 'You can add up to {max} entries.' },
  error: { type: String, default: '' },
  // Search box instead of a native select (for long lists such as areas)
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: 'Search...' },
  noResultsLabel: { type: String, default: 'No matches' },
})

const emit = defineEmits(['update:modelValue', 'update:otherModelValue'])

const otherDraft = ref('')

// Headings come from the option's category (newer API), else its group.
// label_en and label_am are kept so search matches either language.
const normalized = computed(() =>
  (props.options || []).map((o) => ({
    value: o.code !== undefined ? o.code : o.id,
    label: o.label,
    label_en: o.label_en || o.label,
    label_am: o.label_am || o.label,
    group: (o.category && o.category.label) || o.group || '',
  }))
)

const searchTerm = ref('')
const open = ref(false)
const pickerRoot = ref(null)

const filteredGroups = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  const matches = q
    ? normalized.value.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.label_en.toLowerCase().includes(q) ||
          o.label_am.toLowerCase().includes(q) ||
          o.group.toLowerCase().includes(q)
      )
    : normalized.value
  const map = new Map()
  matches.forEach((o) => {
    if (!map.has(o.group)) map.set(o.group, [])
    map.get(o.group).push(o)
  })
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }))
})

const pickValue = (v) => {
  if (isPicked(v)) {
    remove(v)
  } else {
    emit('update:modelValue', [...(props.modelValue || []), v])
  }
  searchTerm.value = ''
}

const pickFirstMatch = () => {
  const first = filteredGroups.value.flatMap((g) => g.items).find((o) => !isPicked(o.value))
  if (first) pickValue(first.value)
}

const closeOnOutsideClick = (e) => {
  if (pickerRoot.value && !pickerRoot.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick))

const groupedOptions = computed(() => {
  const map = new Map()
  normalized.value.forEach((o) => {
    if (!map.has(o.group)) map.set(o.group, [])
    map.get(o.group).push(o)
  })
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }))
})

const selectedChips = computed(() =>
  (props.modelValue || []).map((v) => {
    const match = normalized.value.find((o) => o.value === v)
    return { value: v, label: match ? match.label : String(v) }
  })
)

const otherList = computed(() => props.otherModelValue || [])

const isPicked = (v) => (props.modelValue || []).includes(v)

const onPick = (e) => {
  const v = e.target.value
  e.target.value = ''
  if (!v || isPicked(v)) return
  emit('update:modelValue', [...(props.modelValue || []), v])
}

const remove = (v) => {
  emit('update:modelValue', (props.modelValue || []).filter((x) => x !== v))
}

const addOther = () => {
  const v = otherDraft.value.trim()
  if (!v) return
  if (otherList.value.length >= props.maxOthers) return
  emit('update:otherModelValue', [...otherList.value, v])
  otherDraft.value = ''
}

const removeOther = (idx) => {
  const next = [...otherList.value]
  next.splice(idx, 1)
  emit('update:otherModelValue', next)
}
</script>

<style scoped>
.option-multi { display: flex; flex-direction: column; gap: 10px; }

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 193, 37, 0.15);
  color: #ffc125;
  border: 1px solid rgba(255, 193, 37, 0.4);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
}
.chip-other {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.chip-remove {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 2px;
  opacity: 0.75;
}
.chip-remove:hover { opacity: 1; }

.select-input,
.text-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 15px;
  font-family: inherit;
  outline: none;
}
.select-input option,
.select-input optgroup { color: #000; background: #fff; }
.select-input:focus,
.text-input:focus { border-color: #ffc125; background: rgba(255, 255, 255, 0.1); }
.text-input::placeholder { color: #a0b3d9; }

.searchable { position: relative; }
.list {
  list-style: none;
  margin: 6px 0 0;
  padding: 4px 0;
  max-height: 260px;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: #1e3971;
}
.list-heading {
  padding: 8px 14px 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #a0b3d9;
}
.list-item {
  padding: 9px 14px;
  font-size: 14px;
  cursor: pointer;
}
.list-item:hover { background: rgba(255, 255, 255, 0.08); }
.list-item.picked { color: #ffc125; }
.list-item.picked::after { content: ' ✓'; }
.list-empty {
  padding: 9px 14px;
  font-size: 13px;
  color: #a0b3d9;
}

.other-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.other-input-row {
  display: flex;
  gap: 8px;
}

.add-btn {
  background: #ffc125;
  color: #1e3971;
  border: none;
  border-radius: 10px;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  white-space: nowrap;
}
.add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.hint {
  font-size: 12px;
  color: #a0b3d9;
  margin: 0;
}

.error-message {
  color: #ff8a80;
  font-size: 13px;
  margin: 0;
}
</style>