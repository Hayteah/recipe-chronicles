// routes/auth.routes.js
const bcryptjs = require("bcryptjs");
const saltRounds = 10;
const User = require("../models/User.model");
const mongoose = require("mongoose");

const { Router } = require("express");
const router = new Router();
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const { default: axios } = require("axios");

// GET route ==> to display the signup form to users
router.get("/signup", isLoggedOut, (req, res) => res.render("auth/signup"));

// POST route ==> to process form data
router.post("/signup", isLoggedOut, (req, res, next) => {
  //   console.log("The form data: ", req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        passwordHash: hashedPassword,
      });
    })
    .then((userFromDB) => {
      console.log("Newly created user is: ", userFromDB);
      res.redirect("/userProfile");
    })
    .catch((error) => {
      // copy the following if-else statement
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            " Username and email need to be unique. Either username or email is already used. ",
        });

        res.status(500).render("auth/signup", {
          errorMessage: "User not found and/or incorrect password.",
        });
      } else {
        next(error);
      }
    });
});

router.get("/login", isLoggedOut, (req, res) => res.render("auth/login"));

router.post("/login", isLoggedOut, (req, res, next) => {
  console.log("SESSION =====> ", req.session);
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, email and password to login.",
    });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        console.log("Email not registered. ");
        res.render("auth/login", {
          errorMessage: "User not found and/or incorrect password.",
        });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        res.render("users/user-profile", { user });

        req.session.currentUser = user;
        res.redirect("/");
      } else {
        console.log("Incorrect password. ");
        res.render("auth/login", {
          errorMessage: "User not found and/or incorrect password.",
        });
      }
    })
    .catch((error) => next(error));
});

// router.get("/userProfile", isLoggedIn, (req, res) => {
//   const { favourites } = req.session.currentUser;
//   console.log(favourites);
//   if (favourites.length) {
//     const results = [];
//     favourites.forEach((element) => {
//       axios
//         .get(`http://www.themealdb.com/api/json/v1/1/lookup.php?i=${element}`)
//         .then((resp) => results.push(resp.data.meals))
//         .then(() => {
//           console.log(results);
//           res.send(results);
//           return;
//           res.render("users/user-profile", {
//             userInSession: req.session.currentUser,
//           });
//         });
//     });
//   }
// });

router.get("/userProfile", isLoggedIn, (req, res) => {
  const { favourites } = req.session.currentUser;
  console.log(favourites);

  if (favourites.length) {
    const results = [];

    // Use Promise.all to wait for all API calls to complete
    Promise.all(
      favourites.map(
        (element) =>
          axios
            .get(
              `http://www.themealdb.com/api/json/v1/1/lookup.php?i=${element}`
            )
            .then((resp) => resp.data.meals[0]) // Extract the first meal from the response
      )
    )
      .then((meals) => {
        console.log(meals);

        res.render("users/user-profile", {
          userInSession: req.session.currentUser,
          favorites: meals, // Pass the favorite meals to the template
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    // If there are no favorites, render the profile without meals
    res.render("users/user-profile", {
      userInSession: req.session.currentUser,
      favorites: [],
    });
  }
});

router.post("/logout", isLoggedIn, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});
module.exports = router;
