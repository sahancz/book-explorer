function calculateReadingTime(pages, pagesPerHour = 30) {
  if (!Number.isFinite(pages) || pages < 0) {
    throw new TypeError("Pages must be a non-negative number");
  }

  if (!Number.isFinite(pagesPerHour) || pagesPerHour <= 0) {
    throw new TypeError("Pages per hour must be greater than zero");
  }

  return Math.round((pages / pagesPerHour) * 100) / 100;
}

module.exports = { calculateReadingTime };
