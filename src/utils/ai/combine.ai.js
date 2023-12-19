require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class PostureAI {
  
  async combineAlert(data) {
    const { postures, alert, warning, workouts } = data;
    const current_date = Date.now();
    const createMessage = `Combine these notifications together into a summary:
    ${alert}
    ${workouts}
    ${warning}.
    `;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_workout",
        description: `Combine these notifications together into a summary:
        ${alert}
        ${workouts}
        ${warning}.
        `,
        parameters: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              description: `Create a notification summary. make sure it doesn't excceds 60 words`,
            },
            notification_description: {
              type: "string",
              description: `Create notification summary description.`,
            },
            notification_notification_text: {
              type: "string",
              description: `Create the notification summary title. make sure it doesn't excceds 45 words`,
            },
            importance: {
              type: "string",
              enum: ["minor", "serious", "notimportant", "notserious", "important"],
              description: `choose important level`,
            },
          },
          required: [
            "warning",
            "notification_description",
            "notification_notification_text",
            "importance"
          ],
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      functions: functions,
      function_call: "auto",
    });

    const responseMessage = response.choices[0].message;
    console.log({ responseMessage });

    if (responseMessage.function_call) {
      const availableFunctions = {
        get_reviews: this.createWarningObject,
      };
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      const functionResponse = functionToCall(
        functionArgs.warning,
        functionArgs.notification_description,
        functionArgs.notification_notification_text,
        functionArgs.importance
      );
      
      messages.push(responseMessage);
      messages.push({
        role: "function",
        name: functionName,
        content: functionResponse,
      });

      return functionArgs;
    }
  }

  createWarningObject(
    warning,
    notification_description,
    notification_notification_text,
    importance
  ) {
    const reviewInfo = {
        warning,
        notification_description,
        notification_notification_text,
        importance
    };

    return JSON.stringify(reviewInfo);
  }
}

module.exports = new PostureAI();
