import { browser } from '$app/env';
import { writable } from 'svelte/store';

const defaultValues = {
	name: ''
};

if (browser) {
	for (const key in defaultValues) {
		defaultValues[key] = localStorage.getItem('defaultValues.' + key) ?? defaultValues[key];
	}
}

export const nameStore = writable(defaultValues.name);

nameStore.subscribe((name) => {
	if (browser) {
		localStorage.setItem('defaultValues.name', name);
	}
});
