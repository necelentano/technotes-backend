const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler"); // keep us from using so many try catch when we use async methods with mongoose
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length)
    return res.status(400).json({ message: "No users found" });

  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // Confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate OR just set unique: true for username in the User model and skip this part, but don't forget handle error
  // const duplicate = await User.findOne({ username }).lean().exec();

  // if (duplicate) {
  //   return res.status(409).json({ message: "Duplicate username" });
  // }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

  const userObject = (!Array.isArray(roles) || !roles.length) 
    ? { username: username.toLowerCase(), password: hashedPwd }
    : { username: username.toLowerCase(), password: hashedPwd, roles };

  // Create and store new user
  const user = await User.create(userObject);

  if (!user)
    return res.status(400).json({ message: "Invalid user data received" });

  res.status(201).json({ message: `New user ${username} created` });
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) return res.status(400).json({ message: "User not found" });

  // Check for duplicate OR just set unique: true for username in the User model and skip this part, but don't forget handle error
  // const duplicate = await User.findOne({ username }).lean().exec();

  // // Allow updates to the original user
  // if (duplicate && duplicate?._id.toString() !== id) {
  //   return res.status(409).json({ message: "Duplicate username" });
  // }

  user.username = username.toLowerCase();
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "User ID required" });

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) return res.status(400).json({ message: "User has assigned notes" });

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) return res.status(400).json({ message: "User not found" });

  // Delete user
  const result = await user.deleteOne();

  const message = `User ${result.username} with ID ${result._id} deleted`;

  res.json({ message });
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
