const express = require("express");
const recipeRouter = express.Router();
const Recipe = require("../models/Recipe.model.js");
const fileUploader = require("../config/cloudinary.config");
const axios = require("axios");
const User = require("../models/User.model.js");

recipeRouter.get("/recipe/random", function (req, res, next) {
  const API_URL = `http://www.themealdb.com/api/json/v1/1/random.php`;
  axios
    .get(API_URL)
    .then(function (response) {
      // Handle successful response
      const data = response.data;
      const recipe = data.meals[0];
      const recipeName = recipe.strMeal;
      const ingredients = [recipe.strIngredient1, recipe.strIngredient2];
      const instructions = recipe.strInstructions;
      const mealImage = recipe.strMealThumb;
      console.log(recipeName, ingredients, instructions);
      res.render("recipes/recipe-details", { data: recipe });
    })
    .catch(function (error) {
      // Handle error
      console.error("Error:", error);
    });
});

//Adding recipe
recipeRouter.get("/recipe/create", function (req, res, next) {
  res.render("recipes/add-recipe");
});

recipeRouter.post(
  "/recipe/create",
  fileUploader.single("recipe-cover-image"),
  (req, res, next) => {
    const { name, ingredients, instructions } = req.body;
    console.log(req.body);
    console.log(req.file.path);
    Recipe.create({ name, ingredients, instructions, imageUrl: req.file.path })
      .then((recipeFromDB) => {
        console.log(`New recipe created: ${recipeFromDB.name}.`);
        res.redirect("/recipe/list"); // Redirect to a list page after creation
      })
      .catch((error) => next(error));
  }
);

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

recipeRouter.post("/recipe/favorites", function (req, res, next) {
  req.session.currentUser &&
    User.findByIdAndUpdate(
      req.session.currentUser._id,
      { $push: { favourites: req.body.favorite } },
      { new: true }
    ).then((updatedUser) => {
      req.session.currentUser = updatedUser;
      res.redirect("/userProfile");
    });

  // Recipe.findByIdAndDelete(recipeId)
  //   .then((deletedRecipe) => {
  //     if (!deletedRecipe) {
  //       return res.status(404).send("Recipe not found");
  //     }

  //     console.log(`Recipe deleted: ${deletedRecipe.name}`);
  //     res.redirect("/recipe/list"); // Redirect to the list page after deletion
  //   })
  //   .catch((error) => next(error));
});

module.exports = recipeRouter;
