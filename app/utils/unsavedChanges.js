// utils/unsavedChanges.js
// When a profile section closes, and which sections still have changes the
// member has not saved (for the sticky reminder and the leave warnings).

// Close a section only after a save that worked; undoing a change (typing a
// letter and deleting it) leaves it open.
export const shouldCollapseAfterChange = ({ wasSaving, saving, dirty }) =>
  !!wasSaving && !saving && !dirty;

// Keys of the sections with unsaved changes, in the order they appear.
export const unsavedSections = (dirty, order) =>
  order.filter((key) => !!(dirty || {})[key]);
