<template>
  <div class="date-field-root">
    <!-- Compact field with a calendar icon. The picker itself opens in a
         bottom sheet so no card can ever clip it. -->
    <button
      type="button"
      class="date-field"
      :disabled="disabled"
      :aria-label="placeholderText"
      @click="openSheet"
    >
      <span class="date-field-text">
        <template v-if="display">
          <span class="date-ec">{{ display.ec }}</span>
          <span class="date-gc">{{ display.gc }}</span>
        </template>
        <span v-else class="date-placeholder">{{ placeholderText }}</span>
      </span>
      <span class="date-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            fill="currentColor"
            d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"
          />
        </svg>
      </span>
    </button>

    <Teleport to="body">
      <div v-if="showSheet" class="date-sheet-backdrop" @click.self="closeSheet">
        <div class="date-sheet" role="dialog" aria-modal="true">
          <div class="date-sheet-header">
            <h3 class="date-sheet-title">{{ title }}</h3>
            <button type="button" class="date-sheet-close" @click="closeSheet">
              {{ lang === "am" ? "ዝጋ" : "Close" }}
            </button>
          </div>
          <!-- No v-model on the custom element: it breaks the Nuxt/Netlify
               build. Bind :value and listen to @change instead. -->
          <ec-date-picker
            ref="picker"
            :value="modelValue || ''"
            :min="min || undefined"
            :max="max || undefined"
            :max-today="maxToday ? '' : undefined"
            :lang="lang"
            @change="onChange"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";

const props = defineProps({
  // YYYY-MM-DD, or '' / null when empty
  modelValue: { type: String, default: "" },
  // Earliest / latest allowed date, YYYY-MM-DD
  min: { type: String, default: "" },
  max: { type: String, default: "" },
  maxToday: { type: Boolean, default: false },
  lang: { type: String, default: "am" },
  title: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const showSheet = ref(false);
const picker = ref(null);

const placeholderText = computed(() =>
  props.lang === "am" ? "ቀን ይምረጡ" : "Select date",
);

const openSheet = async () => {
  if (props.disabled) return;
  showSheet.value = true;
  await nextTick();
  // Open the calendar straight away so there is no second tap.
  picker.value?.open?.("ec");
};

const closeSheet = () => {
  showSheet.value = false;
};

const onChange = (event) => {
  emit("update:modelValue", event.detail.value || "");
  closeSheet();
};

// Text shown in the compact field: Ethiopian date + Gregorian date
const display = computed(() => {
  const iso = props.modelValue;
  if (!iso || typeof window === "undefined") return null;
  const Cal = window.EthiopianCalendar;
  if (!Cal) return { ec: "", gc: iso };
  const gc = Cal.parseIso(iso);
  if (!gc) return null;
  const ec = Cal.toEthiopian(gc);
  const am = props.lang === "am";
  return {
    ec: `${Cal.formatEc(ec)} ${am ? "ዓ.ም" : "E.C."}`,
    gc: `${Cal.formatGc(gc)} G.C.`,
  };
});
</script>

<style scoped>
.date-field-root {
  min-width: 0;
}

.date-field {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  min-height: 52px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}
.date-field:hover:not(:disabled),
.date-field:focus-visible {
  border-color: #ffc125;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}
.date-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.date-field-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}
.date-ec {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.date-gc {
  font-size: 12px;
  color: #a0b3d9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.date-placeholder {
  font-size: 15px;
  color: #a0b3d9;
}
.date-icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #ffc125;
  background: rgba(255, 193, 37, 0.12);
}

/* Bottom sheet that holds the picker (teleported to <body>, so no card can clip it) */
.date-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
}
.date-sheet {
  width: 100%;
  max-width: 380px;
  max-height: 85vh;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 12px 12px calc(14px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  color: #1e3971;
  border-radius: 16px 16px 0 0;
  --ecdp-accent: #1e3971;
  --ecdp-text: #1e3971;
  --ecdp-muted: #6b7a99;
  --ecdp-border: #d2d6da;
  --ecdp-bg: #fff;
  --ecdp-radius: 8px;
}
.date-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.date-sheet-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1e3971;
}
.date-sheet-close {
  border: none;
  background: #eef1f7;
  color: #1e3971;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}
/* Slightly smaller picker overall (0.8 = smaller, 0.95 = bigger) */
.date-sheet ec-date-picker {
  zoom: 0.85;
}
/* The calendar sits in the normal flow under the date boxes, so the sheet is
   exactly as tall as its content and never wider than the sheet */
.date-sheet ec-date-picker::part(popup) {
  position: static;
  width: 100%;
  max-width: 100%;
  margin-top: 10px;
  padding: 0.75rem;
  box-shadow: none;
  box-sizing: border-box;
}
</style>