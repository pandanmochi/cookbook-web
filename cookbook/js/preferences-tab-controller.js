import Controller from "../../tool/controller.js";

/**
 * Preferences tab controller type.
 */
class PreferencesTabController extends Controller {
  #messageElement;

  /**
   * Initializes a new instance.
   */
  constructor() {
    super();

    this.#messageElement = this.bottom.querySelector("input.message");

    // register controller event listeners
    this.addEventListener("activated", (event) => this.processActivated());
  }

  /**
   * Handles that activity has changed from false to true.
   */
  processActivated() {
    this.clear();
    this.top.querySelector("nav.tabs>button.preferences").classList.add("active");

    const sectionTemplate = document.querySelector("template.preferences");
    const section = sectionTemplate.content.firstElementChild.cloneNode(true);
    this.center.append(section);

    // register basic event listeners
    const addPhoneButton = section.querySelector("button.add");
    addPhoneButton.addEventListener("click", (event) => this.addPhoneField(""));
    const submitButton = section.querySelector("button.submit");
    submitButton.addEventListener("click", (event) => this.processSubmitSessionOwner());
    const avatarImageElement = section.querySelector("img.avatar");
    avatarImageElement.addEventListener("dragover", (event) =>
      this.validateAvatarTransfer(event.dataTransfer)
    );
    avatarImageElement.addEventListener("drop", (event) =>
      this.processSubmitAvatar(event.dataTransfer.files[0])
    );

    this.displaySessionOwner();
  }

  /**
   * Displays the current session owner's data.
   */
  displaySessionOwner() {
    const sessionOwner = this.sharedProperties["session-owner"];
    console.log(sessionOwner.identity)
    const section = this.center.querySelector("section.preferences");
    section.querySelector("img.avatar").src = "/services/documents/" + sessionOwner.avatar.identity;
    section.querySelector("input.email").value = sessionOwner.email;
    section.querySelector("select.group").value = sessionOwner.group;
    section.querySelector("input.title").value = sessionOwner.name.title || "";
    section.querySelector("input.surname").value = sessionOwner.name.family;
    section.querySelector("input.forename").value = sessionOwner.name.given;
    section.querySelector("input.postcode").value = sessionOwner.address.postcode;
    section.querySelector("input.street").value = sessionOwner.address.street;
    section.querySelector("input.city").value = sessionOwner.address.city;
    section.querySelector("input.country").value = sessionOwner.address.country;
    section.querySelector("input.password").value = "";

    section.querySelector("span.phones").innerHTML = "";
    for (const phone of sessionOwner.phones) this.addPhoneField(phone);
  }

  /**
   * Adds an input field for the given phone number.
   * @param phone the phone number
   */
  addPhoneField(phone) {
    const phoneField = document.createElement("input");
    phoneField.type = "tel";
    phoneField.classList.add("phone");
    phoneField.value = phone;

    const section = this.center.querySelector("section.preferences");
    section.querySelector("span.phones").append(phoneField);
  }

  /**
   * Performs submitting the session owner data.
   */
  async processSubmitSessionOwner() {
    try {
      const section = this.center.querySelector("section.preferences");
      const sessionOwnerPassword = section.querySelector("input.password").value.trim();
      const sessionOwner = structuredClone(this.sharedProperties["session-owner"]);
      sessionOwner.email = section.querySelector("input.email").value.trim();
      sessionOwner.group = section.querySelector("select.group").value.trim();
      sessionOwner.name.title = section.querySelector("input.title").value.trim() || null;
      sessionOwner.name.family = section.querySelector("input.surname").value.trim();
      sessionOwner.name.given = section.querySelector("input.forename").value.trim();
      sessionOwner.address.postcode = section.querySelector("input.postcode").value.trim();
      sessionOwner.address.street = section.querySelector("input.street").value.trim();
      sessionOwner.address.city = section.querySelector("input.city").value.trim();
      sessionOwner.address.country = section.querySelector("input.country").value.trim();

      sessionOwner.phones.length = 0;
      for (const phoneField of section.querySelectorAll("input.phone")) {
        const phone = phoneField.value.trim();
        if (phone) sessionOwner.phones.push(phone);
      }

      const headers = { Accept: "text/plain", "Content-Type": "application/json" };
      if (sessionOwnerPassword) headers["X-Set-Password"] = sessionOwnerPassword;

      const resource = "/services/people";
      const response = await fetch(resource, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(sessionOwner),
      });
      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);

      if (
        sessionOwnerPassword ||
        sessionOwner.email !== this.sharedProperties["session-owner"].email
      ) {
        this.top.querySelector("nav.tabs>button.authentication").click();
      } else {
        sessionOwner.version = (sessionOwner.version || 0) + 1;
        this.sharedProperties["session-owner"] = sessionOwner;
        this.displaySessionOwner();
      }

      this.#messageElement.value = "ok.";
    } catch (error) {
      this.#messageElement.value = error.toString();
      console.error(error);
    }
  }

  /**
   * Performs validating an avatar transfer attempt.
   * @param dataTransfer the avatar transfer
   */
  async validateAvatarTransfer(dataTransfer) {
    const dataTransferItem = dataTransfer.items[0];
    dataTransfer.dropEffect =
      dataTransferItem.kind === "file" && dataTransferItem.type.startsWith("image/")
        ? "copy"
        : "none";
  }

  /**
   * Performs submitting the requester's avatar.
   * @param avatarFile the avatar image file
   */
  async processSubmitAvatar(avatarFile) {
    try {
      if (!avatarFile) throw new ReferenceError("no avatar file dropped!");
      if (!avatarFile.type.startsWith("image/"))
        throw new RangeError("illegal avatar file " + avatarFile.name + "!");
      const sessionOwner = this.sharedProperties["session-owner"];

      const query = new URLSearchParams();
      query.set("description", avatarFile.name);
      const resource = "/services/documents?" + query.toString();

      const headers = { Accept: "text/plain", "Content-Type": avatarFile.type };
      const response = await fetch(resource, {
        method: "POST",
        headers: headers,
        body: avatarFile,
      });
      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      sessionOwner.avatar.identity = parseInt(await response.text());

      this.center.querySelector("section.preferences img.avatar").src =
        "/services/documents/" + sessionOwner.avatar.identity;

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
window.addEventListener("load", (event) => {
  const controller = new PreferencesTabController();
  for (const tabButton of controller.top.querySelectorAll("nav.tabs>button")) {
    const active = tabButton.classList.contains("preferences");
    tabButton.addEventListener("click", (event) => (controller.active = active));
  }
});
