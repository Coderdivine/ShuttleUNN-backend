require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

class WorkoutAI {
  async generateWorkout(data) {
    const { postures, difficultyLevel, lastWorkoutDate, lastWorkoutSent } =
      data;
    const current_date = Date.now();
    const createMessage = `Please act a proffessional workout instructor and assistance.
        Please create a workout based on this user's recent postures:
        ${postures}. we thes following workouts: ${lastWorkoutSent} on ${lastWorkoutDate} and its ${current_date}.
        make sure you return something different but related to the user's postures.    
        `;
    const messages = [{ role: "user", content: createMessage }];
    const functions = [
      {
        name: "create_workout",
        description: `Please create a workout based on this user's recent postures:
              ${postures}. we thes following workouts: ${lastWorkoutSent} on ${lastWorkoutDate} and its ${current_date}.
              make sure you return something different but related to the user's postures.
              `,
        parameters: {
          type: "object",
          properties: {
            workout_name: {
              type: "string",
              description: `Create the workout title. make sure it doesn't excceds 60 words`,
            },
            workout_description: {
              type: "string",
              description: `Create workout description. Description of the workout`,
            },
            duration: {
              type: "string",
              description: `Give workout duration in seconds. e.g. 20`,
            },
            workout_notification_text: {
              type: "string",
              description: `Create the workout notification title. make sure it doesn't excceds 45 words`,
            },
            instruction: {
              type: "string",
              description: `Write a detailed instruction on how to perform the workout`,
            },
            difficultyLevel: {
              type: "string",
              enum: ["veryeasy", "easy", "normal", "hard", "veryhard"],
              description: `choose diffculty level`,
            },
          },
          required: [
            "workout_name",
            "workout_description",
            "workout_notification_text",
            "instruction",
            "difficultyLevel",
            "duration",
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
        get_reviews: this.createWorkout,
      };
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      const functionResponse = functionToCall(
        functionArgs.workout_name,
        functionArgs.workout_description,
        functionArgs.duration,
        functionArgs.workout_notification_text,
        functionArgs.instruction,
        functionArgs.difficultyLevel
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
  
  createWorkout(
    workout_name,
    workout_description,
    duration,
    workout_notification_text,
    instruction,
    difficultyLevel
  ) {
    const reviewInfo = {
        workout_name,
        workout_description,
        duration,
        workout_notification_text,
        instruction,
        difficultyLevel
    };

    return JSON.stringify(reviewInfo);
  }
}

module.exports = new WorkoutAI();
