import Controller from "../../tool/controller.js";
import xhr from "../../tool/xhr.js";


/**
 * Authentication tab controller type.
 */
class AuthenticationTabController extends Controller {
	#messageElement;

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super();

		this.#messageElement = this.bottom.querySelector("input.message");

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
	}


	/**
	 * Handles that activity has changed from false to true.
	 */
	async processActivated () {
		this.clear();
		this.top.querySelector("nav.tabs>button.authentication").classList.add("active");
		for (const tabButton of this.top.querySelectorAll("nav.tabs>button:not(.authentication)"))
			tabButton.disabled = true;

		const sectionTemplate = document.querySelector("template.authentication");
		const section = sectionTemplate.content.firstElementChild.cloneNode(true);
		this.center.append(section);

		// reset session owner
		this.sharedProperties["session-owner"] = null;

		// register basic event listeners
		const loginButton = section.querySelector("button.authentication");
		loginButton.addEventListener("click", event => this.processAuthentication());
	}


	/**
	 * Performs user authentication.
	 */
	async processAuthentication () {
		try {
			const section = this.center.querySelector("section.authentication");
			const email = section.querySelector("input.email").value.trim() || "-";
			const password = section.querySelector("input.password").value.trim() || "-";

			const resource = "/services/people/requester";
			const headers = { "Accept": "application/json" };
			this.sharedProperties["session-owner"] = await xhr(resource, "GET", headers, null, "json", email, password);

			for (const tabButton of this.top.querySelectorAll("nav.tabs>button:not(.authentication)"))
				tabButton.disabled = false;

			this.#messageElement.value = "ok.";
		} catch (error) {
			this.#messageElement.value = error.toString();
			console.error(error);
		}
	}
}


/*
 * Registers an event handler for the browser window's load event.
 */
window.addEventListener("load", event => {
	const controller = new AuthenticationTabController();
	for (const tabButton of controller.top.querySelectorAll("nav.tabs>button")) {
		const active = tabButton.classList.contains("authentication");
		tabButton.addEventListener("click", event => controller.active = active);
	}

	// select initial tab
	controller.top.querySelector("nav.tabs>button.authentication").click();
});
