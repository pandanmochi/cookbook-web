/**
 * Generic semi-abstract controller class which cannot be
 * instantiated, and is intended as a superclass for concrete
 * controller subclasses. It realizes a border layout with
 * quick access to HTML elements for center, top, bottom, left
 * and right portions. It requires an HTML page with a header,
 * a footer, and a main element containing three articles with
 * style class "left", "center" and "right" respectively. Also,
 * it assumes the footer to contain a (readonly) input element
 * with style class "message".
 *
 * If any tabs are present, it assumes tab buttons to be
 * contained within a nav element with style class "tabs".
 */
export default class Controller extends EventTarget {
	static #SHARED_PROPERTIES = {};

	#active;
	#top;
	#bottom;
	#center;
	#left;
	#right;


	/**
	 * Initializes a new instance, and throws an exception if
	 * there is an attempt to instanciate this class itself.
	 */
	constructor () {
		super();
		if (Object.getPrototypeOf(this).constructor === Controller) 
			throw new InternalError("this semi-abstract class cannot be instantiated!");

		this.#active = false;
		this.#top = document.querySelector("body>header") || null;
		this.#bottom = document.querySelector("body>footer");
		this.#center = document.querySelector("body>main>article.center");
		this.#left = document.querySelector("body>main>article.left");
		this.#right = document.querySelector("body>main>article.right");
	}


	/**
	 * Returns the activity.
	 * @return the activity state
	 */
	get active () {
		return this.#active;
	}


	/**
	 * Sets the activity.
	 * @param value the activity state
	 */
	set active (value) {
		if (typeof value !== "boolean") throw new TypeError();

		let event = null;
		if (!this.active && value) event = new Event("activated");
		if (this.active && !value) event = new Event("deactivated");

		this.#active = value;
		if (event) this.dispatchEvent(event);
	}


	/**
	 * Returns the top element.
	 * @return the header element
	 */
	get top () {
		return this.#top;
	}


	/**
	 * Returns the bottom element.
	 * @return the footer element
	 */
	get bottom () {
		return this.#bottom;
	}


	/**
	 * Returns the center element.
	 * @return the center article element
	 */
	get center () {
		return this.#center;
	}


	/**
	 * Returns the left element.
	 * @return the left article element
	 */
	get left () {
		return this.#left;
	}


	/**
	 * Returns the right element.
	 * @return the right article element
	 */
	get right () {
		return this.#right;
	}


	/**
	 * Returns the shared properties.
	 * @return the shared controller properties
	 */
	get sharedProperties () {
		return Controller.#SHARED_PROPERTIES;
	}


	/**
	 * Clears all tab buttons, the center article,
	 * and the message element.
	 */
	clear () {
		for (const tabButton of this.#top.querySelectorAll("nav.tabs>button"))
			tabButton.classList.remove("active");

		while (this.#center.lastElementChild)
			this.#center.lastElementChild.remove();

		const messageOutput = this.#bottom.querySelector("input.message");
		if (messageOutput) messageOutput.value = "";
	}
}