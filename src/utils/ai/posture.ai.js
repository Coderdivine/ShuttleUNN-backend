require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class PostureAI {
  async createWarning(data) {
    const { postures } = data;
    const current_date = Date.now();
    const createMessage = `Please act a proffessional human body posture instructor and assistant.`;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_workout",
        description: `Please act a proffessional human body posture instructor and assistant.`,
        parameters: {
          type: "object",
          properties: {
            warning: {
              type: "string",
              description: `Create a posture warning. make sure it doesn't excceds 60 words`,
            },
            warning_description: {
              type: "string",
              description: `Create posture warning description.`,
            },
            warning_notification_text: {
              type: "string",
              description: `Create the posture warning notification title. make sure it doesn't excceds 45 words`,
            },
            damageLevel: {
              type: "string",
              enum: ["minor", "serious", "notimportant", "notserious", "important"],
              description: `choose a warning level damage`,
            },
          },
          required: [
            "warning",
            "warning_description",
            "warning_notification_text",
            "damageLevel"
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
        functionArgs.warning_description,
        functionArgs.warning_notification_text,
        functionArgs.damageLevel
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
    warning_description,
    warning_notification_text,
    damageLevel
  ) {
    const reviewInfo = {
        warning,
        warning_description,
        warning_notification_text,
        damageLevel
    };

    return JSON.stringify(reviewInfo);
  }

  async createAlert(data) {
    const { postures } = data;
    const current_date = Date.now();
    const createMessage = `Please act a proffessional human body posture instructor and assistant.`;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_workout",
        description: `Please act a proffessional human body posture instructor and assistant.`,
        parameters: {
          type: "object",
          properties: {
            alert: {
              type: "string",
              description: `Create a posture alert. make sure it doesn't excceds 60 words`,
            },
            alert_description: {
              type: "string",
              description: `Create posture alert description.`,
            },
            alert_notification_text: {
              type: "string",
              description: `Create the posture alert notification title. make sure it doesn't excceds 45 words`,
            },
            damageLevel: {
              type: "string",
              enum: ["minor", "serious", "notimportant", "notserious", "important"],
              description: `choose a alert level`,
            },
          },
          required: [
            "alert",
            "alert_description",
            "alert_notification_text",
            "damageLevel"
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
        get_reviews: this.createAlertObject,
      };
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      const functionResponse = functionToCall(
        functionArgs.alert,
        functionArgs.alert_description,
        functionArgs.alert_notification_text,
        functionArgs.damageLevel
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

  createAlertObject(
    alert,
    alert_description,
    alert_notification_text,
    damageLevel
  ) {
    const reviewInfo = {
        alert,
        alert_description,
        alert_notification_text,
        damageLevel
    };

    return JSON.stringify(reviewInfo);
  }
}

module.exports = new PostureAI();
