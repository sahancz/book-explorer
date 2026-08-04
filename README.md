# Book Explorer - SIT725 Task 4.2P

Book Explorer is an Express and MongoDB application that displays classic books loaded through a REST API. The browser requests `GET /api/books`, and the server retrieves the book documents from MongoDB with Mongoose.

## Technologies Used

- Node.js
- Express
- MongoDB and Mongoose
- Materialize CSS
- HTML, CSS, and JavaScript

## Requirements

- Node.js 16.20.1 or newer
- MongoDB Community Server running on `127.0.0.1:27017`

## Run Locally

Clone the repository and open the project folder:

```bash
git clone https://github.com/sahancz/book-explorer.git
cd book-explorer
```

Install the dependencies and start the server:

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The API is available at [http://localhost:3000/api/books](http://localhost:3000/api/books).

The default database is `bookExplorerDB`, and Mongoose stores the documents in the `books` collection. Six sample books are inserted only when the collection is empty, preventing duplicates when the server restarts.

To use another MongoDB connection or port:

```bash
MONGODB_URI="mongodb://127.0.0.1:27017/anotherDatabase" PORT=3001 npm start
```

## Verify the Database

With MongoDB running, use:

```bash
npm run db:check
```

## Project Structure

```text
book-explorer/
├── public/
│   ├── index.html
│   ├── scripts.js
│   └── styles.css
├── scripts/
│   └── verify-database.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## Author

Sahan Medagedara
