<template>
  <div class="profile-page">
    <!-- Toasts -->
    <div class="toast-container">
      <ToastNotification
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </div>

    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack" :aria-label="t('common.back')">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <div class="header-text">
        <h1 class="page-title">{{ t("profile.title") }}</h1>
        <p class="page-subtitle">{{ t("profile.subtitle") }}</p>
      </div>
    </header>

    <!-- Loading / Error -->
    <div v-if="initialLoading" class="state-block">
      <div class="spinner"></div>
      <p>{{ t("profile.loading") }}</p>
    </div>

    <div v-else-if="loadError" class="state-block">
      <p class="error-text">{{ loadError }}</p>
      <button class="btn-primary" @click="bootstrap">
        {{ t("profile.retry") }}
      </button>
    </div>

    <div v-else class="sections-stack">
      <!-- Imported banner -->
      <ImportedBanner
        v-if="isImported"
        :title="t('profile.importedBannerTitle')"
        :text="t('profile.importedBannerText')"
        :confirm-label="t('profile.importedBannerConfirm')"
        :edit-label="t('profile.importedBannerEdit')"
        :confirming="isConfirming"
        @confirm="onConfirmProfile"
        @edit="onEditImported"
      />

      <!-- Personal -->
      <ProfileSectionCard
        ref="personalCard"
        :title="t('profile.sections.personal')"
        :summary="personalSummary"
        :dirty="dirty.personal"
        :saving="savingSection === 'personal'"
        :save-label="t('profile.save')"
        :saving-label="t('profile.saving')"
        :footer-error="sectionError.personal"
        @save="savePersonal"
      >
        <div class="field-grid">
          <div class="field">
            <label class="field-label">
              {{ t("profile.personal.firstName") }}
              <PendingBadge
                v-if="pendingFor('first_name')"
                :label="t('profile.pendingApproval')"
                :title="pendingTitle('first_name')"
              />
            </label>
            <input
              v-model="form.personal.first_name"
              type="text"
              class="text-input"
              :class="{ error: fieldError('personal.first_name') }"
              @input="clearFieldError('personal.first_name')"
            />
            <p v-if="pendingFor('first_name')" class="field-hint">
              {{
                t("profile.pendingNewValue", {
                  value: pendingFor("first_name").new_value,
                })
              }}
            </p>
            <p v-if="rejectionFor('first_name')" class="field-error">
              {{
                t("profile.rejectedReason", {
                  note: rejectionFor("first_name").review_note,
                })
              }}
            </p>
            <p v-if="fieldError('personal.first_name')" class="field-error">
              {{ fieldError("personal.first_name") }}
            </p>
          </div>

          <div class="field">
            <label class="field-label">
              {{ t("profile.personal.middleName") }}
              <PendingBadge
                v-if="pendingFor('middle_name')"
                :label="t('profile.pendingApproval')"
              />
            </label>
            <input
              v-model="form.personal.middle_name"
              type="text"
              class="text-input"
              :class="{ error: fieldError('personal.middle_name') }"
              @input="clearFieldError('personal.middle_name')"
            />
            <p v-if="pendingFor('middle_name')" class="field-hint">
              {{
                t("profile.pendingNewValue", {
                  value: pendingFor("middle_name").new_value,
                })
              }}
            </p>
            <p v-if="rejectionFor('middle_name')" class="field-error">
              {{
                t("profile.rejectedReason", {
                  note: rejectionFor("middle_name").review_note,
                })
              }}
            </p>
            <p v-if="fieldError('personal.middle_name')" class="field-error">
              {{ fieldError("personal.middle_name") }}
            </p>
          </div>

          <div class="field">
            <label class="field-label">
              {{ t("profile.personal.lastName") }}
              <PendingBadge
                v-if="pendingFor('last_name')"
                :label="t('profile.pendingApproval')"
              />
            </label>
            <input
              v-model="form.personal.last_name"
              type="text"
              class="text-input"
              :class="{ error: fieldError('personal.last_name') }"
              @input="clearFieldError('personal.last_name')"
            />
            <p v-if="pendingFor('last_name')" class="field-hint">
              {{
                t("profile.pendingNewValue", {
                  value: pendingFor("last_name").new_value,
                })
              }}
            </p>
            <p v-if="rejectionFor('last_name')" class="field-error">
              {{
                t("profile.rejectedReason", {
                  note: rejectionFor("last_name").review_note,
                })
              }}
            </p>
            <p v-if="fieldError('personal.last_name')" class="field-error">
              {{ fieldError("personal.last_name") }}
            </p>
          </div>

          <div class="field">
            <label class="field-label">
              {{ t("profile.personal.phoneNumber") }}
              <PendingBadge
                v-if="pendingFor('phone_number')"
                :label="t('profile.pendingApproval')"
              />
            </label>
            <input
              v-model="form.personal.phone_number"
              type="tel"
              class="text-input"
              :class="{ error: fieldError('personal.phone_number') }"
              @input="clearFieldError('personal.phone_number')"
              :placeholder="t('profile.personal.phoneHint')"
            />
            <p v-if="pendingFor('phone_number')" class="field-hint">
              {{
                t("profile.pendingNewValue", {
                  value: pendingFor("phone_number").new_value,
                })
              }}
            </p>
            <p v-if="rejectionFor('phone_number')" class="field-error">
              {{
                t("profile.rejectedReason", {
                  note: rejectionFor("phone_number").review_note,
                })
              }}
            </p>
            <p v-if="fieldError('personal.phone_number')" class="field-error">
              {{ fieldError("personal.phone_number") }}
            </p>
          </div>

          <div class="field">
            <label class="field-label">{{
              t("profile.personal.baptismalName")
            }}</label>
            <input
              v-model="form.personal.baptismal_name"
              type="text"
              class="text-input"
            />
          </div>

          <div class="field">
            <label class="field-label">{{
              t("profile.personal.motherName")
            }}</label>
            <input
              v-model="form.personal.mother_name"
              type="text"
              class="text-input"
            />
          </div>

          <div class="field field-full">
            <label class="field-label">{{
              t("profile.personal.birthDate")
            }}</label>
            <DateField
              v-model="form.personal.birth_date"
              :lang="locale === 'am' ? 'am' : 'en'"
              :title="t('profile.personal.birthDate')"
              max-today
            />
          </div>

          <div class="field">
            <label class="field-label">{{ t("profile.personal.sex") }}</label>
            <div class="segmented">
              <button
                type="button"
                :class="{ active: form.personal.sex === 'm' }"
                @click="form.personal.sex = 'm'"
              >
                {{ t("profile.personal.male") }}
              </button>
              <button
                type="button"
                :class="{ active: form.personal.sex === 'f' }"
                @click="form.personal.sex = 'f'"
              >
                {{ t("profile.personal.female") }}
              </button>
            </div>
          </div>
        </div>
      </ProfileSectionCard>

      <!-- Address -->
      <ProfileSectionCard
        :title="t('profile.sections.address')"
        :summary="addressSummary"
        :dirty="dirty.address"
        :saving="savingSection === 'address'"
        :save-label="t('profile.save')"
        :saving-label="t('profile.saving')"
        :footer-error="sectionError.address"
        @save="saveAddress"
      >
        <div class="field-grid">
          <div class="field">
            <label class="field-label">{{
              t("profile.address.country")
            }}</label>
            <OptionSelect
              v-model="form.address.country"
              :options="optionsList('country')"
              :placeholder="t('profile.chooseOption')"
              :allow-other="false"
              :error="fieldError('address.country')"
              :searchable="true"
              :search-placeholder="t('profile.searchOptions')"
              :no-results-label="t('profile.noOptionsFound')"
            />
          </div>

          <template v-if="isEthiopia">
            <div class="field">
              <label class="field-label">{{ t("profile.address.city") }}</label>
              <OptionSelect
                v-model="form.address.city"
                v-model:other-model-value="form.address.city_other"
                :options="optionsList('city')"
                :placeholder="t('profile.chooseOption')"
                :other-label="t('profile.addOther')"
                :other-placeholder="t('profile.address.cityOther')"
                :searchable="true"
                :search-placeholder="t('profile.searchOptions')"
                :no-results-label="t('profile.noOptionsFound')"
              />
            </div>

            <div class="field">
              <label class="field-label">
                {{ t("profile.address.subCity") }}
                <span class="required-asterisk">*</span>
              </label>
              <OptionSelect
                v-model="form.address.sub_city"
                v-model:other-model-value="form.address.sub_city_other"
                :options="optionsList('sub_city')"
                :placeholder="t('profile.chooseOption')"
                :other-label="t('profile.addOther')"
                :other-placeholder="t('profile.address.subCityOther')"
                :error="fieldError('address.sub_city')"
              />
            </div>

            <div class="field">
              <label class="field-label">{{
                t("profile.address.woreda")
              }}</label>
              <input
                v-model="form.address.woreda"
                type="text"
                class="text-input"
              />
            </div>

            <div class="field">
              <label class="field-label">{{ t("profile.address.area") }}</label>
              <input
                v-model="form.address.area"
                type="text"
                class="text-input"
              />
            </div>

            <div class="field">
              <label class="field-label">{{
                t("profile.address.houseNumber")
              }}</label>
              <input
                v-model="form.address.house_number"
                type="text"
                class="text-input"
              />
            </div>
          </template>

          <template v-else>
            <div class="field">
              <label class="field-label">{{
                t("profile.address.cityOther")
              }}</label>
              <input
                v-model="form.address.city_other"
                type="text"
                class="text-input"
              />
            </div>
            <div class="field">
              <label class="field-label">{{
                t("profile.address.region")
              }}</label>
              <input
                v-model="form.address.region"
                type="text"
                class="text-input"
              />
            </div>
            <div class="field">
              <label class="field-label">{{
                t("profile.address.zipCode")
              }}</label>
              <input
                v-model="form.address.zip_code"
                type="text"
                class="text-input"
              />
            </div>
            <div class="field field-full">
              <label class="field-label">{{
                t("profile.address.addressLine")
              }}</label>
              <input
                v-model="form.address.address_line"
                type="text"
                class="text-input"
              />
            </div>
          </template>
        </div>
      </ProfileSectionCard>

      <!-- Education -->
      <ProfileSectionCard
        :title="t('profile.sections.education')"
        :summary="educationSummary"
        :dirty="dirty.education"
        :saving="savingSection === 'education'"
        :save-label="t('profile.save')"
        :saving-label="t('profile.saving')"
        :footer-error="sectionError.education"
        @save="saveEducation"
      >
        <EducationList
          :entries="form.education.entries"
          :level-options="optionsList('education_level')"
          :field-options="optionsList('education_field')"
          :school-options="optionsList('school')"
          :errors="lastValidationErrors || {}"
        />
      </ProfileSectionCard>

      <!-- Spiritual education -->
      <ProfileSectionCard
        :title="t('profile.sections.spiritual_education')"
        :summary="spiritualSummary"
        :dirty="dirty.spiritual_education"
        :saving="savingSection === 'spiritual_education'"
        :save-label="t('profile.save')"
        :saving-label="t('profile.saving')"
        :footer-error="sectionError.spiritual_education"
        @save="saveSpiritual"
      >
        <div class="field">
          <label class="field-label">{{
            t("profile.spiritualEducation.items")
          }}</label>
          <OptionMultiSelect
            v-model="form.spiritual_education.items"
            v-model:other-model-value="form.spiritual_education.other"
            :options="optionsList('spiritual_education')"
            :placeholder="t('profile.chooseOption')"
            :other-placeholder="t('profile.otherPlaceholder')"
            :add-label="t('profile.addOther')"
            :remove-label="t('profile.removeOther')"
            :max-others="10"
            :max-others-label="t('profile.maxOthersReached')"
            :searchable="true"
            :search-placeholder="t('profile.searchOptions')"
            :no-results-label="t('profile.noOptionsFound')"
          />
          <OptionDetailsList
            :codes="form.spiritual_education.items"
            :details="form.spiritual_education.details"
            :options="optionsList('spiritual_education')"
            :errors="lastValidationErrors || {}"
            error-prefix="spiritual_education.entries"
          />
        </div>
      </ProfileSectionCard>

      <!-- Work -->
      <ProfileSectionCard
        :title="t('profile.sections.work')"
        :summary="workSummary"
        :dirty="dirty.work"
        :saving="savingSection === 'work'"
        :save-label="t('profile.save')"
        :saving-label="t('profile.saving')"
        :footer-error="sectionError.work"
        @save="saveWork"
      >
        <div class="field-grid">
          <div class="field">
            <label class="field-label">
              {{ t("profile.work.occupationStatus") }}
              <span class="required-asterisk">*</span>
            </label>
            <OptionSelect
              v-model="form.work.occupation_status"
              :options="optionsList('occupation_status')"
              :placeholder="t('profile.chooseOption')"
              :allow-other="false"
              :error="fieldError('work.occupation_status')"
            />
            <!-- "Other" is a real option code from the API; ask what it is -->
            <template v-if="form.work.occupation_status === 'other'">
              <input
                v-model="form.work.occupation_status_other"
                type="text"
                class="text-input"
                maxlength="150"
                :class="{ error: fieldError('work.occupation_status_other') }"
                :placeholder="t('profile.work.occupationStatusOther')"
                @input="clearFieldError('work.occupation_status_other')"
              />
              <p
                v-if="fieldError('work.occupation_status_other')"
                class="field-error"
              >
                {{ fieldError("work.occupation_status_other") }}
              </p>
            </template>
          </div>
        </div>

        <div class="jobs-block">
          <h4 class="jobs-heading">{{ t("profile.work.jobsHeading") }}</h4>
          <JobList
            :entries="form.work.jobs"
            :errors="lastValidationErrors || {}"
          />
        </div>
      </ProfileSectionCard>

      <!-- Skills -->
      <ProfileSectionCard
        :title="t('profile.sections.skills')"
        :summary="skillsSummary"
        :dirty="dirty.skills"
        :saving="savingSection === 'skills'"
        :save-label="t('profile.save')"
        :saving-label="t('profile.saving')"
        :footer-error="sectionError.skills"
        @save="saveSkills"
      >
        <div class="field">
          <label class="field-label">{{ t("profile.areas.label") }}</label>
          <p class="field-hint">{{ t("profile.areas.hint") }}</p>
          <OptionMultiSelect
            v-model="form.skills.items"
            v-model:other-model-value="form.skills.other"
            :options="optionsList('skill')"
            :placeholder="t('profile.chooseOption')"
            :other-placeholder="t('profile.otherPlaceholder')"
            :add-label="t('profile.addOther')"
            :remove-label="t('profile.removeOther')"
            :max-others="10"
            :max-others-label="t('profile.maxOthersReached')"
            :searchable="true"
            :search-placeholder="t('profile.areas.search')"
            :no-results-label="t('profile.noOptionsFound')"
          />
          <OptionDetailsList
            :codes="form.skills.items"
            :details="form.skills.areaDetails"
            :options="optionsList('skill')"
            :with-ticks="true"
            :errors="lastValidationErrors || {}"
            error-prefix="skills.areas"
          />
        </div>

        <div class="field">
          <label class="field-label">{{
            t("profile.skills.availability")
          }}</label>
          <OptionMultiSelect
            v-model="form.skills.availability"
            :options="optionsList('availability')"
            :placeholder="t('profile.chooseOption')"
            :add-label="t('profile.addOther')"
            :remove-label="t('profile.removeOther')"
            :max-others="0"
          />
          <OptionDetailsList
            :codes="form.skills.availability"
            :details="form.skills.availabilityDetails"
            :options="optionsList('availability')"
            :errors="lastValidationErrors || {}"
            error-prefix="skills.availability_entries"
          />
        </div>

        <div class="field">
          <label class="field-label">{{
            t("profile.skills.serviceNote")
          }}</label>
          <textarea
            v-model="form.skills.service_note"
            class="text-area"
            rows="3"
            :placeholder="t('profile.skills.serviceNotePlaceholder')"
          ></textarea>
        </div>

        <p v-if="importedSkillsNote" class="office-note">
          {{ t("profile.importedOfficeNote", { value: importedSkillsNote }) }}
        </p>
      </ProfileSectionCard>

      <!-- Departments (read-only) -->
      <div class="departments-card">
        <h3 class="dept-title">{{ t("profile.sections.departments") }}</h3>
        <div v-if="currentDepartments.length" class="dept-chips">
          <span v-for="d in currentDepartments" :key="d.id" class="dept-chip">{{
            d.label
          }}</span>
        </div>
        <p v-else class="dept-empty">{{ t("profile.notSet") }}</p>
        <p class="dept-hint">{{ t("profile.departmentsReadOnly") }}</p>

        <button
          type="button"
          class="btn-class-change"
          @click="goToClassChange"
        >
          {{ t("profile.requestDeptChange") }}
        </button>
      </div>

      <!-- Change requests -->
      <ChangeRequestsList :items="changeRequests" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useLanguage } from "~/composables/useLanguage";
