const Joi = require("joi");

const eventTypeSchema = Joi.object({
  eventType: Joi.string()
    .trim() // Trim whitespace from the input
    .lowercase()
    .valid(
      "conference",
      "workshop",
      "seminar",
      "meetup",
      "webinar",
      "tech",
      "hackathon",
      "music concert",
      "art exhibition",
      "fitness class",
      "food festival",
      "comedy show"
    ) // Validate allowed values
    .required(),
});

module.exports = eventTypeSchema;
