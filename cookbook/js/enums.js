/**
 * Enum keys and their associated German translations.
 */
const GROUP = Object.freeze({
	USER: "Benutzer",
	ADMIN: "Administrator"
});

const CATEGORY = Object.freeze({
	MAIN_COURSE: "Hauptgericht",
	APPETIZER: "Vorspeise",
	SNACK: "Snack",
	DESSERT: "Nachtisch",
	BREAKFAST: "Frühstück",
	BUFFET: "Büffet",
	BARBEQUE: "Barbeque",
	ADOLESCENT: "Kinderportion",
	INFANT: "Babynahrung"
});

const RESTRICTION = Object.freeze({
	NONE: "Keine",
	PESCATARIAN: "Pescatarisch",
	LACTO_OVO_VEGETARIAN: "Ovo-Lacto-Vegetarisch",
	LACTO_VEGETARIAN: "Lacto-Vegetarisch",
	VEGAN: "Vegan"
});

const UNIT = Object.freeze({
	LITRE: "Liter",
	GRAM: "Gramm",
	TEASPOON: "Teelöffel",
	TABLESPOON: "Esslöffel",
	PINCH: "Prise",
	CUP: "Tasse",
	CAN: "Dose",
	TUBE: "Tube",
	BUSHEL: "Bund",
	PIECE: "Stück"
});

export { GROUP, CATEGORY, RESTRICTION, UNIT };