document.addEventListener("DOMContentLoaded", loadBooks);

async function loadBooks() {
  const bookList = document.getElementById("book-list");
  const loading = document.getElementById("loading");

  try {
    const response = await fetch("/api/books");

    if (!response.ok) {
      throw new Error("Unable to retrieve books");
    }

    const result = await response.json();

    loading.style.display = "none";

    result.data.forEach((book) => {
      bookList.insertAdjacentHTML("beforeend", createBookCard(book));
    });
  } catch (error) {
    loading.innerHTML = `
      <p class="red-text">
        The books could not be loaded. Please try again.
      </p>
    `;

    console.error(error);
  }
}

function createBookCard(book) {
  return `
    <div class="col s12 m6 l4">
      <div class="card book-card">
        <div class="card-image">
          <img
            src="${book.image}"
            alt="Cover of ${book.title}"
          >
        </div>

        <div class="card-content">
          <span class="card-title">${book.title}</span>
          <p class="book-author">by ${book.author}</p>
          <p>${book.description}</p>
        </div>

        <div class="card-action">
          <a
            href="https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(
              book.title
            )}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find the book
          </a>
        </div>
      </div>
    </div>
  `;
}