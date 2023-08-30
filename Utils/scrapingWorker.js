const puppeteer = require("puppeteer");

async function scrapeEventBriteData(eventWebsite) {
  try {
    const browser = await puppeteer.launch({ headless: "new" }); // Change headless option if needed
    const page = await browser.newPage();

    await page.goto(eventWebsite, { waitUntil: "domcontentloaded" });

    // Wait for the target container to be present
    const containerSelector = ".Container_root__16e3w";
    await page.waitForSelector(containerSelector);

    const eventData = await page.evaluate((page) => {
      const eventElements = document.querySelectorAll(".Container_root__16e3w");
      const events = [];

      eventElements.forEach((element) => {
        const image = element.querySelector('.event-card-image')?.src || 'N/A';
        const title = element.querySelector('h2')?.textContent || 'N/A';
        const price = element.querySelector('p:nth-child(3)')?.textContent || 'N/A';
        const date = element.getElementsByClassName('Typography_root__4bejd')[1]?.textContent || 'N/A';
        const link = element.querySelector('a')?.href || '#';

        events.push({ image, title, date, price, link });
      });

      return events;
    }, page);

    await browser.close();

    return eventData;

  } catch (error) {
    console.error("Scraping Error:", error);
  }
}

module.exports = scrapeEventBriteData;