import { useNavigation } from "~/composables/useNavigation";
import { useToast } from "~/composables/useToast";
import { useMemberProfile } from "~/composables/useMemberProfile";
import ToastNotification from "~/components/ToastNotification.vue";
import ProfileSectionCard from "~/components/profile/ProfileSectionCard.vue";
import OptionSelect from "~/components/profile/OptionSelect.vue";
import OptionMultiSelect from "~/components/profile/OptionMultiSelect.vue";
import OptionDetailsList from "~/components/profile/OptionDetailsList.vue";
import PendingBadge from "~/components/profile/PendingBadge.vue";
import ImportedBanner from "~/components/profile/ImportedBanner.vue";
import ChangeRequestsList from "~/components/profile/ChangeRequestsList.vue";
import DateField from "~/components/profile/DateField.vue";
import EducationList from "~/components/profile/EducationList.vue";
import JobList from "~/components/profile/JobList.vue";

const { t, locale } = useLanguage();
const { goBack, goToClassChange } = useNavigation();
const { toasts, success, error: toastError, removeToast } = useToast();

const {
  profile,
  options,
  changeRequests,
  isLoading,
  isSaving,
  isConfirming,
  error: apiError,
  lastValidationErrors,
  isImported,
  loadOptions,
  loadProfile,
  saveSections,
  confirmProfile,
  loadChangeRequests,
  getPendingFor,
  getLatestRejectionFor,
} = useMemberProfile();

