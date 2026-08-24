const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../server");

function createBookModel(resultProvider) {
  return {
    find() {
      return {
        sort() {
          return {
            lean: resultProvider,
          };
        },
      };
    },
  };
}

describe("GET /api/books", () => {
  it("returns the books with a 200 status", async () => {
    const books = [{ title: "Pride and Prejudice", author: "Jane Austen" }];
    const app = createApp(createBookModel(async () => books));

    const response = await request(app).get("/api/books");

    expect(response.status).to.equal(200);
    expect(response.body.statusCode).to.equal(200);
    expect(response.body.data).to.deep.equal(books);
    expect(response.body.message).to.equal(
      "Books retrieved successfully from MongoDB"
    );
  });

  it("returns a 500 response when retrieving books fails", async () => {
    const failingModel = createBookModel(async () => {
      throw new Error("Database unavailable");
    });
    const silentLogger = { error() {} };
    const app = createApp(failingModel, silentLogger);

    const response = await request(app).get("/api/books");

    expect(response.status).to.equal(500);
    expect(response.body).to.deep.equal({
      statusCode: 500,
      data: [],
      message: "Unable to retrieve books from MongoDB",
    });
  });
});
