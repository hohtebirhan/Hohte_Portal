// Run with: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { detailsFrom } from "../app/utils/profileDetails.js";

const areaDefaults = (code) =>
  code === "open_to_any_area"
    ? { has_skill: false, wants_to_serve: true, detail: "" }
    : { has_skill: true, wants_to_serve: false, detail: "" };

test("areas keep the saved ticks and detail from the API", () => {
  const entries = [
    { code: "singing", has_skill: false, wants_to_serve: true, detail: "Mezmur at Sunday service" },
    { code: "graphic_design", has_skill: true, wants_to_serve: true, detail: null },
  ];

  assert.deepEqual(detailsFrom(entries, [], areaDefaults), {
    singing: { has_skill: false, wants_to_serve: true, detail: "Mezmur at Sunday service" },
    graphic_design: { has_skill: true, wants_to_serve: true, detail: "" },
  });
});

test("an area the API sends without ticks gets the defaults", () => {
  assert.deepEqual(detailsFrom([{ code: "open_to_any_area" }], [], areaDefaults), {
    open_to_any_area: { has_skill: false, wants_to_serve: true, detail: "" },
  });
});

test("the older codes-only list still works", () => {
  assert.deepEqual(detailsFrom(undefined, ["singing"], areaDefaults), {
    singing: { has_skill: true, wants_to_serve: false, detail: "" },
  });
});

test("lists with an object of defaults keep their detail", () => {
  assert.deepEqual(detailsFrom([{ code: "saturday", detail: "Afternoons" }], [], { detail: "" }), {
    saturday: { detail: "Afternoons" },
  });
});
