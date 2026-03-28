/**
 * Mycel i18n
 * Lightweight translation system. No library dependency.
 * Stores locale in localStorage, detects browser language on first visit.
 */

import { writable, derived } from 'svelte/store';
import en from './en.json';
import sv from './sv.json';

const translations: Record<string, Record<string, unknown>> = { en, sv };

export const SUPPORTED_LOCALES = ['en', 'sv'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = 'mycel_locale';

function detectLocale(): Locale {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
			return stored as Locale;
		}
	}

	if (typeof navigator !== 'undefined') {
		const browserLang = navigator.language.split('-')[0];
		if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
			return browserLang as Locale;
		}
	}

	return 'en';
}

export const locale = writable<Locale>(detectLocale());

// Persist locale changes
locale.subscribe((val) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, val);
	}
});

/**
 * Get a nested value from an object using a dot-separated path.
 * e.g. resolve(obj, 'peer.sendGratitude') → obj.peer.sendGratitude
 */
function resolve(obj: Record<string, unknown>, path: string): string {
	let current: unknown = obj;
	for (const key of path.split('.')) {
		if (current && typeof current === 'object' && key in current) {
			current = (current as Record<string, unknown>)[key];
		} else {
			return path; // fallback: return the key itself
		}
	}
	return typeof current === 'string' ? current : path;
}

/**
 * Reactive translation store.
 * Usage: $t('peer.sendGratitude') or $t('peer.gratitudeSent', { name: 'anna' })
 */
export const t = derived(locale, ($locale) => {
	const strings = translations[$locale] || translations.en;

	return (key: string, params?: Record<string, string>): string => {
		let value = resolve(strings as Record<string, unknown>, key);

		// Simple {placeholder} replacement
		if (params) {
			for (const [k, v] of Object.entries(params)) {
				value = value.replace(`{${k}}`, v);
			}
		}

		return value;
	};
});

/**
 * Translate a vocabulary tag for display.
 * Usage: $tv('meal-together') → "äta tillsammans" (in Swedish)
 */
export const tv = derived(locale, ($locale) => {
	const strings = translations[$locale] || translations.en;
	const vocab = (strings as Record<string, unknown>).vocab as Record<string, string> || {};

	return (tag: string): string => {
		return vocab[tag] || tag;
	};
});
