const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

const books = [
  {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description:
      "Elizabeth Bennet navigates family expectations, first impressions, and an unexpected romance.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
  },
  {
    id: 2,
    title: "Frankenstein",
    author: "Mary Shelley",
    description:
      "A scientist creates life and must confront the consequences of his ambition.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439471-L.jpg",
  },
  {
    id: 3,
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description:
      "Sherlock Holmes and Dr Watson investigate a collection of mysterious cases.",
    image: "https://covers.openlibrary.org/b/isbn/9780199536955-L.jpg",
  },
  {
    id: 4,
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    description:
      "A young man pursues eternal youth while a portrait reveals the cost of his choices.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg",
  },
  {
    id: 5,
    title: "Dracula",
    author: "Bram Stoker",
    description:
      "A group of friends confronts the mysterious Count Dracula.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439846-L.jpg",
  },
  {
    id: 6,
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    description:
      "Alice follows a white rabbit into a strange world filled with curious characters.",
    image: "https://covers.openlibrary.org/b/isbn/9780141439761-L.jpg",
  },
];

app.get("/api/books", (request, response) => {
  response.json({
    statusCode: 200,
    data: books,
    message: "Books retrieved successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Book Explorer is running at http://localhost:${PORT}`);
});