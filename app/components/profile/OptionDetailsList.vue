<template>
  <div v-if="codes.length" class="details-list">
    <div v-for="(code, i) in codes" :key="code" class="detail-row">
      <div class="detail-title">{{ labelOf(code) }}</div>

      <div v-if="withTicks && details[code]" class="ticks">
        <label v-if="!AREAS_WITHOUT_SKILL.includes(code)" class="tick">
          <input v-model="details[code].has_skill" type="checkbox" />
          <span>{{ t("profile.areas.hasSkill") }}</span>
        </label>
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
import { AREAS_WITHOUT_SKILL, areaMissingTick } from "~/config/profileAreas";

const props = defineProps({
  codes: { type: Array, default: () => [] },
  details: { type: Object, required: true },
  options: { type: Array, default: () => [] },
  withTicks: { type: Boolean, default: false },
  // Server validation errors and the list's key in them, e.g. "skills.areas"
  errors: { type: Object, default: () => ({}) },
  errorPrefix: { type: String, default: "" },
});

const { t } = useLanguage();

const missingTick = (code) => areaMissingTick(code, props.details[code]);

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
