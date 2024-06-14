import Controller from "../../tool/controller.js";


/**
 * Skeleton for tab controller type.
 */
class SkeletonTabController extends Controller {
	#messageElement;

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super();

		this.#messageElement = this.bottom.querySelector("input.message");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
		// this.addEventListener("deactivated", event => this.processDeactivated());
	}


	/**
	 * Handles that activity has changed from false to true.
	 */
	processActivated () {
		this.clear();
		this.top.querySelector("nav.tabs>button.<tab-button-style-class>").classList.add("active");

		const sectionTemplate = document.querySelector("template.<template-style-class>");
		section = sectionTemplate.content.firstElementChild.cloneNode(true);
		this.center.append(section);

		// register basic event listeners
	}
}


/*
 * Registers an event handler for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new SkeletonTabController();
	for (const tabButton of controller.top.querySelectorAll("nav.tabs>button")) {
		const active = tabButton.classList.contains("<tab-button-style-class>");
		tabButton.addEventListener("click", event => controller.active = active);
	}
});
