const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookExplorerDB";

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

function createApp(bookModel = Book, logger = console) {
  const app = express();

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/api/books", async (request, response) => {
    try {
      const books = await bookModel.find().sort({ _id: 1 }).lean();

      response.json({
        statusCode: 200,
        data: books,
        message: "Books retrieved successfully from MongoDB",
      });
    } catch (error) {
      logger.error("Unable to retrieve books:", error);
      response.status(500).json({
        statusCode: 500,
        data: [],
        message: "Unable to retrieve books from MongoDB",
      });
    }
  });

  return app;
}

const app = createApp();

function cleanText(value, maximumLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maximumLength);
}

function attachReadingRoom(httpServer, logger = console) {
  const io = new Server(httpServer);

  function broadcastReaderCount() {
    io.emit("reader:count", { count: io.engine.clientsCount });
  }

  io.on("connection", (socket) => {
    logger.log(`Reading Room connection: ${socket.id}`);
    broadcastReaderCount();

    socket.on("reader:join", (payload = {}, acknowledge = () => {}) => {
      const name = cleanText(payload.name, 30);

      if (!name) {
        acknowledge({
          ok: false,
          message: "Please enter your name before joining.",
        });
        return;
      }

      socket.data.readerName = name;

      io.emit("reader:activity", {
        type: "joined",
        name,
        message: `${name} joined the Live Reading Room.`,
        timestamp: new Date().toISOString(),
      });

      acknowledge({ ok: true, name });
    });

    socket.on("reading:update", (payload = {}, acknowledge = () => {}) => {
      const name = socket.data.readerName;
      const book = cleanText(payload.book, 80);
      const progress = cleanText(payload.progress, 120);

      if (!name) {
        acknowledge({
          ok: false,
          message: "Join the reading room before sharing an update.",
        });
        return;
      }

      if (!book || !progress) {
        acknowledge({
          ok: false,
          message: "Choose a book and enter a reading update.",
        });
        return;
      }

      const update = {
        type: "reading-update",
        name,
        book,
        progress,
        message: `${name} is reading ${book}: ${progress}`,
        timestamp: new Date().toISOString(),
      };

      io.emit("reading:update", update);
      acknowledge({ ok: true });
    });

    socket.on("disconnect", () => {
      const name = socket.data.readerName;

      if (name) {
        socket.broadcast.emit("reader:activity", {
          type: "left",
          name,
          message: `${name} left the Live Reading Room.`,
          timestamp: new Date().toISOString(),
        });
      }

      logger.log(`Reading Room disconnection: ${socket.id}`);
      broadcastReaderCount();
    });
  });

  return io;
}

async function startServer() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await seedDatabase();

  const httpServer = http.createServer(app);
  const io = attachReadingRoom(httpServer);

  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(PORT, () => {
      console.log(`Book Explorer is running at http://localhost:${PORT}`);
      console.log("Live Reading Room is ready for Socket.IO connections");
      resolve();
    });
  });

  return { httpServer, io };
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Unable to start Book Explorer:", error);
    process.exitCode = 1;
  });
}

module.exports = { app, attachReadingRoom, createApp, startServer };
