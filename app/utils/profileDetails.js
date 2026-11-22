// utils/profileDetails.js
// Detail rows (and, for areas, the two ticks) for the profile's
// multi-select lists, keyed by option code. Shared by the profile page;
// a plain module so `node --test tests/` can check it.

export const codeOf = (v) => {
  if (v == null) return "";
  if (typeof v === "object")
    return v.code !== undefined ? v.code : v.id !== undefined ? v.id : "";
  return v;
};

export const codesOf = (arr) =>
  Array.isArray(arr) ? arr.map(codeOf).filter(Boolean) : [];

// `defaults` is an object, or a function of the code (areas).
export const defaultsFor = (defaults, code) =>
  typeof defaults === "function" ? defaults(code) : { ...defaults };

// Details keyed by code from the API's entries (newer API), else from the
// plain items list (older API: no ticks or details, every area a skill).
export const detailsFrom = (entries, items, defaults) => {
  const out = {};
  if (Array.isArray(entries)) {
    entries.forEach((e) => {
      const code = codeOf(e);
      if (!code) return;
      out[code] = defaultsFor(defaults, code);
      // Keys come from the defaults object; for areas `defaults` is a
      // function, so read them from the row it returns.
      Object.keys(out[code]).forEach((k) => {
        if (e[k] === undefined || e[k] === null) return;
        if (k === "detail") out[code][k] = e[k];
        else if (k === "years") out[code][k] = Number(e[k]) || 0;
        else out[code][k] = !!e[k];
      });
    });
  }
  codesOf(items).forEach((code) => {
    if (!out[code]) out[code] = defaultsFor(defaults, code);
  });
  return out;
};

// Keep one details row per chosen code: add defaults, drop removed codes.
export const syncDetails = (codes, details, defaults) => {
  Object.keys(details).forEach((code) => {
    if (!codes.includes(code)) delete details[code];
  });
  codes.forEach((code) => {
    if (!details[code]) details[code] = defaultsFor(defaults, code);
  });
};
