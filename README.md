# Book Explorer - SIT725 Project

Book Explorer is an Express and MongoDB application that displays classic books loaded through a REST API. It also includes a Socket.IO Live Reading Room where connected readers can share book updates instantly without refreshing the page.

## Technologies Used

- Node.js
- Express
- Socket.IO
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

## Automated tests

The project uses Mocha and Chai for automated testing, with Supertest for the
Express API and Socket.IO Client for real-time integration tests. The test suite
covers the books endpoint, reading-time calculation and Live Reading Room
events, including valid, invalid and edge-case behaviour.

```bash
npm test
```

Open [http://localhost:3000](http://localhost:3000). The API is available at [http://localhost:3000/api/books](http://localhost:3000/api/books).

## Live Reading Room

The Socket.IO feature is an original real-time use case built for Task 7.3P:

1. Open the application in two browser windows.
2. Join the room with a different display name in each window.
3. Choose a book and share a reading update.
4. Confirm that the update appears immediately in both windows.

The server handles these custom events:

- `reader:join` validates and registers a display name.
- `reading:update` validates and broadcasts a live book update.
- `reader:activity` announces when readers join or leave.
- `reader:count` keeps the online-reader count synchronized.

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
├── test/
│   ├── books-api.test.js
│   ├── reading-time.test.js
│   └── socket-room.test.js
├── utils/
│   └── reading-time.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## Author

Sahan Medagedara
