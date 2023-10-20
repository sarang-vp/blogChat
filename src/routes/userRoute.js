/** @format */

const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// Route for creating a new user
router.post("/add", userController.createUser);
router.post("/addMany", userController.createUserArray);
router.post("/testArray", userController.testArray);
// router.get('/viewUsers', async (req, res) => {
//     try {
//       const usersList = await users.find();
//       if(usersList){
//         res.status(200).json(usersList);
//       } else {
//         res.status(404).res.json({});
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Failed to retrieve customers.' });
//     }
//   });

module.exports = router;
