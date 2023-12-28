require("dotenv").config();
const open_ai = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new open_ai({
  apiKey,
});
const { AffectedBodyParts } = require("../../config");
const CustomError = require("../custom-error");



class PostureAI {

  async createWarning(data) {
    const { postures } = data;
    const current_date = Date.now();
    const createMessage = `Be a proffessional human body posture instructor and assistant.
    here's the user's recent posture:
    ${postures}, current date: ${current_date}`;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_warning",
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
            areas: {
              type:"string",
              enum: AffectedBodyParts,
              description: "Please choose the area of the body affected by the postures given"
          }
          },
          required: [
            "warning",
            "warning_description",
            "warning_notification_text",
            "damageLevel",
            "areas"
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
    console.log({ responseMessage })

    if (responseMessage.function_call) {
      const availableFunctions = {
        create_warning: this.createWarningObject,
      };
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = responseMessage.function_call.arguments;
      console.log({ functionArgs })

      let parsedArgs;
        try {
            parsedArgs = JSON.parse(functionArgs);
        } catch (error) {
            console.error('Error parsing JSON arguments:', error.message);
            throw new CustomError("Unable to parse JSON arguments.", 400);
        }
        
      const functionResponse = functionToCall(
        parsedArgs.warning,
        parsedArgs.warning_description,
        parsedArgs.warning_notification_text,
        parsedArgs.damageLevel,
        parsedArgs.areas
      );
      
      messages.push(responseMessage);
      messages.push({
        role: "function",
        name: functionName,
        content: functionResponse,
      });
      console.log({ parsedArgs })

      return parsedArgs;
    }
  }

  createWarningObject(
    warning,
    warning_description,
    warning_notification_text,
    damageLevel,
    areas
  ) {
    const reviewInfo = {
        warning,
        warning_description,
        warning_notification_text,
        damageLevel,
        areas
    };

    return reviewInfo;
  }

  async createAlert(data) {
    const { postures } = data;
    const current_date = Date.now();
    const createMessage = `Be a proffessional human body posture instructor and assistant. send user posture alert based on his/her recent posture:
    ${postures}, current date -> ${current_date}
    `;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_alert",
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
            areas: {
              type:"string",
              enum: AffectedBodyParts,
              description: "Please choose the area of the body affected by the postures given"
          }
          },
          required: [
            "alert",
            "alert_description",
            "alert_notification_text",
            "damageLevel",
            "areas"
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

    if (responseMessage.function_call) {
      const availableFunctions = {
        create_alert: this.createAlertObject,
      };
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = responseMessage.function_call.arguments;

      let parsedArgs;
      try {
          parsedArgs = JSON.parse(functionArgs);
      } catch (error) {
          console.error('Error parsing JSON arguments:', error.message);
          throw new CustomError("Unable to parse JSON arguments.", 400);
      }

      const functionResponse = functionToCall(
        parsedArgs.alert,
        parsedArgs.alert_description,
        parsedArgs.alert_notification_text,
        parsedArgs.damageLevel,
        parsedArgs.areas
      );
      
      messages.push(responseMessage);
      messages.push({
        role: "function",
        name: functionName,
        content: functionResponse,
      });

      return parsedArgs;
    }
  }

  createAlertObject(
    alert,
    alert_description,
    alert_notification_text,
    damageLevel,
    areas
  ) {
    const reviewInfo = {
        alert,
        alert_description,
        alert_notification_text,
        damageLevel,
        areas
    };

    return reviewInfo;
  }
}

module.exports = new PostureAI();
