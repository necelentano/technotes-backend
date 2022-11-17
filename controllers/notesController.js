const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler"); // keep us from using so many try catch when we use async methods with mongoose

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();

  if (!notes?.length)
    return res.status(400).json({ message: "No notes found" });

  //   Add username to each note before sending the response
  //   See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  //   You could also do this with a for...of loop
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create and store new user
  const note = await Note.create({
    user,
    title,
    text,
  });

  if (!note)
    return res.status(400).json({ message: "Invalid note data received" });

  res.status(201).json({ message: `New note created` });
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  const note = await Note.findById(id).exec();

  if (!note) return res.status(400).json({ message: "Note not found" });

  // Check for duplicate title OR just set unique: true for title in the Note model and skip this part, but don't forget handle error
  // const duplicate = await Note.findOne({ title }).lean().exec()

  // // Allow renaming of the original note
  // if (duplicate && duplicate?._id.toString() !== id) {
  //     return res.status(409).json({ message: 'Duplicate note title' })
  // }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json({ message: `${updatedNote.title} updated` });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "Note ID required" });

  // Does the note exist to delete?
  const note = await Note.findById(id).exec();

  if (!note) return res.status(400).json({ message: "Note not found" });

  // Delete note
  const result = await note.deleteOne();

  const message = `Note ${result.title} with ID ${result._id} deleted`;

  res.json({ message });
});

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };
