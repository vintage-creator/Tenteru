const path = require("path");
const Cron = require("node-cron");
const eventTypeSchema = require("../Utils/inputValidation");
const scrapeEventBriteData = require("../Utils/scrapingWorker");
const mailer = require("../Config/nodemailer");
const User = require("../Models/user_auth");

// Create a map to store scraped event URLs
const scrapedEventUrls = new Map();

const tenteruFn = async (req, res) => {
  try {
    // Extract the relevant fields for validation
    const { eventType } = req.body;

    // Validate and sanitize the input
    const { error } = eventTypeSchema.validate({ eventType }); 
    if (error) {
      console.error("Validation error:", error.details);
      return res
        .status(400)
        .sendFile(path.join(__dirname, "..", "views/404.html"));
    }

    // Access the form data from req.body
    const { location, eventDate } = req.body;
    console.log(location, eventType, eventDate);

    let isFirstRun = true;
    const processEvent = async (userEmail, location, eventType, eventDate) => {

      try {
        const sessionKey = req.sessionID + userEmail;

        const eventWebsite = `https://www.eventbrite.com/d/${location}/events--${eventDate}/${eventType}/`;

        if (scrapedEventUrls.has(sessionKey) && scrapedEventUrls.get(sessionKey).has(eventWebsite)) {
          console.log(`Skipping scraping for ${eventWebsite} as it has already been scraped.`);
          return;
        }

        const eventData = await scrapeEventBriteData(eventWebsite);
        console.log(eventData);

        if (!scrapedEventUrls.has(sessionKey)) {
          scrapedEventUrls.set(sessionKey, new Set());
        }
        scrapedEventUrls.get(sessionKey).add(eventWebsite);

        const emailContent = eventData.map((event) => `
          <div style="display: flex; margin-top: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 10px;">
            <div style="flex: 1;">
              <img src=${event.image} alt="Event image" style="max-width: 100%; height: auto;" />
            </div>
            <div style="flex: 2; padding-left: 20px;">
              <h2 style="margin-bottom: 10px; font-size: 1.2em;">${event.title}</h2>
              <p style="margin: 5px 0;">Date: ${event.date}</p>
              <p style="margin: 5px 0;">Price: ${event.price}</p>
              <a href=${event.link} target="_blank" style="display: block; margin-top: 10px; font-weight: bold; text-decoration: none; color: #007bff;">Register for this event</a>
            </div>
          </div>
        `).join("");

        const emailWithFooter = `
          ${emailContent}
          <footer style="padding: 20px; margin-top: 10px; text-align: center; background-color: black; color: white;">
            <p>
              Made with <span style="color: #ff9400;">&#10084;&#65039;</span> by
              <a href="https://www.linkedin.com/in/israel-abazie/" style="color: yellow; text-decoration: underline;" target="_blank">Israel Abazie</a>
            </p>
            <p>&copy; 2023 Tenteru Technology, All rights reserved.</p>
          </footer>
          <div style="padding: 20px; background-color: #f9f9f9; text-align: center; color: #333;">
            <h3>Your Support Makes a Difference</h3>
            <p>
              At Tenteru, we believe in the transformative power of technology. It's your support
              that fuels our mission to change lives. Every donation, big or small, helps us grow
              and continue to provide valuable services to those who need it most.
            </p>
            <p>
              To make a meaningful contribution, please click the link below:
              <br />
              <a href="https://flutterwave.com/donate/9rk04tkzqyyt" target="_blank" style="color: #007bff;">
                Make a Donation
              </a>
            </p>
          </div>
        `;

        const user = await User.findOne({ email: userEmail });

        if (user) {
          const capitalizedEventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
          mailer(
            user.email,
            `Your Customized ${capitalizedEventType} Event Updates for ${location}`,
            emailWithFooter
          );
        } else {
          console.error(`User with email ${userEmail} not found.`);
        }
      } catch (error) {
        console.error("An error occurred within the Cron job:", error);
      }
    };
    
    Cron.schedule("* * * * *", async () => {
      const now = new Date();
      if (isFirstRun) {

        if (req.session.isAuthenticated) {
          const userEmail = req.session.userEmail;
          await processEvent(userEmail, location, eventType, eventDate);
       
        } else {
          const userEmail = req.session.passport.user;
          await processEvent(userEmail, location, eventType, eventDate);
        }

        isFirstRun = false; // Set isFirstRun to false after the first run.
      } else if (
        !isFirstRun &&
        now.getDate() % 15 === 0 &&
        now.getHours() === 0 &&
        now.getMinutes() === 0
      ) {
        if (req.session.isAuthenticated) {
          const userEmail = req.session.userEmail;
          await processEvent(userEmail, location, eventType, eventDate);
       
        } else {
          const userEmail = req.session.passport.user;
          await processEvent(userEmail, location, eventType, eventDate);
        }
      }
    });

    // Respond to the client
    res.status(200).sendFile(path.join(__dirname, "..", "views/success.html"));
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = tenteruFn;
