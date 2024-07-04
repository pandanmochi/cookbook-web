import Controller from "../../tool/controller.js";
import { RESTRICTION, CATEGORY, UNIT } from "./enums.js";


/**
 * Skeleton for tab controller type.
 */
class RecipeEditorTabController extends Controller {
	#messageElement;
  #ingredientTypes;

	/**
	 * Initializes a new instance.
	 */
	constructor () {
		super();

		this.#messageElement = this.bottom.querySelector("input.message");
    this.#ingredientTypes = [];

		// register controller event listeners 
		this.addEventListener("activated", event => this.processActivated());
		// this.addEventListener("deactivated", event => this.processDeactivated());
	}


	/**
	 * Handles that activity has changed from false to true.
	 */
	processActivated () {
		this.clear();
		this.top.querySelector("nav.tabs>button.recipe-editor").classList.add("active");

    const recipesViewTemplate = document.querySelector("template.recipes-view");
    const recipesViewSection = recipesViewTemplate.content.firstElementChild.cloneNode(true);

		this.center.append(recipesViewSection);
    
    this.queryIngredients();
    console.log(this.#ingredientTypes);
    this.#displayRecipes();
	}

  async #displayRecipes() {
    const viewSection = this.center.querySelector("section.recipes-view");
    const tableBody = viewSection.querySelector("table.recipes>tbody");
    tableBody.innerHTML = "";

    const recipeViewRowTemplate = document.querySelector("template.recipes-view-row");
    const recipeViewRowSection = recipeViewRowTemplate.content.firstElementChild.cloneNode(true);

    const recipes = await this.queryRecipes();

    for (const recipe of recipes) {
      const recipeViewRowTemplate = document.querySelector("template.recipes-view-row");
      const recipeViewRowSection = recipeViewRowTemplate.content.firstElementChild.cloneNode(true);
      tableBody.append(recipeViewRowSection);

      recipeViewRowSection.querySelector("img.avatar").src = "/services/documents/" + recipe.avatar.identity;
      recipeViewRowSection.querySelector("td.title").innerText = recipe.title;
      recipeViewRowSection.querySelector("td.restriction").innerText = RESTRICTION[recipe.restriction];
      recipeViewRowSection.querySelector("td.category").innerText = CATEGORY[recipe.category];
      recipeViewRowSection.querySelector("td.ingredient-count").innerText = recipe.ingredientCount;
      recipeViewRowSection.querySelector("td.modified").innerText = new Date(recipe.modified).toDateString();

      const recipeButton = recipeViewRowSection.querySelector("button.access");
      recipeButton.addEventListener("click", (event) => this.#displayRecipeEditor(recipe));
    }

  }

  async queryRecipes() {
    try {
      const sessionOwner = this.sharedProperties["session-owner"];
      const headers = { Accept: "application/json" };
      const resource = sessionOwner.group === "ADMIN"
          ? "/services/recipes"
          : "/services/people/" + sessionOwner.identity + "/recipes";

      const response = await fetch(resource, { method: "GET", headers: headers });

      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      this.#messageElement.value = "fetched recipes.";

      const recipes = await response.json();
      console.log(recipes)
      return recipes;
    } catch (error) {
      this.#messageElement.value = error.toString();
      console.error(error);
    }
  }

  async #displayRecipeEditor(recipe) {
    this.center.querySelector("section.recipes-view").classList.add("hidden");

    const recipeEditorTemplate = document.querySelector("template.recipe-editor");
    const recipeEditorSection = recipeEditorTemplate.content.firstElementChild.cloneNode(true);
    this.center.append(recipeEditorSection);


    //buttons
    recipeEditorSection.querySelector("button.cancel").addEventListener("click", (event) => this.closeRecipeEditor());
    recipeEditorSection.querySelector("button.submit").addEventListener("click", (event) => this.saveRecipe(recipe));
    recipeEditorSection.querySelector("button.remove").addEventListener("click", (event) => this.closeRecipeEditor());
    recipeEditorSection.querySelector("button.create").addEventListener("click", (event) => this.addIngredient());


    recipeEditorSection.querySelector("img.avatar").src = "/services/documents/" + recipe.avatar.identity;
    recipeEditorSection.querySelector("input.title").value = recipe.title;
    recipeEditorSection.querySelector("input.restriction").value = RESTRICTION[recipe.restriction];
    recipeEditorSection.querySelector("select.category").value = recipe.category;
    recipeEditorSection.querySelector("textarea.description").value = recipe.description;
    recipeEditorSection.querySelector("textarea.instruction").value = recipe.instruction;

    const ingredients = await this.queryRecipeIngredients(recipe.identity);
    const tableBody = recipeEditorSection.querySelector("table.ingredients>tbody");

    const ingredientRowTemplate = document.querySelector("template.recipe-editor-ingredient-row");
    const ingredientRowSectionWithAlias = ingredientRowTemplate.content.firstElementChild.cloneNode(true);
    const aliasSelect = ingredientRowSectionWithAlias.querySelector("select.alias");

    for(const ingredient of this.#ingredientTypes) {
      const option = document.createElement("option");
      option.text = ingredient.alias;
      option.value = ingredient.identity;

      aliasSelect.append(option)
    }

    for (const ingredient of ingredients) {
      const ingredientRowSection = ingredientRowSectionWithAlias.cloneNode(true);
      ingredientRowSection.setAttribute("id", ingredient.identity);
      tableBody.append(ingredientRowSection);

      ingredientRowSection.querySelector("img.avatar").src = "/services/documents/" + ingredient.type.avatar.identity;
      
      ingredientRowSection.querySelector("select.alias").value = ingredient.type.identity;
      ingredientRowSection.querySelector("output.restriction").value = RESTRICTION[ingredient.type.restriction];
      ingredientRowSection.querySelector("input.amount").value = ingredient.amount;
      ingredientRowSection.querySelector("select.unit").value = ingredient.unit;

      const submitButton = ingredientRowSection.querySelector("button.submit");
      const removeButton = ingredientRowSection.querySelector("button.remove");

      submitButton.addEventListener("click", (event) => this.submitIngredient(ingredient));
      removeButton.addEventListener("click", (event) => this.removeIngredient(ingredient));
    }

  }

