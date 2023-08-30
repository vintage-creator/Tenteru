const path = require("path");
const Cron = require("node-cron");
const eventTypeSchema = require("../Utils/inputValidation");
const scrapeEventBriteData = require("../Utils/scrapingWorker");
const mailer = require("../Config/nodemailer");

const tenteruFn = (req, res) => {
  // Extract the relevant fields for validation
  const { eventType } = req.body;

  // Validate and sanitize the input
  const { error, value } = eventTypeSchema.validate({ eventType }); // Validate only the eventType field
  if (error) {
    console.error("Validation error:", error.details);
    return res.sendFile(path.join(__dirname, "..", "views/404.html"));
  }

  // Access the form data from req.body
  const { location, eventDate } = req.body; // Exclude eventType
  console.log(location, eventType, eventDate);

  // Define the cron schedule (e.g., every day at 8 AM)
  Cron.schedule("* * * * *", async () => {
    const eventWebsite = `https://www.eventbrite.com/d/${location}/events--${eventDate}/${eventType}/`;
    const eventData = await scrapeEventBriteData(eventWebsite);
    console.log(eventData);

    // Create email content for all events
    const emailContent = eventData.map((event) => `
      <div style="display: flex;">
        <div style="flex: 1;">
          <img src=${event.image} alt="Event image" style="max-width: 100%; height: auto;" />
        </div>
        <div style="flex: 2; padding-left: 20px;">
          <h2>${event.title}</h2>
          <p>Date: ${event.date}</p>
          <p>Price: ${event.price}</p>
          <a href=${event.link} target="_blank">Register for this event</a>
        </div>
      </div>
    `).join('');

     // Add footer to the email content
     const emailWithFooter = `
     ${emailContent}
     <footer style="margin-top: 10px; background-color: #1f1e1e; padding: 10px; color: white;">
        <p>
          Made with <span style="color: #ff9400;">&#10084;&#65039;</span> by <a href="https://www.linkedin.com/in/israel-abazie/" style="color: #0c62db; text-decoration: underline;" target="_blank">Israel Abazie</a>
        </p>
        <p>
          &copy; 2023 Tenteru Technology, All rights reserved.
        </p>
      </footer>
   `;

    // Send the email with all event data
    mailer("chuksy3@gmail.com", `Your Customized Event Updates for ${location} are Here!`, emailWithFooter);
  });

  // Respond to the client
  res.sendFile(path.join(__dirname, "..", "views/success.html"));
};

module.exports = tenteruFn;