const initialLoading = ref(true);
const loadError = ref("");
const savingSection = ref("");

// ------------------------------------------------------------------
// Form state — flat per section, initialized from profile, then two-way bound.
// ------------------------------------------------------------------
const form = reactive({
  personal: {
    first_name: "",
    middle_name: "",
    last_name: "",
    phone_number: "",
    baptismal_name: "",
    mother_name: "",
    birth_date: "",
    sex: "",
  },
  address: {
    country: "",
    city: "",
    city_other: "",
    sub_city: "",
    sub_city_other: "",
    woreda: "",
    area: "",
    house_number: "",
    region: "",
    zip_code: "",
    address_line: "",
  },
  education: {
    entries: [],
  },
  spiritual_education: {
    items: [],
    other: [],
    details: {}, // { code: { detail } }
  },
  work: {
    occupation_status: "",
    occupation_status_other: "",
    jobs: [],
  },
  skills: {
    items: [], // area codes
    other: [],
    areaDetails: {}, // { code: { has_skill, wants_to_serve, detail } }
    availability: [],
    availabilityDetails: {}, // { code: { detail } }
    service_note: "",
  },
});

// Snapshot for dirty detection
const snapshot = reactive(JSON.parse(JSON.stringify(form)));

const dirty = reactive({
  personal: false,
  address: false,
  education: false,
  spiritual_education: false,
  work: false,
  skills: false,
});

