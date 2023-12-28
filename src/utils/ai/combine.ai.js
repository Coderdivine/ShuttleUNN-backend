require("dotenv").config();
const open_ai = require("openai");
const { AffectedBodyParts } = require("../../config");
const CustomError = require("../custom-error");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new open_ai({
  apiKey,
});


class CombineAI {
  
  async combineAlert(data) {
    const { postures } = data;
    const current_date = Date.now();
    const createMessage = `
    Be a posture instructor. based on user posture, create a summary warning user about thier recent posture and also recommend a suitable workout based on that posture.
    here's the user's recent posture:
    ${postures}, current date: ${current_date}
    `;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
        {
            name: "create_workout",
            description: `Be a posture instructor. based on user posture, create a summary warning user about thier recent posture and also recommend a suitable workout based on that posture.
        here's the user's recent posture.
        `,
            parameters: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                        description: `Create a notification summary. make sure it doesn't exceed 60 words`,
                    },
                    notification_notification_text: {
                        type: "string",
                        description: `Create the notification summary title. make sure the sentence doesn't exceed 50 words.`,
                    },
                    notification_description: {
                        type: "string",
                        description: `Create notification summary description. give some exercise to do and make it detailed if possible`,
                    },
                    importance: {
                        type: "string",
                        enum: ["minor", "serious", "notimportant", "notserious", "important"],
                        description: `choose important level`,
                    },
                    areas: {
                        type:"string",
                        enum: AffectedBodyParts,
                        description: "Please choose the area of the body affected by the postures given"
                    }
                },
                required: [
                    "summary",
                    "notification_description",
                    "notification_notification_text",
                    "importance",
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
            create_workout: this.createWarningObject,
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
            parsedArgs.summary,
            parsedArgs.notification_description,
            parsedArgs.notification_notification_text,
            parsedArgs.importance,
            parsedArgs.areas
        );

        messages.push(functionResponse);
        messages.push({
            role: "function",
            name: functionName,
            content: functionResponse,
        });

        return parsedArgs;
    }
}

createWarningObject(
    summary,
    notification_description,
    notification_notification_text,
    importance,
    areas
) {
    const reviewInfo = {
        summary,
        notification_description,
        notification_notification_text,
        importance,
        areas
    };

    return reviewInfo;
}

}

module.exports = new CombineAI();
