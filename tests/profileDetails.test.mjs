// Run with: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { detailsFrom } from "../app/utils/profileDetails.js";
import { areaDefaults } from "../app/config/profileAreas.js";


test("areas keep the saved ticks and detail from the API", () => {
  const entries = [
    { code: "singing", has_skill: false, wants_to_serve: true, detail: "Mezmur at Sunday service", years: 0 },
    { code: "graphic_design", has_skill: true, wants_to_serve: true, detail: null },
  ];

  assert.deepEqual(detailsFrom(entries, [], areaDefaults), {
    singing: { has_skill: false, wants_to_serve: true, detail: "Mezmur at Sunday service", years: 0 },
    graphic_design: { has_skill: true, wants_to_serve: true, detail: "", years: 0 },
  });
});

test("an area the API sends without ticks gets the defaults", () => {
  assert.deepEqual(detailsFrom([{ code: "open_to_any_area" }], [], areaDefaults), {
    open_to_any_area: { has_skill: false, wants_to_serve: true, detail: "", years: 0 },
  });
});

test("a newly chosen area starts with both ticks and 0 years", () => {
  assert.deepEqual(detailsFrom(undefined, ["singing"], areaDefaults), {
    singing: { has_skill: true, wants_to_serve: true, detail: "", years: 0 },
  });
});

test("keeps the saved years as a number", () => {
  assert.deepEqual(detailsFrom([{ code: "singing", has_skill: true, wants_to_serve: false, detail: null, years: 4 }], [], areaDefaults), {
    singing: { has_skill: true, wants_to_serve: false, detail: "", years: 4 },
  });
});

test("typed-in skills are matched by their text", () => {
  const entries = [{ text: "Pottery", has_skill: true, wants_to_serve: true, detail: "Clay pots", years: 2 }];
  assert.deepEqual(detailsFrom(entries.map((e) => ({ ...e, code: e.text })), ["Pottery", "Weaving"], areaDefaults), {
    Pottery: { has_skill: true, wants_to_serve: true, detail: "Clay pots", years: 2 },
    Weaving: { has_skill: true, wants_to_serve: true, detail: "", years: 0 },
  });
});

test("lists with an object of defaults keep their detail", () => {
  assert.deepEqual(detailsFrom([{ code: "saturday", detail: "Afternoons" }], [], { detail: "" }), {
    saturday: { detail: "Afternoons" },
  });
});