const sectionError = reactive({
  personal: "",
  address: "",
  education: "",
  spiritual_education: "",
  work: "",
  skills: "",
});

// ------------------------------------------------------------------
// Hydrate form from profile.value
// ------------------------------------------------------------------
const codeOf = (v) => {
  if (v == null) return "";
  if (typeof v === "object")
    return v.code !== undefined ? v.code : v.id !== undefined ? v.id : "";
  return v;
};
const codesOf = (arr) =>
  Array.isArray(arr) ? arr.map(codeOf).filter(Boolean) : [];

// A newly chosen area starts as a skill the member has.
const AREA_DEFAULTS = { has_skill: true, wants_to_serve: false, detail: "" };
const DETAIL_DEFAULTS = { detail: "" };

// Details keyed by code from the API's entries (newer API), else from the
// plain items list (older API: no ticks or details, every area a skill).
const detailsFrom = (entries, items, defaults) => {
  const out = {};
  if (Array.isArray(entries)) {
    entries.forEach((e) => {
      const code = codeOf(e);
      if (!code) return;
      out[code] = { ...defaults };
      Object.keys(defaults).forEach((k) => {
        if (e[k] !== undefined && e[k] !== null) out[code][k] = k === "detail" ? e[k] : !!e[k];
      });
    });
  }
  codesOf(items).forEach((code) => {
    if (!out[code]) out[code] = { ...defaults };
  });
  return out;
};

