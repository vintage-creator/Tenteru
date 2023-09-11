const puppeteer = require("puppeteer");

async function scrapeEventBriteData(eventWebsite) {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(eventWebsite, { waitUntil: "domcontentloaded" });

    // Wait for the target container to be present
    const containerSelector = ".discover-horizontal-event-card .Container_root__16e3w";
    await page.waitForSelector(containerSelector);
    await page.waitForSelector('.Typography_root__4bejd');

    const eventData = await page.evaluate(() => {
      const eventElements = document.querySelectorAll(".discover-horizontal-event-card .Container_root__16e3w");
      if (!eventElements) return [];

      const events = [];

      eventElements.forEach(element => {
        const image = element.querySelector('.event-card-image')?.src || 'N/A';
        const title = element.querySelector('h2')?.textContent || 'N/A';
        const date = element.querySelectorAll('.Typography_root__4bejd')[1]?.textContent || 'N/A';
        const price = element.querySelectorAll('.Typography_root__4bejd')[3]?.textContent || 'N/A';
        const link = element.querySelector('a')?.href || '#';

        events.push({ image, title, date, price, link });
      });

      return events;
    });

    await browser.close();

    return eventData;

  } catch (error) {
    console.error("Scraping Error:", error);
  }
}

module.exports = scrapeEventBriteData;
