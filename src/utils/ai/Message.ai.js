require("dotenv").config();
const open_ai = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new open_ai({
  apiKey,
});
const CustomError = require("../custom-error");



class MessageAI {

  async generateMessage(data) {
    const { message, recentPosture, recentWorkoutGiven } =
      data;
    const current_date = Date.now();
    const createMessage = `${message}. Please note user recent postures: ${recentPosture}, and also ${recentWorkoutGiven} and today is ${current_date}`;
    console.log({ createMessage })
    const messages = [
        { role: "assistant", content:" Be a posture, healthy, and productive assistant named Magic Fix, help user achieve good posture, healthy, and productive lifestyle"},
        { role: "user", content: createMessage }];
      const functions = [
      {
        name: "create_message",
        description: ` Be a posture, healthy, and productive assistant named Magic Fix, help user achieve good posture, healthy, and productive lifestyle`,
        parameters: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: `Be a posture, healthy, and productive assistant named Magic Fix, help user achieve good posture, healthy, and productive lifestyle, make the chat easy to understand, easy to implement.`,
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
    // if (responseMessage.function_call) {
    //   const availableFunctions = {
    //     create_message: this.createMessage,
    //   };

    //   const functionName = responseMessage.function_call.name;
    //   const functionToCall = availableFunctions[functionName];
    //   const functionArgs = responseMessage.function_call.arguments;
    //   let parsedArgs;
    //     try {
    //         parsedArgs = JSON.parse(functionArgs);
    //     } catch (error) {
    //         console.error('Error parsing JSON arguments:', error.message);
    //         throw new CustomError("Unable to parse JSON arguments.", 400);
    //   }

    //   const functionResponse = functionToCall(
    //     parsedArgs.message
    //   );

    //   messages.push(responseMessage);
    //   messages.push({
    //     role: "function",
    //     name: functionName,
    //     content: functionResponse,
    //   });
    //   const returnedMessage = response.choices[0].message?.content;
    //   console.log({ returnedMessage })
    //   return parsedArgs;
    // }

    const returnedMessage = response.choices[0].message?.content;
    console.log({ returnedMessage })
    return { message: returnedMessage };
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