// Keep one details row per chosen code: add defaults, drop removed codes.
const syncDetails = (codes, details, defaults) => {
  Object.keys(details).forEach((code) => {
    if (!codes.includes(code)) delete details[code];
  });
  codes.forEach((code) => {
    if (!details[code]) details[code] = { ...defaults };
  });
};

const hydrate = () => {
  const p = profile.value || {};

  const personal = p.personal || {};
  const pending = Array.isArray(p.pending_changes) ? p.pending_changes : [];
  const pendingValueFor = (field) =>
    pending.find((pc) => pc.field === field)?.new_value ?? null;

  // Review-gated fields: if a pending change exists for a field, seed the
  // form with the pending `new_value` (what the member is asking for), not
  // the current applied value. Otherwise, saving another Personal field
  // would re-send the current applied value, which the API reads as
  // "cancel my pending change on that field."
  //
  // If the member types the current applied value back, that is treated by
  // the API as a deliberate cancel — which is the intended behavior.
  Object.assign(form.personal, {
    first_name: pendingValueFor("first_name") ?? personal.first_name ?? "",
    middle_name: pendingValueFor("middle_name") ?? personal.middle_name ?? "",
    last_name: pendingValueFor("last_name") ?? personal.last_name ?? "",
    phone_number: pendingValueFor("phone_number") ?? personal.phone_number ?? "",
    baptismal_name: personal.baptismal_name || "",
    mother_name: personal.mother_name || "",
    birth_date: personal.birth_date || "",
    sex: personal.sex || "",
  });

  const address = p.address || {};
  Object.assign(form.address, {
    country: codeOf(address.country) || "",
    city: codeOf(address.city) || "",
    city_other: address.city_other || "",
    sub_city: codeOf(address.sub_city) || "",
    sub_city_other: address.sub_city_other || "",
    woreda: address.woreda || "",
    area: address.area || "",
    house_number: address.house_number || "",
    region: address.region || "",
    zip_code: address.zip_code || "",
    address_line: address.address_line || "",
  });

  // Education is a list (current entry first). Fall back to the old single
  // `education` object only if the API did not send `educations`.
  const eduList = Array.isArray(p.educations)
    ? p.educations
    : p.education && p.education.level
      ? [p.education]
      : [];
  form.education.entries = eduList.map((e, i) => ({
    id: e.id,
    _key: e.id ? `edu-${e.id}` : `edu-legacy-${i}`,
    level: codeOf(e.level) || "",
    field: codeOf(e.field) || "",
    field_other: e.field_other || "",
    field_detail: e.field_detail || "",
    school: codeOf(e.school) || "",
    school_other: e.school_other || "",
    is_current: !!e.is_current,
    start_date: e.start_date || "",
    end_date: e.end_date || "",
  }));

  const spir = p.spiritual_education || {};
  form.spiritual_education.items = codesOf(spir.items);
  form.spiritual_education.other = Array.isArray(spir.other)
    ? [...spir.other]
    : [];
  form.spiritual_education.details = detailsFrom(spir.entries, spir.items, DETAIL_DEFAULTS);
  form.spiritual_education.items = Object.keys(form.spiritual_education.details);

  const work = p.work || {};
  Object.assign(form.work, {
    occupation_status: codeOf(work.occupation_status) || "",
    occupation_status_other: work.occupation_status_other || "",
  });
  // Jobs are a list (current job first). Fall back to the old single
  // `work.job_title` only if the API did not send `jobs`.
  const jobList = Array.isArray(p.jobs)
    ? p.jobs
    : work.job_title
      ? [{ job_title: work.job_title }]
      : [];
  form.work.jobs = jobList.map((j, i) => ({
    id: j.id,
    _key: j.id ? `job-${j.id}` : `job-legacy-${i}`,
    job_title: j.job_title || "",
    organization: j.organization || "",
    is_current: !!j.is_current,
    start_date: j.start_date || "",
    end_date: j.end_date || "",
  }));

  const skills = p.skills || {};
  form.skills.areaDetails = detailsFrom(skills.areas, skills.items, AREA_DEFAULTS);
  form.skills.items = Object.keys(form.skills.areaDetails);
  form.skills.other = Array.isArray(skills.other) ? [...skills.other] : [];
  form.skills.availabilityDetails = detailsFrom(skills.availability_entries, skills.availability, DETAIL_DEFAULTS);
  form.skills.availability = Object.keys(form.skills.availabilityDetails);
  form.skills.service_note = skills.service_note || "";

  // take fresh snapshot
  Object.keys(form).forEach((k) => {
    snapshot[k] = JSON.parse(JSON.stringify(form[k]));
    dirty[k] = false;
  });
};

