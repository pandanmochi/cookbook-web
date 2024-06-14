import Controller from "../../tool/controller.js";
import { RESTRICTION } from "./enums.js";

/**
 * Skeleton for tab controller type.
 */
class IngredientTypeEditorTabController extends Controller {
  #messageElement;

  /**
   * Initializes a new instance.
   */
  constructor() {
    super();

    this.#messageElement = this.bottom.querySelector("input.message");

    // register controller event listeners
    this.addEventListener("activated", (event) => this.processActivated());
    // this.addEventListener("deactivated", event => this.processDeactivated());
  }

  /**
   * Handles that activity has changed from false to true.
   */
  async processActivated() {
    this.clear();
    this.top.querySelector("nav.tabs>button.ingredient-type-editor").classList.add("active");

    const viewTemplate = document.querySelector("template.ingredient-types-view");
    const viewSection = viewTemplate.content.firstElementChild.cloneNode(true);

    const editorTemplate = document.querySelector("template.ingredient-type-editor");
    const editorSection = editorTemplate.content.firstElementChild.cloneNode(true);

    this.center.append(viewSection);
    this.center.append(editorSection);
    this.center.querySelector("section.ingredient-type-editor").classList.add("hidden");

    this.#displayIngredientTypes();
  }

  async #displayIngredientTypes() {
    const viewSection = this.center.querySelector("section.ingredient-types-view");
    console.log(viewSection);
    const tableBody = viewSection.querySelector("table.ingredient-types>tbody");
    tableBody.innerHTML = "";

    const ingredients = await this.queryIngredients();
    console.log(ingredients);

    for (const ingredient of ingredients) {
      console.log(ingredient.alias);
      const viewRowTemplate = document.querySelector("template.ingredient-types-view-row");
      const viewRowSection = viewRowTemplate.content.firstElementChild.cloneNode(true);
      tableBody.append(viewRowSection);

      viewRowSection.querySelector("img.avatar").src = "/services/documents/" + ingredient.avatar.identity;
      viewRowSection.querySelector("td.alias").innerText = ingredient.alias;
      viewRowSection.querySelector("td.restriction").innerText = RESTRICTION[ingredient.restriction];
      viewRowSection.querySelector("td.modified").innerText = new Date(ingredient.modified).toDateString();

      const accessEditButton = viewRowSection.querySelector("button.access");
      accessEditButton.addEventListener("click", (event) => this.editIngredient(ingredient));
    }

    // register basic event listeners
    const createIngredientButton = viewSection.querySelector("button.create");
    createIngredientButton.addEventListener("click", (event) =>
      this.editIngredient({ identity: 0, avatar: { identity: 1 } })
    );

    const submitButton = editorSection.querySelector("button.submit");
    submitButton.addEventListener("click", (event) => this.saveIngredient(ingr));

    const cancelButton = editorSection.querySelector("button.cancel");
    cancelButton.addEventListener("click", (event) => this.cancelEditor());
  }

  async saveIngredient(ingredient) {
    try {
      const section = this.center.querySelector("section.ingredient-type-editor");

      ingredient.alias = section.querySelector("input.alias").value;
      ingredient.restriction = section.querySelector("select.restriction").value;
      ingredient.description = section.querySelector("textarea.description").value;

      const headers = { Accept: "text/plain", "Content-Type": "application/json" };
      const resource = "/services/ingredient-types";
      const response = await fetch(resource, { method: "POST", headers: headers, body: JSON.stringify(ingredient) });
      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      this.#messageElement.value = "ok.";

      // append new ingredient to list
      const viewRowTemplate = document.querySelector("template.ingredient-types-view-row");
      const viewRowSection = viewRowTemplate.content.firstElementChild.cloneNode(true);

      this.center.querySelector("table.ingredient-types").append(viewRowSection);
      viewRowSection.querySelector("td.alias").innerText = alias;
      viewRowSection.querySelector("td.restriction").innerText = RESTRICTION[restriction];
      viewRowSection.querySelector("td.modified").innerText = new Date().toDateString();

      /* const accessEditButton = viewRowSection.querySelector("button.access");
      accessEditButton.addEventListener("click", (event) => this.ingredientEdit());
      accessEditButton.ingredient = ingredient; */

      this.cancelEditor();
    } catch (error) {
      this.#messageElement.value = error.toString();
      console.error(error);
    }
  }

  async queryIngredients() {
    try {
      const sessionOwner = this.sharedProperties["session-owner"];

      const headers = { Accept: "application/json" };
      const resource = sessionOwner.group === "ADMIN"
          ? "/services/ingredient-types"
          : "/services/people/" + sessionOwner.identity + "/ingredient-types";

      const response = await fetch(resource, { method: "GET", headers: headers });

      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      this.#messageElement.value = "fetched ingredients.";

      const ingredients = await response.json();

      return ingredients;
    } catch (error) {
      this.#messageElement.value = error.toString();
      console.error(error);
    }
  }

  cancelEditor() {
    this.#displayIngredientTypes();
    this.center.querySelector("section.ingredient-types-view").classList.remove("hidden");
    const editorSection = this.center.querySelector("section.ingredient-type-editor");
    editorSection.classList.add("hidden")
    editorSection.querySelector("input").value = "";
    editorSection.querySelector("textarea").value = "";
    editorSection.querySelector("select").value = "NONE";
  }

  editIngredient(ingredient) {
    this.center.querySelector("section.ingredient-types-view").classList.add("hidden");
    const editor = this.center.querySelector("section.ingredient-type-editor");
    editor.classList.remove("hidden")
    editor.querySelector("img.avatar").src = "/services/documents/" + ingredient.avatar.identity;
    editor.querySelector("input.alias").value = ingredient.alias || "";
    editor.querySelector("select.restriction").value = ingredient.restriction || "NONE";
    editor.querySelector("textarea.description").value = ingredient.description || "";
  }
}

/*
 * Registers an event handler for the browser window's load event.
 */
window.addEventListener("load", (event) => {
  console.log(document.body);
  const controller = new IngredientTypeEditorTabController();
  for (const tabButton of controller.top.querySelectorAll("nav.tabs>button")) {
    const active = tabButton.classList.contains("ingredient-type-editor");
    tabButton.addEventListener("click", (event) => (controller.active = active));
  }
});
