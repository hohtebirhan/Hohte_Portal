/*! @hohte/ec-date-picker v1.0.1 | Ethiopian / Gregorian date picker | no dependencies */
(function (root) {
/**
 * Ethiopian / Gregorian date conversion.
 *
 * Both calendars are converted through the Julian Day Number (JDN), so they
 * share one day count. Taken from the Hohte ERP (public/assets/js/ec-date-picker.js).
 *
 * Date objects are { year, month, day } with month 1-12 (Gregorian) or 1-13
 * (Ethiopian, 13 = Pagume).
 */
const EC_EPOCH_JDN = 1723856;
const UNIX_EPOCH_JDN = 2440588;
const DAY_MS = 86400000;
const DATE_PATTERN = /^\s*(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\s*$/;
const ISO_PATTERN = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/;

const EthiopianCalendar = {
    ecMonthNames: {
        am: ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'],
        en: ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'],
    },
    gcMonthNames: {
        am: ['ጃንዋሪ', 'ፌብሩዋሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    },

    daysInEcMonth(year, month) {
        if (month === 13) {
            return year % 4 === 3 ? 6 : 5;
        }

        return 30;
    },

    daysInGcMonth(year, month) {
        return new Date(Date.UTC(year, month, 0)).getUTCDate();
    },

    ecToJdn(year, month, day) {
        return EC_EPOCH_JDN + 365 + 365 * (year - 1) + Math.floor(year / 4) + 30 * month + day - 31;
    },

    jdnToEc(jdn) {
        const remainder = (jdn - EC_EPOCH_JDN) % 1461;
        const dayOfYear = (remainder % 365) + 365 * Math.floor(remainder / 1460);

        return {
            year: 4 * Math.floor((jdn - EC_EPOCH_JDN) / 1461) + Math.floor(remainder / 365) - Math.floor(remainder / 1460),
            month: Math.floor(dayOfYear / 30) + 1,
            day: (dayOfYear % 30) + 1,
        };
    },

    gcToJdn(year, month, day) {
        return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS) + UNIX_EPOCH_JDN;
    },

    jdnToGc(jdn) {
        const date = new Date((jdn - UNIX_EPOCH_JDN) * DAY_MS);

        return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
    },

    /** Gregorian { year, month, day } to Ethiopian. */
    toEthiopian(date) {
        return EthiopianCalendar.jdnToEc(EthiopianCalendar.gcToJdn(date.year, date.month, date.day));
    },

    /** Ethiopian { year, month, day } to Gregorian. */
    toGregorian(date) {
        return EthiopianCalendar.jdnToGc(EthiopianCalendar.ecToJdn(date.year, date.month, date.day));
    },

    /** 0 = Sunday ... 6 = Saturday. */
    weekday(jdn) {
        return (jdn + 1) % 7;
    },

    todayJdn() {
        const now = new Date();

        return EthiopianCalendar.gcToJdn(now.getFullYear(), now.getMonth() + 1, now.getDate());
    },

    /** Ethiopian date as D-M-YYYY (the format the ERP stores), e.g. 1-1-2017. */
    formatEc(date) {
        return date.day + '-' + date.month + '-' + date.year;
    },

    /** Gregorian date as DD-MM-YYYY, for display. */
    formatGc(date) {
        return String(date.day).padStart(2, '0') + '-' + String(date.month).padStart(2, '0') + '-' + date.year;
    },

    /** Gregorian date as YYYY-MM-DD, the format APIs send and store. */
    formatIso(date) {
        return date.year + '-' + String(date.month).padStart(2, '0') + '-' + String(date.day).padStart(2, '0');
    },

    parseEc(text) {
        return EthiopianCalendar.parse(text, 13, EthiopianCalendar.daysInEcMonth);
    },

    parseGc(text) {
        return EthiopianCalendar.parse(text, 12, EthiopianCalendar.daysInGcMonth);
    },

    /** YYYY-MM-DD to { year, month, day }, or null when it is not a real date. */
    parseIso(text) {
        const match = ISO_PATTERN.exec(text || '');
        if (!match) {
            return null;
        }

        return EthiopianCalendar.validDate(Number(match[1]), Number(match[2]), Number(match[3]), 12, EthiopianCalendar.daysInGcMonth);
    },

    isoToJdn(text) {
        const date = EthiopianCalendar.parseIso(text);

        return date ? EthiopianCalendar.gcToJdn(date.year, date.month, date.day) : null;
    },

    jdnToIso(jdn) {
        return EthiopianCalendar.formatIso(EthiopianCalendar.jdnToGc(jdn));
    },

    /**
     * Shapes typed text as DD-MM-YYYY: digits fill day, month and year, and
     * the hyphen after a full day or month is added for you. A typed hyphen
     * (or / or .) still ends a part early, so 1-5-2010 works too.
     * addTrailing is false while deleting, so backspace can remove a hyphen.
     */
    maskDate(text, addTrailing) {
        const limits = [2, 2, 4];
        const parts = [''];
        for (const ch of String(text || '')) {
            const last = parts.length - 1;
            if (/\d/.test(ch)) {
                if (parts[last].length < limits[last]) {
                    parts[last] += ch;
                } else if (last < 2) {
                    parts.push(ch);
                }
            } else if (/[-/.\s]/.test(ch) && parts[last] !== '' && last < 2) {
                parts.push('');
            }
        }

        const end = parts.length - 1;
        if (addTrailing && end < 2 && parts[end].length === limits[end]) {
            parts.push('');
        }

        return parts.join('-');
    },

    parse(text, monthsInYear, daysInMonth) {
        const match = DATE_PATTERN.exec(text || '');
        if (!match) {
            return null;
        }

        return EthiopianCalendar.validDate(Number(match[3]), Number(match[2]), Number(match[1]), monthsInYear, daysInMonth);
    },

    validDate(year, month, day, monthsInYear, daysInMonth) {
        if (month < 1 || month > monthsInYear || day < 1 || day > daysInMonth(year, month)) {
            return null;
        }

        return { year, month, day };
    },
};


const Cal = EthiopianCalendar;
/**
 * <ec-date-picker>: one date, shown in both the Ethiopian and the Gregorian
 * calendar, with a calendar popup for either.
 *
 *   <ec-date-picker name="start_date" value="2024-09-11"></ec-date-picker>
 *
 * The value is always the Gregorian date as YYYY-MM-DD ('' when empty), so it
 * can go straight to an API or a form. `ecValue` gives the Ethiopian date as
 * D-M-YYYY. Works in plain HTML, Vue / Nuxt, Laravel Blade / Livewire; no
 * dependencies. See README.md.
 */


const TEXT = {
    am: {
        ec: 'የኢትዮጵያ ቀን (ዓ.ም)',
        gc: 'የፈረንጅ ቀን (G.C.)',
        ecTab: 'ኢትዮጵያ',
        gcTab: 'ፈረንጅ',
        clear: 'አጽዳ',
        previous: 'ያለፈው',
        next: 'የሚቀጥለው',
        open: 'ቀን መምረጫ ክፈት',
        weekdays: ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'ዓር', 'ቅዳ'],
    },
    en: {
        ec: 'Ethiopian date (E.C.)',
        gc: 'Gregorian date (G.C.)',
        ecTab: 'Ethiopian',
        gcTab: 'Gregorian',
        clear: 'Clear',
        previous: 'Previous',
        next: 'Next',
        open: 'Open calendar',
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
};

const CALENDAR_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></svg>';

const STYLE = `
:host {
    --ecdp-accent: #cb0c9f;
    --ecdp-text: #344767;
    --ecdp-muted: #8392ab;
    --ecdp-border: #d2d6da;
    --ecdp-bg: #fff;
    --ecdp-soft: #f8f9fa;
    --ecdp-danger: #ea0606;
    --ecdp-radius: 0.5rem;
    display: block;
    position: relative;
    font-family: inherit;
    color: var(--ecdp-text);
}
:host([hidden]) { display: none; }
* { box-sizing: border-box; font-family: inherit; }
button { cursor: pointer; font: inherit; }
button:disabled { cursor: not-allowed; }
.fields { display: flex; align-items: flex-end; gap: 0.5rem; }
.field { flex: 3 1 0; min-width: 0; }
.field.secondary { flex-grow: 2; }
.caption { display: block; margin-bottom: 0.25rem; font-size: 0.75rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.secondary .caption { font-weight: 400; color: var(--ecdp-muted); }
.box { display: flex; align-items: stretch; border: 1px solid var(--ecdp-border); border-radius: var(--ecdp-radius); background: var(--ecdp-bg); overflow: hidden; }
.main .box { border-color: var(--ecdp-accent); box-shadow: 0 0 0 1px var(--ecdp-accent); }
.secondary .box { background: var(--ecdp-soft); }
.box:focus-within { box-shadow: 0 0 0 2px var(--ecdp-accent); }
.box.invalid { border-color: var(--ecdp-danger); box-shadow: 0 0 0 1px var(--ecdp-danger); }
.icon { flex: 0 0 auto; display: flex; align-items: center; padding: 0 0.6rem; color: var(--ecdp-muted); background: transparent; border: 0; }
input { flex: 1 1 auto; min-width: 0; width: 100%; padding: 0.55rem 0.6rem 0.55rem 0; font-size: 1rem; color: inherit; background: transparent; border: 0; outline: 0; }
.main input { font-weight: 600; }
.secondary input { font-size: 0.875rem; color: var(--ecdp-muted); }
.swap { flex: 0 0 auto; padding-bottom: 0.7rem; color: var(--ecdp-muted); }
.popup { position: absolute; top: calc(100% + 0.5rem); left: 0; z-index: 1060; width: 340px; max-width: calc(100vw - 16px); padding: 1rem; background: var(--ecdp-bg); border: 1px solid #e9ecef; border-radius: 0.75rem; box-shadow: 0 20px 27px rgba(0, 0, 0, 0.12); }
.popup[hidden] { display: none; }
.tabs { display: flex; margin-bottom: 1rem; border: 1px solid var(--ecdp-border); border-radius: var(--ecdp-radius); overflow: hidden; }
.tab { flex: 1 1 0; padding: 0.5rem; font-size: 0.875rem; color: var(--ecdp-muted); background: var(--ecdp-bg); border: 0; }
.tab + .tab { border-left: 1px solid var(--ecdp-border); }
.tab.active { font-weight: 700; color: var(--ecdp-accent); background: rgba(203, 12, 159, 0.08); }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.nav, .title { padding: 0.5rem 0.75rem; color: var(--ecdp-text); background: transparent; border: 0; border-radius: 0.375rem; }
.title { font-weight: 700; }
.nav:hover:not(:disabled), .title:hover { background: var(--ecdp-soft); }
.nav:disabled { opacity: 0.3; }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 1rem; }
.grid.wide { grid-template-columns: repeat(3, 1fr); }
.weekday { padding: 0.25rem 0; font-size: 0.75rem; font-weight: 600; color: var(--ecdp-muted); text-align: center; white-space: nowrap; }
.cell { height: 36px; font-size: 0.875rem; font-weight: 600; color: var(--ecdp-text); white-space: nowrap; background: transparent; border: 1px solid transparent; border-radius: var(--ecdp-radius); }
.cell.blank { visibility: hidden; }
.cell:hover:not(:disabled) { background: var(--ecdp-soft); }
.cell.outside, .cell:disabled { color: #c2c8d1; }
.cell.today { border-color: var(--ecdp-accent); }
.cell.selected, .cell.selected:hover { color: #fff; background: var(--ecdp-accent); }
.clear { width: 100%; padding: 0.5rem; font-size: 0.875rem; color: var(--ecdp-text); background: var(--ecdp-bg); border: 1px solid var(--ecdp-border); border-radius: var(--ecdp-radius); }
:host([disabled]) .box { opacity: 0.6; }
@media (max-width: 575.98px) {
    .fields { flex-wrap: wrap; }
    .field { flex-basis: 100%; }
    .swap { display: none; }
}
`;

const BaseElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

class EcDatePicker extends BaseElement {
    static get observedAttributes() {
        return ['value', 'min', 'max', 'max-today', 'default-mode', 'lang', 'disabled', 'name', 'ec-label', 'gc-label'];
    }

    constructor() {
        super();
        this.jdn = null;
        this.isOpen = false;
        this.mode = 'ec';
        this.view = 'days';
        this.viewYear = 0;
        this.viewMonth = 1;
        this.yearPageStart = 0;
        this.selectedJdn = null;
        this.onDocumentPointerDown = this.onDocumentPointerDown.bind(this);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<style>${STYLE}</style>
            <div class="fields">
                <div class="field main">
                    <span class="caption" data-caption="ec"></span>
                    <div class="box" part="ec-box">
                        <button type="button" class="icon" data-toggle="ec">${CALENDAR_ICON}</button>
                        <input type="text" data-input="ec" part="ec-input" inputmode="numeric" maxlength="10" autocomplete="off" placeholder="DD-MM-YYYY">
                    </div>
                </div>
                <span class="swap" aria-hidden="true">&#8644;</span>
                <div class="field secondary">
                    <span class="caption" data-caption="gc"></span>
                    <div class="box" part="gc-box">
                        <button type="button" class="icon" data-toggle="gc">${CALENDAR_ICON}</button>
                        <input type="text" data-input="gc" part="gc-input" inputmode="numeric" maxlength="10" autocomplete="off" placeholder="DD-MM-YYYY">
                    </div>
                </div>
            </div>
            <div class="popup" part="popup" hidden>
                <div class="tabs">
                    <button type="button" class="tab" data-mode="ec"></button>
                    <button type="button" class="tab" data-mode="gc"></button>
                </div>
                <div class="header">
                    <button type="button" class="nav" data-nav="-1">&#8249;</button>
                    <button type="button" class="title" data-zoom></button>
                    <button type="button" class="nav" data-nav="1">&#8250;</button>
                </div>
                <div class="grid" data-grid></div>
                <button type="button" class="clear" data-clear></button>
            </div>`;

        const $ = (selector) => this.shadowRoot.querySelector(selector);
        this.ecInput = $('[data-input="ec"]');
        this.gcInput = $('[data-input="gc"]');
        this.popup = $('.popup');
        this.grid = $('[data-grid]');

        this.shadowRoot.addEventListener('click', (event) => this.onClick(event));
        this.shadowRoot.addEventListener('input', (event) => this.onTyping(event));
        this.shadowRoot.addEventListener('focusout', (event) => this.onBlur(event));
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        // Taps in the calendar keep focus in the date box (Safari does not focus buttons on tap).
        this.popup.addEventListener('pointerdown', (event) => event.preventDefault());
        this.ecInput.addEventListener('focus', () => this.show('ec'));
        this.gcInput.addEventListener('focus', () => this.show('gc'));
    }

    connectedCallback() {
        // A framework may set .value before this element was defined.
        for (const property of ['value', 'ecValue']) {
            if (Object.prototype.hasOwnProperty.call(this, property)) {
                const early = this[property];
                delete this[property];
                this[property] = early;
            }
        }
        this.mode = this.defaultMode;
        this.applyLabels();
        this.syncHiddenInput();
        document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    }

    disconnectedCallback() {
        document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.setJdn(Cal.isoToJdn(newValue), null);
        } else if (name === 'lang' || name === 'ec-label' || name === 'gc-label') {
            this.applyLabels();
        } else if (name === 'disabled') {
            this.ecInput.disabled = this.gcInput.disabled = newValue !== null;
            this.shadowRoot.querySelectorAll('.icon').forEach((icon) => { icon.disabled = newValue !== null; });
            if (newValue !== null) {
                this.close();
            }
        } else if (name === 'name') {
            this.syncHiddenInput();
        }
        if (this.isOpen) {
            this.render();
        }
    }

    /** Gregorian date as YYYY-MM-DD, or '' when empty. */
    get value() {
        return this.jdn === null ? '' : Cal.jdnToIso(this.jdn);
    }

    set value(iso) {
        this.setJdn(Cal.isoToJdn(iso), null);
    }

    /** Ethiopian date as D-M-YYYY, or '' when empty. */
    get ecValue() {
        return this.jdn === null ? '' : Cal.formatEc(Cal.jdnToEc(this.jdn));
    }

    set ecValue(text) {
        const date = Cal.parseEc(text);
        this.setJdn(date ? Cal.ecToJdn(date.year, date.month, date.day) : null, null);
    }

    /** { gc: {year, month, day}, ec: {year, month, day} }, or null when empty. */
    get date() {
        return this.jdn === null ? null : { gc: Cal.jdnToGc(this.jdn), ec: Cal.jdnToEc(this.jdn) };
    }

    get defaultMode() {
        return this.getAttribute('default-mode') === 'gc' ? 'gc' : 'ec';
    }

    get text() {
        return TEXT[this.getAttribute('lang') === 'en' ? 'en' : 'am'];
    }

    get minJdn() {
        return Cal.isoToJdn(this.getAttribute('min'));
    }

    get maxJdn() {
        const max = Cal.isoToJdn(this.getAttribute('max'));
        if (this.hasAttribute('max-today')) {
            return max === null ? Cal.todayJdn() : Math.min(max, Cal.todayJdn());
        }

        return max;
    }

    allowed(jdn) {
        const min = this.minJdn;
        const max = this.maxJdn;

        return (min === null || jdn >= min) && (max === null || jdn <= max);
    }

    open(mode) {
        this.openPicker(mode || this.defaultMode);
    }

    close() {
        this.isOpen = false;
        this.popup.hidden = true;
    }

    clear() {
        this.setJdn(null, 'user');
    }

    /**
     * Sets the date and fills both boxes. source 'ec' / 'gc' leaves the box the
     * person is typing in alone; 'user' and those two also fire input + change.
     */
    setJdn(jdn, source) {
        const changed = jdn !== this.jdn;
        this.jdn = jdn;
        this.markInvalid(false);
        if (source !== 'ec') {
            this.ecInput.value = jdn === null ? '' : Cal.formatEc(Cal.jdnToEc(jdn));
        }
        if (source !== 'gc') {
            this.gcInput.value = jdn === null ? '' : Cal.formatGc(Cal.jdnToGc(jdn));
        }
        this.syncHiddenInput();
        if (source !== null && changed) {
            const detail = { value: this.value, gc: this.value, ec: this.ecValue };
            this.dispatchEvent(new CustomEvent('input', { detail, bubbles: true, composed: true }));
            this.dispatchEvent(new CustomEvent('change', { detail, bubbles: true }));
        }
    }

    /** Light-DOM hidden input, so the date is sent with a normal <form>. */
    syncHiddenInput() {
        const name = this.getAttribute('name');
        let hidden = this.querySelector(':scope > input[data-ec-date-picker-value]');
        if (!name) {
            hidden?.remove();

            return;
        }
        if (!hidden) {
            hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.setAttribute('data-ec-date-picker-value', '');
            this.appendChild(hidden);
        }
        hidden.name = name;
        hidden.value = this.value;
    }

    applyLabels() {
        const text = this.text;
        this.shadowRoot.querySelector('[data-caption="ec"]').textContent = this.getAttribute('ec-label') ?? text.ec;
        this.shadowRoot.querySelector('[data-caption="gc"]').textContent = this.getAttribute('gc-label') ?? text.gc;
        this.ecInput.setAttribute('aria-label', this.getAttribute('ec-label') ?? text.ec);
        this.gcInput.setAttribute('aria-label', this.getAttribute('gc-label') ?? text.gc);
        this.shadowRoot.querySelectorAll('.icon').forEach((icon) => icon.setAttribute('aria-label', text.open));
        this.shadowRoot.querySelector('[data-mode="ec"]').textContent = text.ecTab;
        this.shadowRoot.querySelector('[data-mode="gc"]').textContent = text.gcTab;
        this.shadowRoot.querySelector('[data-nav="-1"]').setAttribute('aria-label', text.previous);
        this.shadowRoot.querySelector('[data-nav="1"]').setAttribute('aria-label', text.next);
        this.shadowRoot.querySelector('[data-clear]').textContent = text.clear;
    }

    markInvalid(invalid) {
        this.shadowRoot.querySelectorAll('.box').forEach((box) => box.classList.toggle('invalid', invalid));
        this.ecInput.toggleAttribute('aria-invalid', invalid);
        this.toggleAttribute('data-invalid', invalid);
    }

    onTyping(event) {
        const input = event.target;
        const mode = input.dataset.input;
        if (!mode) {
            return;
        }
        event.stopPropagation();
        const deleting = String(event.inputType || '').indexOf('delete') === 0;
        const masked = Cal.maskDate(input.value, !deleting);
        if (masked !== input.value) {
            input.value = masked;
        }

        if (masked.trim() === '') {
            this.setJdn(null, mode);

            return;
        }
        const date = mode === 'ec' ? Cal.parseEc(masked) : Cal.parseGc(masked);
        if (!date) {
            return;
        }
        const jdn = mode === 'ec' ? Cal.ecToJdn(date.year, date.month, date.day) : Cal.gcToJdn(date.year, date.month, date.day);
        if (!this.allowed(jdn)) {
            this.markInvalid(true);

            return;
        }
        this.setJdn(jdn, mode);
        if (this.isOpen) {
            this.selectedJdn = jdn;
            this.view = 'days';
            this.showMonthOf(jdn);
            this.render();
        }
    }

    /** A box left with text that isn't a full, allowed date empties the value and shows red. */
    onBlur(event) {
        const next = event.relatedTarget;
        if (this.isOpen && !(next && (this.contains(next) || this.shadowRoot.contains(next)))) {
            this.close();
        }
        const input = event.target;
        if (!input.dataset || !input.dataset.input) {
            return;
        }
        const text = input.value.trim();
        const typed = input.dataset.input === 'ec' ? Cal.parseEc(text) : Cal.parseGc(text);
        const jdn = typed ? (input.dataset.input === 'ec' ? Cal.ecToJdn(typed.year, typed.month, typed.day) : Cal.gcToJdn(typed.year, typed.month, typed.day)) : null;
        if (text !== '' && (jdn === null || !this.allowed(jdn))) {
            this.setJdn(null, input.dataset.input);
            this.markInvalid(true);
        } else if (jdn !== null) {
            input.value = input.dataset.input === 'ec' ? Cal.formatEc(Cal.jdnToEc(jdn)) : Cal.formatGc(Cal.jdnToGc(jdn));
        }
    }

    onDocumentPointerDown(event) {
        if (this.isOpen && !event.composedPath().includes(this)) {
            this.close();
        }
    }

    onClick(event) {
        const button = event.target.closest('button');
        if (!button || button.disabled) {
            return;
        }
        const data = button.dataset;
        if (data.toggle) {
            if (this.isOpen && this.mode === data.toggle) {
                this.close();
            } else {
                this.openPicker(data.toggle);
            }
        } else if (data.mode) {
            const anchor = this.selectedJdn !== null ? this.selectedJdn : this.firstJdnOfView();
            this.mode = data.mode;
            this.view = 'days';
            this.showMonthOf(anchor);
            this.render();
        } else if (data.nav) {
            this.step(Number(data.nav));
        } else if (data.zoom !== undefined) {
            this.zoomOut();
        } else if (data.jdn) {
            this.selectedJdn = Number(data.jdn);
            this.setJdn(this.selectedJdn, 'user');
            this.close();
        } else if (data.month) {
            this.viewMonth = Number(data.month);
            this.view = 'days';
            this.render();
        } else if (data.year) {
            this.viewYear = Number(data.year);
            this.view = 'months';
            this.render();
        } else if (data.clear !== undefined) {
            this.selectedJdn = null;
            this.setJdn(null, 'user');
            this.render();
        }
    }

    show(mode) {
        if (!this.isOpen || this.mode !== mode) {
            this.openPicker(mode);
        }
    }

    openPicker(mode) {
        if (this.hasAttribute('disabled')) {
            return;
        }
        this.mode = mode;
        this.selectedJdn = this.jdn;
        this.view = 'days';
        this.showMonthOf(this.jdn !== null ? this.jdn : Math.min(Cal.todayJdn(), this.maxJdn ?? Infinity));
        this.isOpen = true;
        this.popup.hidden = false;
        this.render();
        this.placePopup();
    }

    /** Shifts the calendar sideways so it stays 8px inside the screen (e.g. a picker inside padded cards on a phone). */
    placePopup() {
        const gutter = 8;
        this.popup.style.left = '0px';
        const rect = this.popup.getBoundingClientRect();
        const screen = document.documentElement.clientWidth || window.innerWidth;
        let shift = 0;
        if (rect.right > screen - gutter) {
            shift = screen - gutter - rect.right;
        }
        if (rect.left + shift < gutter) {
            shift = gutter - rect.left;
        }
        this.popup.style.left = shift + 'px';
    }

    toDate(jdn) {
        return this.mode === 'ec' ? Cal.jdnToEc(jdn) : Cal.jdnToGc(jdn);
    }

    toJdn(year, month, day) {
        return this.mode === 'ec' ? Cal.ecToJdn(year, month, day) : Cal.gcToJdn(year, month, day);
    }

    monthsInYear() {
        return this.mode === 'ec' ? 13 : 12;
    }

    daysIn(year, month) {
        return this.mode === 'ec' ? Cal.daysInEcMonth(year, month) : Cal.daysInGcMonth(year, month);
    }

    showMonthOf(jdn) {
        const date = this.toDate(jdn);
        this.viewYear = date.year;
        this.viewMonth = date.month;
    }

    firstJdnOfView() {
        return this.toJdn(this.viewYear, this.viewMonth, 1);
    }

    lastJdnOfView() {
        return this.toJdn(this.viewYear, this.viewMonth, this.daysIn(this.viewYear, this.viewMonth));
    }

    step(direction) {
        if (this.view === 'years') {
            this.yearPageStart += 12 * direction;
        } else if (this.view === 'months') {
            this.viewYear += direction;
        } else {
            this.viewMonth += direction;
            if (this.viewMonth < 1) {
                this.viewYear -= 1;
                this.viewMonth = this.monthsInYear();
            } else if (this.viewMonth > this.monthsInYear()) {
                this.viewYear += 1;
                this.viewMonth = 1;
            }
        }
        this.render();
    }

    zoomOut() {
        if (this.view === 'days') {
            this.view = 'months';
        } else if (this.view === 'months') {
            this.yearPageStart = this.viewYear - (this.viewYear % 12);
            this.view = 'years';
        }
        this.render();
    }

    /** Year and month bounds, in the calendar on show. */
    yearAllowed(year) {
        const min = this.minJdn;
        const max = this.maxJdn;

        return (min === null || year >= this.toDate(min).year) && (max === null || year <= this.toDate(max).year);
    }

    monthAllowed(year, month) {
        const min = this.minJdn;
        const max = this.maxJdn;
        const first = this.toJdn(year, month, 1);
        const last = this.toJdn(year, month, this.daysIn(year, month));

        return (min === null || last >= min) && (max === null || first <= max);
    }

    navDisabled(direction) {
        if (this.view === 'years') {
            return !this.yearAllowed(direction > 0 ? this.yearPageStart + 12 : this.yearPageStart - 1);
        }
        if (this.view === 'months') {
            return !this.yearAllowed(this.viewYear + direction);
        }
        const bound = direction > 0 ? this.maxJdn : this.minJdn;
        if (bound === null) {
            return false;
        }

        return direction > 0 ? this.lastJdnOfView() >= bound : this.firstJdnOfView() <= bound;
    }

    title() {
        if (this.view === 'years') {
            return this.yearPageStart + ' - ' + (this.yearPageStart + 11);
        }
        if (this.view === 'months') {
            return String(this.viewYear);
        }
        const lang = this.getAttribute('lang') === 'en' ? 'en' : 'am';
        const names = this.mode === 'ec' ? Cal.ecMonthNames[lang] : Cal.gcMonthNames[lang];

        return names[this.viewMonth - 1] + ' ' + this.viewYear;
    }

    render() {
        const root = this.shadowRoot;
        root.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === this.mode));
        root.querySelector('[data-zoom]').textContent = this.title();
        root.querySelector('[data-nav="-1"]').disabled = this.navDisabled(-1);
        root.querySelector('[data-nav="1"]').disabled = this.navDisabled(1);
        this.grid.classList.toggle('wide', this.view !== 'days');
        this.grid.innerHTML = this.view === 'days' ? this.dayCells() : this.view === 'months' ? this.monthCells() : this.yearCells();
    }

    /**
     * Ethiopian months show only their own days; Gregorian months fill six
     * weeks with greyed days from the months around them.
     */
    dayCells() {
        const first = this.firstJdnOfView();
        const leading = Cal.weekday(first);
        const count = this.daysIn(this.viewYear, this.viewMonth);
        const today = Cal.todayJdn();
        const ec = this.mode === 'ec';
        let html = this.text.weekdays.map((name) => `<div class="weekday">${name}</div>`).join('');
        if (ec) {
            html += '<button type="button" class="cell blank" disabled tabindex="-1"></button>'.repeat(leading);
        }
        const start = ec ? first : first - leading;
        const total = ec ? count : 42;
        for (let offset = 0; offset < total; offset++) {
            const jdn = start + offset;
            const date = this.toDate(jdn);
            const classes = ['cell'];
            if (date.month !== this.viewMonth) {
                classes.push('outside');
            }
            if (jdn === today) {
                classes.push('today');
            }
            if (jdn === this.selectedJdn) {
                classes.push('selected');
            }
            const disabled = this.allowed(jdn) ? '' : ' disabled';
            html += `<button type="button" class="${classes.join(' ')}" data-jdn="${jdn}"${disabled}>${date.day}</button>`;
        }

        return html;
    }

    monthCells() {
        const lang = this.getAttribute('lang') === 'en' ? 'en' : 'am';
        const names = this.mode === 'ec' ? Cal.ecMonthNames[lang] : Cal.gcMonthNames[lang];

        return names.map((name, index) => {
            const month = index + 1;
            const selected = month === this.viewMonth ? ' selected' : '';
            const disabled = this.monthAllowed(this.viewYear, month) ? '' : ' disabled';

            return `<button type="button" class="cell${selected}" data-month="${month}"${disabled}>${name}</button>`;
        }).join('');
    }

    yearCells() {
        let html = '';
        for (let year = this.yearPageStart; year < this.yearPageStart + 12; year++) {
            const selected = year === this.viewYear ? ' selected' : '';
            const disabled = this.yearAllowed(year) ? '' : ' disabled';
            html += `<button type="button" class="cell${selected}" data-year="${year}"${disabled}>${year}</button>`;
        }

        return html;
    }
}

if (typeof customElements !== 'undefined' && !customElements.get('ec-date-picker')) {
    customElements.define('ec-date-picker', EcDatePicker);
}


root.EthiopianCalendar = EthiopianCalendar;
root.EcDatePicker = EcDatePicker;
})(typeof window !== "undefined" ? window : globalThis);