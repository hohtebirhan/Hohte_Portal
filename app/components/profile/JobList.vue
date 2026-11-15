<template>
  <div class="entry-list">
    <p v-if="!entries.length" class="entry-empty">
      {{ t("profile.work.empty") }}
    </p>

    <div v-for="(entry, i) in entries" :key="entry._key" class="entry-card">
      <div class="entry-head">
        <div class="entry-title-wrap">
          <h4 class="entry-title">
            {{ t("profile.work.entryTitle", { n: i + 1 }) }}
          </h4>
          <span v-if="entry.is_current" class="entry-badge">{{
            t("profile.work.currentBadge")
          }}</span>
        </div>
        <button
          type="button"
          class="entry-remove"
          :aria-label="t('profile.removeOther')"
          :title="t('profile.removeOther')"
          @click="removeEntry(i)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h1v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7h1a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9Zm1 2h4v0h-4V5Zm-3 2h10v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7Zm3 3a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1Z"
            />
          </svg>
        </button>
      </div>

      <div class="entry-grid">
        <div class="entry-field">
          <label class="entry-label">
            {{ t("profile.work.jobTitle") }}
            <span class="entry-required">*</span>
          </label>
          <input
            v-model="entry.job_title"
            type="text"
            class="entry-input"
            :placeholder="t('profile.work.jobTitle')"
          />
        </div>

        <div class="entry-field">
          <label class="entry-label">{{ t("profile.work.organization") }}</label>
          <input
            v-model="entry.organization"
            type="text"
            class="entry-input"
            :placeholder="t('profile.work.organization')"
          />
        </div>

        <label class="entry-check">
          <input
            type="checkbox"
            :checked="entry.is_current"
            @change="setCurrent(i, $event.target.checked)"
          />
          <span>{{ t("profile.work.currentLabel") }}</span>
        </label>

        <div class="entry-field">
          <label class="entry-label">{{ t("profile.work.startDate") }}</label>
          <DateField
            :model-value="entry.start_date"
            :lang="lang"
            :title="t('profile.work.startDate')"
            max-today
            @update:model-value="(v) => setStart(entry, v)"
          />
        </div>

        <!-- A current job has no end date -->
        <div v-if="!entry.is_current" class="entry-field">
          <label class="entry-label">{{ t("profile.work.endDate") }}</label>
          <DateField
            v-model="entry.end_date"
            :min="entry.start_date"
            :lang="lang"
            :title="t('profile.work.endDate')"
            max-today
          />
        </div>
      </div>

      <p v-for="(msg, k) in entryErrors(i)" :key="k" class="entry-error">
        {{ msg }}
      </p>
    </div>

    <p v-for="(msg, k) in listErrors" :key="'l' + k" class="entry-error">
      {{ msg }}
    </p>

    <button
      type="button"
      class="entry-add"
      :disabled="entries.length >= max"
      @click="addEntry"
    >
      ＋ {{ t("profile.work.add") }}
    </button>
    <p v-if="entries.length >= max" class="entry-hint">
      {{ t("profile.maxOthersReached", { max }) }}
    </p>
  </div>
</template>

<script setup>
// The parent owns the list. This component edits the `entries` array in place
// (push / splice / field edits), so the parent's dirty detection and payload
// builder see every change without extra events.
import { computed } from "vue";
import { useLanguage } from "~/composables/useLanguage";
import DateField from "~/components/profile/DateField.vue";

const props = defineProps({
  entries: { type: Array, required: true },
  // Server validation errors, e.g. { "jobs.0.job_title": ["..."] }
  errors: { type: Object, default: () => ({}) },
  errorPrefix: { type: String, default: "jobs" },
  max: { type: Number, default: 20 },
});

const { t, locale } = useLanguage();
const lang = computed(() => (locale.value === "am" ? "am" : "en"));

let counter = 0;

const addEntry = () => {
  if (props.entries.length >= props.max) return;
  props.entries.push({
    _key: `new-${Date.now()}-${counter++}`,
    job_title: "",
    organization: "",
    is_current: false, // new entries always start unchecked
    start_date: "",
    end_date: "",
  });
};

const removeEntry = (i) => {
  props.entries.splice(i, 1);
};

// Only one job can be current; a current job has no end date.
const setCurrent = (i, checked) => {
  if (checked) {
    props.entries.forEach((e, idx) => {
      e.is_current = idx === i;
    });
    props.entries[i].end_date = "";
  } else {
    props.entries[i].is_current = false;
  }
};

// If the start moves after the end, the end is no longer valid: clear it.
const setStart = (entry, value) => {
  entry.start_date = value || "";
  if (entry.end_date && entry.start_date && entry.end_date < entry.start_date) {
    entry.end_date = "";
  }
};

const entryErrors = (i) => {
  const base = `${props.errorPrefix}.${i}`;
  const out = [];
  Object.entries(props.errors || {}).forEach(([key, msgs]) => {
    if (key === base || key.startsWith(`${base}.`)) {
      (Array.isArray(msgs) ? msgs : [msgs]).forEach((m) => out.push(m));
    }
  });
  return out;
};

const listErrors = computed(() => {
  const msgs = (props.errors || {})[props.errorPrefix];
  return Array.isArray(msgs) ? msgs : msgs ? [msgs] : [];
});
</script>

<style scoped>
.entry-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-empty {
  margin: 0;
  color: #a0b3d9;
  font-size: 14px;
  font-style: italic;
}

.entry-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
}

.entry-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.entry-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.entry-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.entry-badge {
  background: rgba(255, 193, 37, 0.15);
  color: #ffc125;
  border: 1px solid rgba(255, 193, 37, 0.4);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 700;
}
.entry-remove {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 138, 128, 0.12);
  color: #ff8a80;
  border: 1px solid rgba(255, 138, 128, 0.35);
  border-radius: 8px;
  cursor: pointer;
}
.entry-remove:hover {
  background: rgba(255, 138, 128, 0.22);
}

.entry-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 480px) {
  .entry-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.entry-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.entry-label {
  font-size: 13px;
  font-weight: 600;
  color: #e6ecf7;
}
.entry-required {
  color: #ff8a80;
  font-weight: 800;
}

.entry-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}
.entry-input::placeholder {
  color: #a0b3d9;
}
.entry-input:focus {
  border-color: #ffc125;
  background: rgba(255, 255, 255, 0.1);
}

.entry-check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #e6ecf7;
  cursor: pointer;
}
.entry-check input {
  width: 20px;
  height: 20px;
  accent-color: #ffc125;
  flex: 0 0 auto;
}
@media (min-width: 480px) {
  .entry-check {
    grid-column: 1 / -1;
  }
}

.entry-error {
  margin: 10px 0 0;
  font-size: 12px;
  color: #ff8a80;
}
.entry-hint {
  margin: 0;
  font-size: 12px;
  color: #a0b3d9;
}

.entry-add {
  width: 100%;
  background: transparent;
  color: #ffc125;
  border: 1px dashed rgba(255, 193, 37, 0.6);
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}
.entry-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>