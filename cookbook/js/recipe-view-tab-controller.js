import Controller from "../../tool/controller.js";

/**
 * Skeleton for tab controller type.
 */
class RecipeViewTabController extends Controller {
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
  processActivated() {
    this.clear();
    this.top.querySelector("nav.tabs>button.recipe-view").classList.add("active");

    const recipeViewQueryTemplate = document.querySelector("template.recipes-view-query");
    const recipeViewQuerySection = recipeViewQueryTemplate.content.firstElementChild.cloneNode(true);

    const recipesViewTemplate = document.querySelector("template.recipes-view");
    const recipesViewSection = recipesViewTemplate.content.firstElementChild.cloneNode(true);

    const recipeViewRowTemplate = document.querySelector("template.recipes-view-row");
    const recipeViewRowSection = recipeViewRowTemplate.content.firstElementChild.cloneNode(true);

    this.center.append(recipeViewQuerySection);
    this.center.append(recipesViewSection);
    recipesViewSection.firstElementChild.querySelector("tbody").append(recipeViewRowSection);

    const recipesViewIngredientRowTemplate = document.querySelector("template.recipe-view-ingredient-row");
    const recipesViewIngredientRowSection = recipesViewIngredientRowTemplate.content.firstElementChild.cloneNode(true);

    // register basic event listeners

    const recipeButton = recipeViewRowSection.querySelector("button.access");
    recipeButton.addEventListener("click", (event) => this.openRecipe());
      
  }

  openRecipe(){

        // detaillierte Rezeptbeschreibung
        const recipeViewTemplate = document.querySelector("template.recipe-view");
        const recipeViewSection = recipeViewTemplate.content.firstElementChild.cloneNode(true);
    
        const ingredientRowTemplate = document.querySelector("template.recipe-view-ingredient-row");
        const ingredientRowSection = ingredientRowTemplate.content.firstElementChild.cloneNode(true);
    
        const illustrationRowTemplate = document.querySelector("template.recipe-view-illustration-row");
        const illustrationRowSection = illustrationRowTemplate.content.firstElementChild.cloneNode(true);
  
        const container = document.createElement("div");
        container.classList.add("container");
        this.center.append(container);
        container.append(recipeViewSection);
        container.append(ingredientRowSection);
        container.append(illustrationRowSection);

        const cancelButton = recipeViewSection.querySelector("button.cancel");
        cancelButton.addEventListener("click", (event) => this.closeRecipe());
    }

    closeRecipe(){
      document.querySelector("div.container").remove();
    }
}

/*
 * Registers an event handler for the browser window's load event.
 */
window.addEventListener("load", (event) => {
  const controller = new RecipeViewTabController();
  for (const tabButton of controller.top.querySelectorAll("nav.tabs>button")) {
    const active = tabButton.classList.contains("recipe-view");
    tabButton.addEventListener("click", (event) => (controller.active = active));
  }
});