// Watch form → dirty flags
watch(
  form,
  () => {
    Object.keys(form).forEach((k) => {
      dirty[k] = JSON.stringify(form[k]) !== JSON.stringify(snapshot[k]);
    });
  },
  { deep: true },
);

// Ticks and detail boxes follow the chosen areas / items
watch(
  () => [...form.skills.items],
  (codes) => syncDetails(codes, form.skills.areaDetails, AREA_DEFAULTS),
);
watch(
  () => [...form.skills.availability],
  (codes) => syncDetails(codes, form.skills.availabilityDetails, DETAIL_DEFAULTS),
);
watch(
  () => [...form.spiritual_education.items],
  (codes) => syncDetails(codes, form.spiritual_education.details, DETAIL_DEFAULTS),
);

// Occupation "Other" text only belongs to the "other" status
watch(
  () => form.work.occupation_status,
  (status) => {
    if (status !== "other") form.work.occupation_status_other = "";
  },
);

// ------------------------------------------------------------------
// Options helpers
// ------------------------------------------------------------------
const optionsList = (type) => {
  const o = options.value || {};
  return Array.isArray(o[type]) ? o[type] : [];
};

// ------------------------------------------------------------------
// Field error lookup: server keys look like "personal.first_name", "address.sub_city"
// ------------------------------------------------------------------
const fieldError = (dottedKey) => {
  const map = lastValidationErrors.value;
  if (!map) return "";
  const arr = map[dottedKey];
  return Array.isArray(arr) && arr.length ? arr[0] : "";
};

const clearFieldError = (dottedKey) => {
  const map = lastValidationErrors.value;
  if (map && map[dottedKey]) {
    delete map[dottedKey];
    // Force reactivity: reassign
    lastValidationErrors.value = { ...map };
    // Also clear the section-level error
    const section = dottedKey.split(".")[0];
    if (sectionError[section]) sectionError[section] = "";
  }
};

// ------------------------------------------------------------------
// Pending / rejection helpers (per field)
// ------------------------------------------------------------------
const pendingFor = (field) => getPendingFor(field);
const rejectionFor = (field) => getLatestRejectionFor(field);
const pendingTitle = (field) => {
  const p = getPendingFor(field);
  return p ? `Requested: ${p.new_value}` : "";
};

// ------------------------------------------------------------------
// Summary lines (collapsed header text)
// ------------------------------------------------------------------
const personalSummary = computed(() => {
  const parts = [
    form.personal.first_name,
    form.personal.middle_name,
    form.personal.last_name,
  ].filter(Boolean);
  if (!parts.length) return t("profile.summary.empty");
  return (
    parts.join(" ") +
    (form.personal.phone_number ? ` · ${form.personal.phone_number}` : "")
  );
});

const addressSummary = computed(() => {
  if (!form.address.country && !form.address.city_other)
    return t("profile.summary.empty");
  const parts = [];
  const sub = form.address.sub_city
    ? optionsList("sub_city").find((o) => o.code === form.address.sub_city)
        ?.label || form.address.sub_city
    : form.address.sub_city_other;
  if (sub) parts.push(sub);
  if (form.address.city_other) parts.push(form.address.city_other);
  else if (form.address.city) parts.push(form.address.city);
  if (form.address.country) parts.push(form.address.country);
  return parts.join(" · ") || t("profile.summary.empty");
});

const educationSummary = computed(() => {
  const list = form.education.entries;
  if (!list.length) return t("profile.summary.empty");
  const main = list.find((e) => e.is_current) || list[0];
  const lvl = main.level
    ? optionsList("education_level").find((o) => o.code === main.level)
        ?.label || main.level
    : "";
  const extra = list.length > 1 ? ` (+${list.length - 1})` : "";
  return (lvl || t("profile.summary.empty")) + extra;
});

const spiritualSummary = computed(() => {
  const count =
    form.spiritual_education.items.length +
    form.spiritual_education.other.length;
  return count
    ? `${count} ${count === 1 ? "item" : "items"}`
    : t("profile.summary.empty");
});

const workSummary = computed(() => {
  const st = form.work.occupation_status
    ? optionsList("occupation_status").find(
        (o) => o.code === form.work.occupation_status,
      )?.label || form.work.occupation_status
    : "";
  // When status is "other", prefer the typed text in the summary.
  const statusText =
    form.work.occupation_status === "other" && form.work.occupation_status_other
      ? form.work.occupation_status_other
      : st;
  const job = form.work.jobs.find((j) => j.is_current) || form.work.jobs[0];
  return (
    [statusText, job?.job_title].filter(Boolean).join(" · ") ||
    t("profile.summary.empty")
  );
});

const skillsSummary = computed(() => {
  const n = form.skills.items.length + form.skills.other.length;
  return n ? t("profile.areas.count", { n }) : t("profile.summary.empty");
});

// ------------------------------------------------------------------
// Address: is Ethiopia?
// ------------------------------------------------------------------
const isEthiopia = computed(() => form.address.country === "ET");

// Departments
const currentDepartments = computed(() => {
  const list = profile.value?.current_departments;
  return Array.isArray(list) ? list : [];
});

// Imported skills reference
const importedSkillsNote = computed(() => {
  const imp = profile.value?.imported;
  return imp && imp.skills ? imp.skills : "";
});

