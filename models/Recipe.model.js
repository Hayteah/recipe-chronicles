const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ingredients: {
      type: Array,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },

   imageUrl: {
    type: String,
    require: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("recipe", RecipeSchema);
