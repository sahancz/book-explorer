const { expect } = require("chai");
const { calculateReadingTime } = require("../utils/reading-time");

describe("calculateReadingTime", () => {
  it("calculates reading time for valid page and speed values", () => {
    expect(calculateReadingTime(120, 40)).to.equal(3);
  });

  it("uses 30 pages per hour when a reading speed is not supplied", () => {
    expect(calculateReadingTime(45)).to.equal(1.5);
  });

  it("returns zero hours for a zero-page book", () => {
    expect(calculateReadingTime(0, 40)).to.equal(0);
  });

  it("rejects invalid page and reading speed values", () => {
    expect(() => calculateReadingTime(-1, 30)).to.throw(
      "Pages must be a non-negative number"
    );
    expect(() => calculateReadingTime(100, 0)).to.throw(
      "Pages per hour must be greater than zero"
    );
  });
});