// ------------------------------------------------------------------
// Payload builders (convert '' → null where the API expects codes)
// ------------------------------------------------------------------
const nullIfEmpty = (v) => (v === "" || v === undefined ? null : v);

const personalPayload = () => ({
  first_name: nullIfEmpty(form.personal.first_name),
  middle_name: nullIfEmpty(form.personal.middle_name),
  last_name: nullIfEmpty(form.personal.last_name),
  phone_number: nullIfEmpty(form.personal.phone_number),
  baptismal_name: nullIfEmpty(form.personal.baptismal_name),
  mother_name: nullIfEmpty(form.personal.mother_name),
  birth_date: nullIfEmpty(form.personal.birth_date),
  sex: nullIfEmpty(form.personal.sex),
});

const addressPayload = () => {
  if (isEthiopia.value) {
    return {
      country: nullIfEmpty(form.address.country),
      city: nullIfEmpty(form.address.city),
      city_other: nullIfEmpty(form.address.city_other),
      sub_city: nullIfEmpty(form.address.sub_city),
      sub_city_other: nullIfEmpty(form.address.sub_city_other),
      woreda: nullIfEmpty(form.address.woreda),
      area: nullIfEmpty(form.address.area),
      house_number: nullIfEmpty(form.address.house_number),
      region: null,
      zip_code: null,
      address_line: null,
    };
  }
  return {
    country: nullIfEmpty(form.address.country),
    city: null,
    city_other: nullIfEmpty(form.address.city_other),
    sub_city: null,
    sub_city_other: null,
    woreda: null,
    area: null,
    house_number: null,
    region: nullIfEmpty(form.address.region),
    zip_code: nullIfEmpty(form.address.zip_code),
    address_line: nullIfEmpty(form.address.address_line),
  };
};

// The API wants the WHOLE list: entries with an id are updated, entries
// without one are added, entries left out are deleted.
const educationsPayload = () =>
  form.education.entries
    .filter(
      (e) =>
        e.id ||
        e.level ||
        e.field ||
        e.field_other ||
        e.field_detail ||
        e.school ||
        e.school_other ||
        e.start_date ||
        e.end_date ||
        e.is_current,
    ) // a completely blank new entry is not sent
    .map((e) => {
      const item = {};
      if (e.id) item.id = e.id;
      item.level = nullIfEmpty(e.level);
      // School (1-12) has no field of study
      const noField = e.level === "school";
      item.field = noField ? null : nullIfEmpty(e.field);
      item.field_other = noField ? null : nullIfEmpty(e.field_other);
      item.field_detail = noField ? null : nullIfEmpty((e.field_detail || "").trim());
      item.school = nullIfEmpty(e.school);
      item.school_other = nullIfEmpty(e.school_other);
      item.is_current = !!e.is_current;
      item.start_date = nullIfEmpty(e.start_date);
      item.end_date = e.is_current ? null : nullIfEmpty(e.end_date);
      return item;
    });

// Chosen codes with their detail: [{ code, detail }]
const detailEntries = (codes, details) =>
  codes.map((code) => ({
    code,
    detail: nullIfEmpty((details[code]?.detail || "").trim()),
  }));

// `entries` is the current API shape; `items` (codes only) is sent too, so
// the page also works against an API that does not know `entries` yet.
const spiritualPayload = () => ({
  entries: detailEntries(form.spiritual_education.items, form.spiritual_education.details),
  items: [...form.spiritual_education.items],
  other: [...form.spiritual_education.other],
});

const workPayload = () => ({
  occupation_status: nullIfEmpty(form.work.occupation_status),
  occupation_status_other:
    form.work.occupation_status === "other"
      ? nullIfEmpty(form.work.occupation_status_other)
      : null,
});

// The API wants the WHOLE job list: entries with an id are updated, entries
// without one are added, entries left out are deleted.
const jobsPayload = () =>
  form.work.jobs
    .filter(
      (j) =>
        j.id ||
        j.job_title ||
        j.organization ||
        j.start_date ||
        j.end_date ||
        j.is_current,
    ) // a completely blank new entry is not sent
    .map((j) => {
      const item = {};
      if (j.id) item.id = j.id;
      item.job_title = nullIfEmpty(j.job_title);
      item.organization = nullIfEmpty(j.organization);
      item.is_current = !!j.is_current;
      item.start_date = nullIfEmpty(j.start_date);
      item.end_date = j.is_current ? null : nullIfEmpty(j.end_date);
      return item;
    });

// `areas` / `availability_entries` are the current API shape; `items` /
// `availability` (codes only) are sent too for an API that does not know them.
const skillsPayload = () => ({
  areas: form.skills.items.map((code) => {
    const d = form.skills.areaDetails[code] || AREA_DEFAULTS;
    return {
      code,
      has_skill: !!d.has_skill,
      wants_to_serve: !!d.wants_to_serve,
      detail: nullIfEmpty((d.detail || "").trim()),
    };
  }),
  items: [...form.skills.items],
  other: [...form.skills.other],
  availability_entries: detailEntries(form.skills.availability, form.skills.availabilityDetails),
  availability: [...form.skills.availability],
  service_note: nullIfEmpty(form.skills.service_note),
});

