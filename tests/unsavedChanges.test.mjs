import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldCollapseAfterChange, unsavedSections } from "../app/utils/unsavedChanges.js";

test("a section stays open when the member undoes a change", () => {
  // typed "a" then deleted it: the section is back to what was saved
  assert.equal(shouldCollapseAfterChange({ wasSaving: false, saving: false, dirty: false }), false);
});

test("a section closes after a save that worked", () => {
  assert.equal(shouldCollapseAfterChange({ wasSaving: true, saving: false, dirty: false }), true);
});

test("a section stays open when the save failed", () => {
  assert.equal(shouldCollapseAfterChange({ wasSaving: true, saving: false, dirty: true }), false);
});

test("lists the sections with unsaved changes in page order", () => {
  const dirty = { skills: true, personal: false, address: true, work: false };
  assert.deepEqual(unsavedSections(dirty, ["personal", "address", "work", "skills"]), ["address", "skills"]);
  assert.deepEqual(unsavedSections({}, ["personal"]), []);
});
