<template>
  <div v-if="codes.length" class="details-list">
    <div v-for="(code, i) in codes" :key="code" class="detail-row" :class="{ typed }">
      <div class="detail-title">
        {{ labelOf(code) }}
        <span v-if="typed" class="typed-tag">{{ t("profile.areas.typedByYou") }}</span>
      </div>

      <div v-if="withTicks && details[code]" class="ticks">
        <label v-if="!AREAS_WITHOUT_SKILL.includes(code)" class="tick">
          <input v-model="details[code].has_skill" type="checkbox" @change="onSkillTick(code)" />
          <span>{{ t("profile.areas.hasSkill") }}</span>
        </label>
        <span
          v-if="!AREAS_WITHOUT_SKILL.includes(code) && details[code].has_skill"
          class="years"
        >
          <span class="stepper">
            <button type="button" :aria-label="t('profile.areas.fewerYears')" @click="stepYears(code, -1)">−</button>
            <input
              v-model.number="details[code].years"
              class="years-input"
              type="number"
              inputmode="numeric"
              min="0"
              :max="MAX_YEARS"
              :aria-label="t('profile.areas.yearsLabel')"
              @blur="clampYears(code)"
            />
            <button type="button" :aria-label="t('profile.areas.moreYears')" @click="stepYears(code, 1)">+</button>
          </span>
          {{ t("profile.areas.years") }}
        </span>
        <label class="tick">
          <input v-model="details[code].wants_to_serve" type="checkbox" />
          <span>{{ t("profile.areas.wantsToServe") }}</span>
        </label>
      </div>
      <p v-if="withTicks && missingTick(code)" class="detail-error">
        {{ AREAS_WITHOUT_SKILL.includes(code) ? t("profile.areas.tickServe") : t("profile.areas.tickOne") }}
      </p>
      <p v-else-if="errorFor(i, '')" class="detail-error">{{ errorFor(i, "") }}</p>

      <input
        v-if="details[code]"
        v-model="details[code].detail"
        type="text"
        class="detail-input"
        maxlength="500"
        :placeholder="t('profile.detailPlaceholder')"
      />
      <p v-if="errorFor(i, '.detail')" class="detail-error">{{ errorFor(i, ".detail") }}</p>
    </div>
  </div>
</template>

<script setup>
// A detail box for each chosen option of a list and, for areas, the two
// ticks "I have this skill" / "I want to serve on this". `details` is a
// reactive object keyed by code that the page keeps in step with `codes`.
import { useLanguage } from "~/composables/useLanguage";
import { AREAS_WITHOUT_SKILL, MAX_YEARS, areaMissingTick } from "~/config/profileAreas";

const props = defineProps({
  codes: { type: Array, default: () => [] },
  details: { type: Object, required: true },
  options: { type: Array, default: () => [] },
  withTicks: { type: Boolean, default: false },
  // Rows for skills the member typed in themselves (shown with a small tag)
  typed: { type: Boolean, default: false },
  // Server validation errors and the list's key in them, e.g. "skills.areas"
  errors: { type: Object, default: () => ({}) },
  errorPrefix: { type: String, default: "" },
});

const { t } = useLanguage();

const missingTick = (code) => areaMissingTick(code, props.details[code]);

// Years of experience only belong to a skill the member has.
const clampYears = (code) => {
  const d = props.details[code];
  const n = Math.round(Number(d.years) || 0);
  d.years = Math.min(MAX_YEARS, Math.max(0, n));
};
const stepYears = (code, by) => {
  const d = props.details[code];
  d.years = (Number(d.years) || 0) + by;
  clampYears(code);
};
const onSkillTick = (code) => {
  if (!props.details[code].has_skill) props.details[code].years = 0;
};

const labelOf = (code) => props.options.find((o) => o.code === code)?.label || code;

const errorFor = (i, suffix) => {
  const list = props.errors?.[`${props.errorPrefix}.${i}${suffix}`];
  return Array.isArray(list) && list.length ? list[0] : "";
};
</script>

<style scoped>
.details-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-row {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-title {
  font-size: 14px;
  font-weight: 700;
  color: #ffc125;
}
.ticks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
}
.tick {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}
.detail-row.typed {
  border-style: dashed;
}
.typed-tag {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #a0b3d9;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 1px 8px;
  vertical-align: middle;
}
.years {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #a0b3d9;
}
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  overflow: hidden;
}
.stepper button {
  width: 28px;
  height: 28px;
  border: 0;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
.years-input {
  width: 34px;
  border: 0;
  background: transparent;
  color: #ffc125;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  -moz-appearance: textfield;
  outline: none;
}
.years-input::-webkit-outer-spin-button,
.years-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.tick input {
  width: 18px;
  height: 18px;
  accent-color: #ffc125;
}
.detail-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}
.detail-input:focus {
  border-color: #ffc125;
}
.detail-input::placeholder {
  color: #a0b3d9;
}
.detail-error {
  color: #ff8a80;
  font-size: 12px;
  margin: 0;
}
</style>