// Every area needs "I have this skill", "I want to serve on this", or both.
const areasMissingTick = () =>
  form.skills.items.some((code) => {
    const d = form.skills.areaDetails[code];
    return d && !d.has_skill && !d.wants_to_serve;
  });

const runSave = async (
  section, // which card is saving (for the spinner and the error line)
  sections, // what to send, e.g. { work: {...}, jobs: [...] }
  successKey = "profile.savedSuccess",
) => {
  savingSection.value = section;
  sectionError[section] = "";
  try {
    await saveSections(sections);
    hydrate();

    // If the payload touched review-gated fields, refresh the change requests
    // so the "My change requests" list at the bottom updates immediately.
    // Cheap call, and it also catches the case where the API just cancelled
    // a previous pending on the same field.
    await loadChangeRequests().catch(() => {});

    success(t(successKey));
  } catch (err) {
    if (err.status === 422 && err.errors) {
      sectionError[section] = t("profile.saveError");
    } else if (err.status === 401) {
      toastError(t("profile.sessionExpired"));
    } else {
      toastError(t("profile.networkError"));
    }
  } finally {
    savingSection.value = "";
  }
};
const savePersonal = () =>
  runSave("personal", { personal: personalPayload() }, "profile.savedPending");
const saveAddress = () => runSave("address", { address: addressPayload() });
const saveEducation = () =>
  runSave("education", { educations: educationsPayload() });
const saveSpiritual = () =>
  runSave("spiritual_education", {
    spiritual_education: spiritualPayload(),
  });
// Occupation status and the job list are saved together in one request.
const saveWork = () =>
  runSave("work", { work: workPayload(), jobs: jobsPayload() });
const saveSkills = () => {
  if (areasMissingTick()) {
    sectionError.skills = t("profile.areas.tickOne");
    return;
  }
  return runSave("skills", { skills: skillsPayload() });
};

// ------------------------------------------------------------------
// Confirm profile
// ------------------------------------------------------------------
const onConfirmProfile = async () => {
  try {
    await confirmProfile();
    success(t("profile.confirmSuccess"));
  } catch (err) {
    toastError(t("profile.confirmError"));
  }
};

const personalCard = ref(null);
const onEditImported = () => {
  personalCard.value?.expand?.();
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

// ------------------------------------------------------------------
// Bootstrap
// ------------------------------------------------------------------
const bootstrap = async () => {
  initialLoading.value = true;
  loadError.value = "";
  try {
    await loadOptions(); // full list, cached by locale
    await loadProfile();
    hydrate();
    await loadChangeRequests().catch(() => {});
  } catch (err) {
    if (err.status === 401) {
      loadError.value = t("profile.sessionExpired");
    } else {
      loadError.value = t("profile.loadError");
    }
  } finally {
    initialLoading.value = false;
  }
};

onMounted(bootstrap);

// Re-hydrate if the profile is reloaded externally
watch(profile, () => {
  if (profile.value) hydrate();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3971 0%, #0d1f40 100%);
  color: #fff;
  padding: 20px 16px 110px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-top: 8px;
}
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}
.header-text {
  flex: 1;
  min-width: 0;
}
.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #ffc125;
  margin: 0;
}
.page-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #a0b3d9;
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 60px 20px;
  color: #a0b3d9;
  text-align: center;
}
.error-text {
  color: #ff8a80;
}

.btn-primary {
  background: #ffc125;
  color: #1e3971;
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
}

.sections-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 480px) {
  .field-grid {
    grid-template-columns: 1fr 1fr;
  }
  .field-full {
    grid-column: 1 / -1;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #e6ecf7;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.required-asterisk {
  color: #ff8a80;
  font-weight: 800;
}

.text-input,
.text-area {
  width: 100%;
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
.text-input::placeholder,
.text-area::placeholder {
  color: #a0b3d9;
}
.text-input:focus,
.text-area:focus {
  border-color: #ffc125;
  background: rgba(255, 255, 255, 0.1);
}
.text-input.error {
  border-color: #ff8a80;
}
.text-area {
  resize: vertical;
  min-height: 80px;
}

.segmented {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}
.segmented button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #e6ecf7;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.segmented button.active {
  background: #ffc125;
  color: #1e3971;
}

.field-hint {
  font-size: 12px;
  color: #ffc125;
  margin: 0;
}
.field-error {
  font-size: 12px;
  color: #ff8a80;
  margin: 0;
}

.office-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: #a0b3d9;
  font-style: italic;
}

/* Jobs list inside the Work card */
.jobs-block {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.jobs-heading {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

/* Departments (read-only) */
.departments-card {
  background: #2b4b8f;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.dept-title {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 700;
}
.dept-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.dept-chip {
  background: rgba(255, 193, 37, 0.15);
  color: #ffc125;
  border: 1px solid rgba(255, 193, 37, 0.4);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
}
.dept-empty {
  color: #a0b3d9;
  font-size: 14px;
  margin: 0 0 8px;
}
.dept-hint {
  color: #a0b3d9;
  font-size: 12px;
  margin: 10px 0 0;
  font-style: italic;
}

.btn-class-change {
  margin-top: 14px;
  width: 100%;
  background: #ffc125;
  color: #1e3971;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ffc125;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>