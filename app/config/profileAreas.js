// config/profileAreas.js
// Rules for the "areas" list (skills and where a member wants to serve),
// shared by the profile page and OptionDetailsList.

// Areas a member can only want to serve on ("I have this skill" makes no
// sense for them). Same list as ProfileOption::AREAS_WITHOUT_SKILL in the ERP.
export const AREAS_WITHOUT_SKILL = ["open_to_any_area"];

// A newly chosen area (listed or typed in) starts with both ticks on and 0
// years of experience; an area without a skill only wants to serve.
export const areaDefaults = (code) =>
  AREAS_WITHOUT_SKILL.includes(code)
    ? { has_skill: false, wants_to_serve: true, detail: "", years: 0 }
    : { has_skill: true, wants_to_serve: true, detail: "", years: 0 };

// Years of experience a member can enter for a skill.
export const MAX_YEARS = 60;

// Every area needs "I have this skill", "I want to serve on this", or both;
// an area without a skill needs "I want to serve on this".
export const areaMissingTick = (code, d) => {
  if (!d) return false;
  if (AREAS_WITHOUT_SKILL.includes(code)) return !d.wants_to_serve;
  return !d.has_skill && !d.wants_to_serve;
};
