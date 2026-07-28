# Book Explorer

Book Explorer is a simple web application created for SIT725 Task 3.2P. It uses an Express server, a Materialize interface, and a REST API to display a collection of classic books.

## Technologies Used

- Node.js
- Express
- Materialize CSS
- HTML
- CSS
- JavaScript

## How to Run the Application

Clone the repository:

```bash
git clone https://github.com/sahancz/book-explorer.git
```

Open the project folder:

```bash
cd book-explorer
```

Install the required dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

## REST API Endpoint

The application provides the following GET endpoint:

```text
http://localhost:3000/api/books
```

The endpoint returns the book information as JSON data.

## Project Structure

```text
book-explorer/
├── public/
│   ├── index.html
│   ├── scripts.js
│   └── styles.css
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## GitHub Repository

https://github.com/sahancz/book-explorer

## Author

Sahan Medagedara
