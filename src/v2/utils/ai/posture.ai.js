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
    const { postures, profile } = data;
    const current_date = Date.now();
    const createMessage = `Be a proffessional human body posture instructor and assistant.
    Provide warning about user postures listed below.
    here's the user's recent posture:
    ${postures}, current date: ${current_date}.
    ${profile}
    `;
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
              description: `
              Create a posture warning. make sure it doesn't excceds 60 characters, for example: 
              1. You've been slouching for <time e.g., 2 mins>.
              2. Your neck is stiff. Just come up with something similar to these examples, making sure it's based on the given posture and date/time.
              3. You've been <posture e.g., slouching> for <time e.g., 2 minutes>.
              4. You've been maintaining <condition e.g good> posture so far.
              5. Sitting for <time e.g., 4hrs> < emojis e.g ? e.g., !, :(>.
              6. Time for a workout
              7. Slouching can reduce your height from <height e.g., 6.75> to <predicted height e.g., 6.58>
              `,
            },
            warning_description: {
              type: "string",
              description: `
              Create posture warning description. make this brief as possible while coveying the warning properly, For example:
              Your left arm has been at a bad angle; try sitting upright.
              Stand up and walk around for <duration e.g min:30sec max:2mins> enhance productivity.
              Sitting upright will <increase/decrease> your productivity by <percentage e.g., 2%> for the <date e.g., day, week>.
              You're <conditoin e.g good> for the day.
              Perform these <duration e.g., 1 minute> exercises.
              Your body angle shows you've been slouching.
              You've been sitting properly for 2 minutes; keep it up!.
              Try ensuring that your left shoulder is at an angle of <degree>.
              Your neck has been stiff.
              We've recommended some new workouts for you to do.
              Make both of your shoulders at the same angle and height.
              Based on your waist angle, you've been sitting without back support.
              Please lean your back on a chair.
              Just come up with something similar to these examples, making sure it's based on the given posture and date/time.`,
            },
            warning_notification_text: {
              type: "string",
              description: `Create the posture warning notification title. make sure it doesn't excceds 45 words`,
            },
            damageLevel: {
              type: "string",
              enum: [
                "minor",
                "serious",
                "notimportant",
                "notserious",
                "important",
              ],
              description: `choose a warning level damage`,
            },
            areas: {
              type: "string",
              enum: AffectedBodyParts,
              description:
                "Please choose the area of the body affected by the postures given",
            },
          },
          required: [
            "warning",
            "warning_description",
            "warning_notification_text",
            "damageLevel",
            "areas",
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
        create_warning: this.createWarningObject,
      };
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = responseMessage.function_call.arguments;
      console.log({ functionArgs });

      let parsedArgs;
      try {
        parsedArgs = JSON.parse(functionArgs);
      } catch (error) {
        console.error("Error parsing JSON arguments:", error.message);
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
      console.log({ parsedArgs });

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
      areas,
    };

    return reviewInfo;
  }

  async createAlert(data) {
    const { postures, profile } = data;
    const current_date = Date.now();
    const createMessage = `Be a proffessional human body posture instructor and assistant. send user posture alert based on his/her recent posture:
    ${postures}, current date: ${current_date}.
    ${profile}
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
              enum: [
                "minor",
                "serious",
                "notimportant",
                "notserious",
                "important",
              ],
              description: `choose a alert level`,
            },
            areas: {
              type: "string",
              enum: AffectedBodyParts,
              description:
                "Please choose the area of the body affected by the postures given",
            },
          },
          required: [
            "alert",
            "alert_description",
            "alert_notification_text",
            "damageLevel",
            "areas",
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
        console.error("Error parsing JSON arguments:", error.message);
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
      areas,
    };

    return reviewInfo;
  }

  async weeklyReport(data) {
    const { current, previous } = data;
    const current_date = Date.now();
    const createMessage = `
      Be a pro human posture assistant and and exercises guardian.
      Give a weekly report based a user recent week postures: ${current} and previous week postures: ${previous},
      Take note of today's date: ${current_date}.
    `;

    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_weekly_report",
        description: `Be a pro posture assistant and guardian.`,
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: `Create a weekly report title. make sure it doesn't excceds 60 words, for example: An 18% improvement in last weeks posture. keep up!, You had a 2% increase in your total sitting time, Weekly round-up, showing good improvement, It's a new week; keep up with your productive ways!, and so on`,
            },
            description: {
              type: "string",
              description: `Create a weekly report description. give a good explaination.`,
            },
          },
          required: ["title", "description"],
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
        create_weekly_report: (title, description) => {
          const reviewInfo = {
            title,
            description,
          };
      
          return reviewInfo;
        },
      };
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = responseMessage.function_call.arguments;

      let parsedArgs;
      try {
        parsedArgs = JSON.parse(functionArgs);
      } catch (error) {
        console.error("Error parsing JSON arguments:", error.message);
        throw new CustomError("Unable to parse JSON arguments.", 400);
      }

      const functionResponse = functionToCall(
        parsedArgs.title,
        parsedArgs.description
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

  createWeeklyObject(title, description) {
    const reviewInfo = {
      title,
      description,
    };

    return reviewInfo;
  }
}

module.exports = new PostureAI();
