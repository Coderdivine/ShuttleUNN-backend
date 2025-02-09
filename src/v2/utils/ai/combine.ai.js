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
    const { postures, profile } = data;
    const current_date = Date.now();
    const createMessage = `
    You are a rehabilitation expert and ergonomics coach. The user has provided data about his/her profile and their current posture. 
    Based on the user's posture and profile, In human like response, evaluate their health and productivity. 
    3. Provide a summary of the user's posture health.
    4. Recommend suitable exercises to improve their posture and overall health. ${profile},
    ${postures}, current date: ${current_date}.`;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
        {
            name: "create_workout",
            description: `You are a rehabilitation expert and ergonomics coach. The user has provided data about his/her profile and their current posture.`,
            parameters: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                        description: `Create a notification summary based on user information and posture and actual date/time. make sure it doesn't exceed 60 words,
                        e.g 
                        1. Time for a exercises,
                        2. Time for a simple exercises,
                        3. Try this <duration e.g. 2 minutes>
                        4. Recent posture exercises to do
                        5. Posture Improvement for Software Engineers
                        `,
                    },
                    notification_notification_text: {
                        type: "string",
                        description: `Create the notification summary title. make sure the sentence doesn't exceed 50 words,  for example: 
                        1. time for a simple exercises to keep you going, 
                        2. This exercises will keep you going 
                        3. perform this 3mins exercises. 
                        4. Time for a exercises,
                        5. Time for a simple exercises,
                        6. Try this <duration e.g. 2 minutes>
                        7. Recent posture exercises to do
                        Just come up with something similar to these examples, making sure it's based on the given posture and date/time`,
                    },
                    notification_description: {
                        type: "string",
                        description: `
                        Create notification summary description. give some exercise to do and make it detailed exercises.
                        e.g
                        We've created exercises that will help you for the <date e.g., day, weekend>. here's is it: <give exercises based on posture>
                        `,
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
