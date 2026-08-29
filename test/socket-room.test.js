const http = require("http");
const { expect } = require("chai");
const { io: createClient } = require("socket.io-client");
const { attachReadingRoom, createApp } = require("../server");

const silentLogger = { error() {}, log() {} };

function createBookModel() {
  return {
    find() {
      return {
        sort() {
          return {
            lean: async () => [],
          };
        },
      };
    },
  };
}

function emitWithAcknowledgement(client, eventName, payload) {
  return new Promise((resolve) => {
    client.emit(eventName, payload, resolve);
  });
}

describe("Live Reading Room Socket.IO events", () => {
  let httpServer;
  let socketServer;
  let serverUrl;
  let clients;

  beforeEach(async () => {
    const app = createApp(createBookModel(), silentLogger);
    httpServer = http.createServer(app);
    socketServer = attachReadingRoom(httpServer, silentLogger);
    clients = [];

    await new Promise((resolve) => {
      httpServer.listen(0, "127.0.0.1", resolve);
    });

    const address = httpServer.address();
    serverUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    clients.forEach((client) => client.close());

    await new Promise((resolve) => {
      socketServer.close(resolve);
    });
  });

  async function connectClient() {
    const client = createClient(serverUrl, {
      forceNew: true,
      transports: ["websocket"],
    });
    clients.push(client);

    await new Promise((resolve, reject) => {
      client.once("connect", resolve);
      client.once("connect_error", reject);
    });

    return client;
  }

  it("rejects a join request without a display name", async () => {
    const client = await connectClient();

    const response = await emitWithAcknowledgement(client, "reader:join", {
      name: "   ",
    });

    expect(response).to.deep.equal({
      ok: false,
      message: "Please enter your name before joining.",
    });
  });

  it("rejects a reading update sent before joining", async () => {
    const client = await connectClient();

    const response = await emitWithAcknowledgement(client, "reading:update", {
      book: "Dracula",
      progress: "Chapter 2",
    });

    expect(response).to.deep.equal({
      ok: false,
      message: "Join the reading room before sharing an update.",
    });
  });

  it("broadcasts a valid reading update to connected readers", async () => {
    const reader = await connectClient();
    const observer = await connectClient();

    const joinResponse = await emitWithAcknowledgement(reader, "reader:join", {
      name: "Sahan",
    });
    expect(joinResponse).to.deep.equal({ ok: true, name: "Sahan" });

    const receivedUpdate = new Promise((resolve) => {
      observer.once("reading:update", resolve);
    });

    const updateResponse = await emitWithAcknowledgement(
      reader,
      "reading:update",
      {
        book: "Dracula",
        progress: "Chapter 2 - meeting Count Dracula",
      }
    );
    const update = await receivedUpdate;

    expect(updateResponse).to.deep.equal({ ok: true });
    expect(update).to.include({
      type: "reading-update",
      name: "Sahan",
      book: "Dracula",
      progress: "Chapter 2 - meeting Count Dracula",
    });
    expect(update.message).to.equal(
      "Sahan is reading Dracula: Chapter 2 - meeting Count Dracula"
    );
  });
});
