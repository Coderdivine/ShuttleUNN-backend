require("dotenv").config();
const open_ai = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new open_ai({
  apiKey,
});
const CustomError = require("../custom-error");
const { AffectedBodyParts } = require("../../config");


class MessageAI {

  async generateMessage(data) {
    const { message, recentPosture, recentWorkoutGiven, recentMessages, useProfile } =
      data;
    const current_date = Date.now();
    const createMessage = `message => ${message}. to answer, please note: user recent postures: ${recentPosture}, and also User was given to following exercises to do, (Not all exercises was done): ${recentWorkoutGiven} and today is ${current_date}`;
    const messages = [
        { role: "assistant", content: `Be a posture, healthy, and productive assistant named Magic Fix, help user achieve good posture, healthy, and productive lifestyle. feel free to answer any other questions concerning the user: hobby, posture, body building, sitting time and all. here are things you need to know about user: ${useProfile} ${useProfile}. Also please be a posture and productive assitant and explain user's part of the body for exmaple: ${this.affectedPartsInText()}. Also help the user answer any health question with or without a '?' concerning human body`},
        ...recentMessages,
        { role: "user", content: createMessage + "Be a posture, healthy, and productive assistant named Magic Fix, help user achieve good posture, healthy, and productive lifestyle. feel free to answer any other questions concerning the user: hobby, posture, body building, sitting time and all." + "here are things you need to know about user:" + useProfile + ". Also please be a posture and productive assitant and explain user's part of the body for exmaple:" + this.affectedPartsInText() + ". Also help the user answer any health question with or without a '?' concerning human body" }
    ];
    const functions = [
      {
        name: "create_message",
        description: ` Be a posture, healthy, and productive assistant named Magic Fix, help user achieve good posture, healthy, and productive lifestyle`,
        parameters: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: `Be a posture, healthy, and productive assistant named Magic Fix, help user achieve good posture, healthy, and productive lifestyle, recommend easy exercises humans can easily implement and not out of the box, make the chat easy to understand, easy to implement, make it simple and straight forward to read so that anyone can understand`,
            }
          },
          required: [
            "message"
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
        create_message: this.createMessage,
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
        parsedArgs.message
      );

      messages.push(responseMessage);
      messages.push({
        role: "function",
        name: functionName,
        content: functionResponse,
      });

      console.log({ ...parsedArgs, createMessage });

       return { ...parsedArgs, createMessage };
    }
  }
  
  affectedPartsInText(){
    return AffectedBodyParts.map(ap => `${ap},`).join("")
  }
  
  createMessage(
    message
  ) {
    const reviewInfo = {
        message
    };

    return (reviewInfo);
  }

}

module.exports = new MessageAI();
