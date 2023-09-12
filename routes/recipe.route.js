const express = require("express");
const recipeRouter = express.Router();
const Recipe = require("../models/Recipe.model.js");

//Adding recipe
recipeRouter.get("/recipe/create", function (req, res, next) {
  res.render("recipes/add-recipe");
});

recipeRouter.post("/recipe/create", (req, res, next) => {
  const { name, ingredients, instructions } = req.body;
  console.log(req.body);
  Recipe.create({ name, ingredients, instructions })
    .then((recipeFromDB) => {
      console.log(`New recipe created: ${recipeFromDB.name}.`);
      res.redirect("/recipe/list"); // Redirect to a list page after creation
    })
    .catch((error) => next(error));
});

//  GET recipe listing.
recipeRouter.get("/recipe/list", function (req, res, next) {
  Recipe.find()
    .then((recipes) => {
      res.render("recipes/recipes-list", { recipes }); // Render a "recipe-list.hbs" template with the fetched recipes
    })
    .catch((error) => next(error));
});

//update recipe

recipeRouter.get("/recipe/edit/:recipeId", function (req, res, next) {
  const recipeId = req.params.recipeId;

  Recipe.findById(recipeId)
    .then((recipe) => {
      if (!recipe) {
        return res.status(404).send("Recipe not found");
      }

      res.render("recipes/edit-recipe", { recipe });
    })
    .catch((error) => next(error));
});

// POST route to update a recipe
recipeRouter.post("/recipe/update/:recipeId", function (req, res, next) {
  const recipeId = req.params.recipeId;
  const { name, ingredients, instructions } = req.body;

  Recipe.findByIdAndUpdate(recipeId, { name, ingredients, instructions })
    .then((updatedRecipe) => {
      if (!updatedRecipe) {
        return res.status(404).send("Recipe not found");
      }

      console.log(`Recipe updated: ${updatedRecipe.name}`);
      res.redirect("/recipe/list");
    })
    .catch((error) => next(error));
});

// GET route to display a confirmation page for deleting a recipe
recipeRouter.get("/recipe/delete/:recipeId", function (req, res, next) {
  const recipeId = req.params.recipeId;

  Recipe.findById(recipeId)
    .then((recipe) => {
      if (!recipe) {
        return res.status(404).send("Recipe not found");
      }

      res.render("recipes/delete-recipe", { recipe }); // Render a "delete-recipe.hbs" template with the fetched recipe
    })
    .catch((error) => next(error));
});

recipeRouter.post("/recipe/delete/:recipeId", function (req, res, next) {
  const recipeId = req.params.recipeId;

  Recipe.findByIdAndDelete(recipeId)
    .then((deletedRecipe) => {
      if (!deletedRecipe) {
        return res.status(404).send("Recipe not found");
      }

      console.log(`Recipe deleted: ${deletedRecipe.name}`);
      res.redirect("/recipe/list"); // Redirect to the list page after deletion
    })
    .catch((error) => next(error));
});

module.exports = recipeRouter;
