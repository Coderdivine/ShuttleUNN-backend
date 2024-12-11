require("dotenv").config();
const open_ai = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new open_ai({
  apiKey,
});
const { AffectedBodyParts } = require("../../config");
const CustomError = require("../custom-error");



class WorkoutAI {
  async generateWorkout(data) {
    const { postures, difficultyLevel, lastWorkoutDate, lastWorkoutSent, profile } =
      data;
    const current_date = Date.now();
    const createMessage = `Please act as a proffessional workout instructor and assistant.
        Please create a workout based on this user's recent postures:
        ${postures}. we sent these following workouts recently: ${lastWorkoutSent} on ${lastWorkoutDate} and its ${current_date}.
        make sure you return something different but related to the current user's postures.
        ${profile}    
        `;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_workout",
        description: `Please create a exercise based on this user's recent postures:`,
        parameters: {
          type: "object",
          properties: {
            workout_name: {
              type: "string",
              description: `Create the exerciss name. make sure it doesn't excceds 60 words.`,
            },
            workout_description: {
              type: "string",
              description: `Create exercise description. Description of the exercise, For example:
              For the past 16 minutes, you've been sitting. Use 60 seconds to perform these exercises related to sitting posture: <Provide exercises for sitting posture>.
              For the last 30 minutes, your posture has been okay/poor.
              Perform this 2-minute exercise related to your recent postures.
              It's been 20 minutes; take a break to perform this one-minute exercise.
              You <have/had> a <posture e.g stiff_neck> while sitting, try this <Number of exercise e.g 2> exercise.
              You <have/had> a <posture e.g stiff_neck> while sitting, try this <2> exercise.
              You've been sitting for 30 minutes. Try this exercise to increase productivity.


              Just come up with something similar to these examples, making sure it's based on the given posture and date/time.`,
            },
            duration: {
              type: "string",
              description: `Give exercise duration in seconds. e.g. 20`,
            },
            workout_notification_text: {
              type: "string",
              description: `Create the exercise title. make sure it doesn't excceds 60 words, for example: 1. time for a simple exercises to keep you going, 2. This exercises will keep you going 3. perform this 3mins exercises. Just come up with something similar to these examples, making sure it's based on the given posture and date/time.`,
            },
            instruction: {
              type: "string",
              description: `Write a detailed instruction on how to perform the exercises`,
            },
            difficultyLevel: {
              type: "string",
              enum: ["veryeasy", "easy", "normal", "hard", "veryhard"],
              description: `choose diffculty level`,
            },
            areas: {
              type:"string",
              enum:AffectedBodyParts,
              description: "Please choose the area of the body affected by the postures given"
          }
          },
          required: [
            "workout_name",
            "workout_description",
            "workout_notification_text",
            "instruction",
            "difficultyLevel",
            "duration",
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
        create_workout: this.createWorkout,
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
        parsedArgs.workout_name,
        parsedArgs.workout_description,
        parsedArgs.duration,
        parsedArgs.workout_notification_text,
        parsedArgs.instruction,
        parsedArgs.difficultyLevel,
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
  
  createWorkout(
    workout_name,
    workout_description,
    duration,
    workout_notification_text,
    instruction,
    difficultyLevel,
    areas
  ) {
    const reviewInfo = {
        workout_name,
        workout_description,
        duration,
        workout_notification_text,
        instruction,
        difficultyLevel,
        areas
    };

    return (reviewInfo);
  }
}

module.exports = new WorkoutAI();
