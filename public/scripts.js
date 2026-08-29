document.addEventListener("DOMContentLoaded", async () => {
  const books = await loadBooks();
  initializeReadingRoom(books);
});

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

    return result.data;
  } catch (error) {
    loading.innerHTML = `
      <p class="red-text">
        The books could not be loaded. Please try again.
      </p>
    `;

    console.error(error);
    return [];
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

function initializeReadingRoom(books) {
  const socket = io();
  const joinForm = document.getElementById("join-room-form");
  const updateForm = document.getElementById("reading-update-form");
  const nameInput = document.getElementById("reader-name");
  const bookSelect = document.getElementById("reading-book");
  const progressInput = document.getElementById("reading-progress");
  const joinButton = document.getElementById("join-room-button");
  const updateButton = document.getElementById("share-update-button");
  const joinedReader = document.getElementById("joined-reader");
  const activityFeed = document.getElementById("activity-feed");
  const readerCount = document.getElementById("reader-count");
  const connectionStatus = document.getElementById("connection-status");

  let joinedName = "";

  books.forEach((book) => {
    const option = document.createElement("option");
    option.value = book.title;
    option.textContent = book.title;
    bookSelect.appendChild(option);
  });

  function updateConnectionStatus(connected) {
    connectionStatus.classList.toggle("online", connected);
    connectionStatus.classList.toggle("offline", !connected);
    connectionStatus.lastChild.textContent = connected
      ? " Connected live"
      : " Reconnecting...";
    setUpdateControls();
  }

  function setUpdateControls() {
    const enabled = Boolean(joinedName) && socket.connected;
    bookSelect.disabled = !enabled;
    progressInput.disabled = !enabled;
    updateButton.disabled = !enabled;
  }

  function showMessage(message, classes = "") {
    M.toast({ html: message, classes });
  }

  function addActivity(update) {
    const emptyItem = activityFeed.querySelector(".empty-activity");

    if (emptyItem) {
      emptyItem.remove();
    }

    const item = document.createElement("li");
    item.className = "collection-item activity-item";

    const icon = document.createElement("i");
    icon.className = "material-icons activity-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = update.type === "reading-update" ? "auto_stories" : "person";

    const content = document.createElement("div");
    content.className = "activity-content";

    const message = document.createElement("p");
    message.textContent = update.message;

    const time = document.createElement("time");
    time.dateTime = update.timestamp;
    time.textContent = new Date(update.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    content.append(message, time);
    item.append(icon, content);
    activityFeed.prepend(item);

    while (activityFeed.children.length > 8) {
      activityFeed.lastElementChild.remove();
    }
  }

  function joinReader(name, showConfirmation = true) {
    socket.emit("reader:join", { name }, (response) => {
      if (!response.ok) {
        showMessage(response.message, "red darken-2");
        return;
      }

      joinedName = response.name;
      nameInput.disabled = true;
      joinButton.disabled = true;
      joinedReader.classList.remove("hide");
      joinedReader.textContent = `Joined as ${joinedName}`;
      setUpdateControls();

      if (showConfirmation) {
        showMessage(`Welcome to the room, ${joinedName}.`, "teal");
      }
    });
  }

  socket.on("connect", () => {
    updateConnectionStatus(true);

    if (joinedName) {
      joinReader(joinedName, false);
    }
  });

  socket.on("disconnect", () => {
    updateConnectionStatus(false);
    readerCount.textContent = "0";
  });

  socket.on("reader:count", ({ count }) => {
    readerCount.textContent = String(count);
  });

  socket.on("reader:activity", addActivity);
  socket.on("reading:update", addActivity);

  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();

    if (!socket.connected) {
      showMessage("The live connection is not ready yet.", "red darken-2");
      return;
    }

    joinReader(name);
  });

  updateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit(
      "reading:update",
      {
        book: bookSelect.value,
        progress: progressInput.value,
      },
      (response) => {
        if (!response.ok) {
          showMessage(response.message, "red darken-2");
          return;
        }

        progressInput.value = "";
        showMessage("Reading update shared live.", "teal");
      }
    );
  });
}
