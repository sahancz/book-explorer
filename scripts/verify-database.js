const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookExplorerDB";

async function verifyDatabase() {
  await mongoose.connect(MONGODB_URI);

  const database = mongoose.connection.db;
  const collectionNames = (
    await database.listCollections().toArray()
  ).map(({ name }) => name);
  const bookCount = await database.collection("books").countDocuments();
  const sampleBook = await database.collection("books").findOne(
    {},
    { projection: { _id: 0, title: 1, author: 1 } }
  );

  const valid = collectionNames.includes("books") && bookCount === 6;

  console.log("========================================");
  console.log("SIT725 Task 4.2P - MongoDB Verification");
  console.log("========================================");
  console.log(`Connection: ${MONGODB_URI}`);
  console.log(`Database:   ${database.databaseName}`);
  console.log(`Collection: books`);
  console.log(`Documents:  ${bookCount}`);
  console.log(`Example:    ${sampleBook.title} by ${sampleBook.author}`);
  console.log(`Status:     ${valid ? "PASS - database is working" : "FAIL"}`);

  await mongoose.disconnect();

  if (!valid) {
    process.exitCode = 1;
  }
}

verifyDatabase().catch((error) => {
  console.error("Database verification failed:", error.message);
  process.exitCode = 1;
});
