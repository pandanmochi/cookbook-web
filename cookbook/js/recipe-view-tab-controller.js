import Controller from "../../tool/controller.js";
import { RESTRICTION, CATEGORY } from "./enums.js";

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
  async processActivated() {
    this.clear();
    this.top.querySelector("nav.tabs>button.recipe-view").classList.add("active");

    const recipeViewQueryTemplate = document.querySelector("template.recipes-view-query");
    const recipeViewQuerySection = recipeViewQueryTemplate.content.firstElementChild.cloneNode(true);

    const recipesViewTemplate = document.querySelector("template.recipes-view");
    const recipesViewSection = recipesViewTemplate.content.firstElementChild.cloneNode(true);

    const recipeViewRowTemplate = document.querySelector("template.recipes-view-row");
    const recipeViewRowSection = recipeViewRowTemplate.content.firstElementChild.cloneNode(true);

    this.center.append(recipeViewQuerySection);
    //this.center.append(recipesViewSection);
    //recipesViewSection.firstElementChild.querySelector("tbody").append(recipeViewRowSection);

    const recipesViewIngredientRowTemplate = document.querySelector("template.recipe-view-ingredient-row");
    const recipesViewIngredientRowSection = recipesViewIngredientRowTemplate.content.firstElementChild.cloneNode(true);

    // register basic event listeners

    const searchButton = recipeViewQuerySection.querySelector("button.query");
    searchButton.addEventListener("click", (event) => this.showSearchResults())
  }

  async showSearchResults(){
    const oldRecipeViewSection = this.center.querySelector("section.recipes-view");
    if(oldRecipeViewSection) oldRecipeViewSection.remove();

    const section = this.center.querySelector("section.recipes-view-query");
    
    const recipesViewTemplate = document.querySelector("template.recipes-view");
    const recipesViewSection = recipesViewTemplate.content.firstElementChild.cloneNode(true);
    this.center.append(recipesViewSection);

    const tableBody = recipesViewSection.querySelector("table.recipes>tbody");
    tableBody.innerHTML = "";
    
    const searchQuery = {
      "restriction": section.querySelector("select.restriction").value,
      "title": section.querySelector("input.title").value,
      "category": section.querySelector("select.category").value,
      "ingredientCount": section.querySelector("input.min-ingredient-count").value
      }
      
    const recipes = await this.queryRecipes();
    const filteredRecipes = this.filterRecipes(searchQuery, recipes);
    console.log(filteredRecipes);

    for (const recipe of filteredRecipes) {
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
      recipeButton.addEventListener("click", (event) => this.openRecipe());
    }
  }

  filterRecipes(searchQuery, recipes) {
    let filteredRecipes = [];

    let restrictions = [
      "NONE", // 0
      "PESCATARIAN", // 1
      "LACTO_OVO_VEGETARIAN", // 2
      "LACTO_VEGETARIAN", // 3
      "VEGAN" // 4
    ];

    for(const recipe of recipes){
      const restrictionSearchIndex = restrictions.indexOf(searchQuery.restriction);
      const restrictionRecipeIndex = restrictions.indexOf(recipe.restriction);
      const searchQueryTitleString = String(searchQuery.title).toLowerCase();
      const titleString = String(recipe.title.toLowerCase());

      // console.log(searchQuery.category)
      // console.log("count: " + recipe.ingredientCount >= searchQuery.ingredientCount)
      // console.log("category: " + recipe.category === searchQuery.category);
      // console.log("category: " + searchQuery.category === "");
      // console.log("searchQueryTitleString: " + searchQueryTitleString + "; titleString: " + titleString)
      // console.log("restrictionRecipeIndex: " + restrictionRecipeIndex + "; restrictionSearchIndex: " + restrictionSearchIndex)

      if(recipe.ingredientCount >= searchQuery.ingredientCount && 
        (searchQuery.category === "" || recipe.category == searchQuery.category) &&
        (searchQuery.title == undefined || titleString.includes(searchQueryTitleString)) &&
        restrictionRecipeIndex >= restrictionSearchIndex)
        {
          filteredRecipes.push(recipe);
      }
    }

    return filteredRecipes;
  }

  async queryRecipes() {
    try {

      const headers = { Accept: "application/json" };
      const resource = "/services/recipes";

      const response = await fetch(resource, { method: "GET", headers: headers });

      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      this.#messageElement.value = "fetched ingredients.";

      const recipes = await response.json();

      return recipes;
    } catch (error) {
      this.#messageElement.value = error.toString();
      console.error(error);
    }
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