  closeRecipeEditor(){
    this.center.querySelector("section.recipes-view").classList.remove("hidden");
    this.center.querySelector("section.recipe-editor").remove();
  }

  async saveRecipe(recipe) {
    try {
      const section = this.center.querySelector("section.recipe-editor");

      recipe.title = section.querySelector("input.title").value;
      recipe.category = section.querySelector("select.category").value;
      recipe.description = section.querySelector("textarea.description").value;
      recipe.instruction = section.querySelector("textarea.instruction").value;
      
      
      console.log(recipe);

      const headers = { Accept: "text/plain", "Content-Type": "application/json" };
      const resource = "/services/recipes";
      const response = await fetch(resource, { method: "POST", headers: headers, body: JSON.stringify(recipe) });
      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      this.#displayRecipes();
      this.closeRecipeEditor();
      this.#messageElement.value = "saved recipe.";
    } catch (error) {
      this.#messageElement.value = error.toString();
      console.error(error);
    }
  }

  async submitIngredient(ingredient) {
    try {
      const section = this.center.querySelector("section.recipe-editor");
      const tableBody = section.querySelector("table.ingredients>tbody");
      const tableRow = tableBody.querySelector("tr[id='"+ ingredient.identity +"']");

      ingredient.type.identity = tableRow.querySelector("select.alias").value;
      ingredient.amount = tableRow.querySelector("input.amount").value;
      ingredient.unit = tableRow.querySelector("select.unit").value;

      const headers = { Accept: "text/plain", "Content-Type": "application/json" };
      const resource = "/services/recipes/" + ingredient.recipeReference + "/ingredients";
      const response = await fetch(resource, { method: "POST", headers: headers, body: JSON.stringify(ingredient) });
      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      //this.#displayRecipes();
      //this.closeRecipeEditor();
      this.#messageElement.value = "saved ingredient.";
    } catch (error) {
      this.#messageElement.value = error.toString();
      console.error(error);
    }
  }

  removeIngredient(){
    
  }

  addIngredient(){
    const ingredientRowTemplate = document.querySelector("template.recipe-editor-ingredient-row");
    const ingredientRowSection = ingredientRowTemplate.content.firstElementChild.cloneNode(true);
    const recipeEditorSection = this.center.querySelector("section.recipe-editor");
    const tableBody = recipeEditorSection.querySelector("table.ingredients>tbody");
    tableBody.append(ingredientRowSection);
    ingredientRowSection.querySelector("select.alias").value = this.#ingredientTypes[0].type.identity;
  }

  async queryRecipeIngredients(identity) {
    try {
      const headers = { Accept: "application/json" };
      const resource = "/services/recipes/" + identity + "/ingredients";
      console.log(resource)
      const response = await fetch(resource, { method: "GET", headers: headers });

      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      this.#messageElement.value = "fetched recipe ingredients.";

      const ingredients = await response.json();
      console.log(ingredients)
      return ingredients;
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

      console.log(ingredients)
      this.#ingredientTypes = ingredients;
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
	const controller = new RecipeEditorTabController();
	for (const tabButton of controller.top.querySelectorAll("nav.tabs>button")) {
		const active = tabButton.classList.contains("recipe-editor");
		tabButton.addEventListener("click", event => controller.active = active);
	}
});
