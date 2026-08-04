const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookExplorerDB";

app.use(express.static(path.join(__dirname, "public")));

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
  },
  { versionKey: false }
);

const Book = mongoose.model("Book", bookSchema);

const seedBooks = [
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description:
      "Elizabeth Bennet navigates family expectations, first impressions, and an unexpected romance.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    description:
      "A scientist creates life and must confront the consequences of his ambition.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439471-L.jpg",
  },
  {
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description:
      "Sherlock Holmes and Dr Watson investigate a collection of mysterious cases.",
    image: "https://covers.openlibrary.org/b/id/12376923-L.jpg",
  },
  {
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    description:
      "A young man pursues eternal youth while a portrait reveals the cost of his choices.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg",
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    description:
      "A group of friends confronts the mysterious Count Dracula.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439846-L.jpg",
  },
  {
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    description:
      "Alice follows a white rabbit into a strange world filled with curious characters.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439761-L.jpg",
  },
];

async function seedDatabase() {
  const bookCount = await Book.countDocuments();

  if (bookCount === 0) {
    await Book.insertMany(seedBooks);
    console.log(`Inserted ${seedBooks.length} sample books into MongoDB`);
  }
}

app.get("/api/books", async (request, response) => {
  try {
    const books = await Book.find().sort({ _id: 1 }).lean();

    response.json({
      statusCode: 200,
      data: books,
      message: "Books retrieved successfully from MongoDB",
    });
  } catch (error) {
    console.error("Unable to retrieve books:", error);
    response.status(500).json({
      statusCode: 500,
      data: [],
      message: "Unable to retrieve books from MongoDB",
    });
  }
});

async function startServer() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`Book Explorer is running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start Book Explorer:", error);
  process.exitCode = 1;
});
