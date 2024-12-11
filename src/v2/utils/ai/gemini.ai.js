const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GeminiAI: GeminiAIConfig } = require("../../config");
const genAI = new GoogleGenerativeAI(GeminiAIConfig.API_KEY);
const fs = require("fs");
const path = require("path");
const fileContent = path.join(__dirname, "../doctor.txt");

class GeminiAI {

  async useGemini({ postureAngles }) {
    const prompt = await this.createPrompt({ postureAngles });
    const evaluatePostureFunctionDeclaration = {
      name: "theRating",
      parameters: {
        type: "OBJECT",
        description:
          "Evaluate the user's posture based on neck angle and other posture-related data to provide health and productivity ratings.",
        properties: {
          health: {
            type: "NUMBER",
            description:
              "Health Rating: (number between 1 and 100)",
          },
          productivity: {
            type: "NUMBER",
            description:
              "Productivity Rating: (number between 1 and 100)",
          },
          reason: {
            type: "STRING",
            description:
              "Reason: (explanation of the posture's impact), Note: response should always be in human like with easy to understand words so random human and easily understand. Also avoid over advicing",
          },
          guidance: {
            type: "STRING",
            description:
              "Guidance: (suggestions to improve posture for better health and productivity), Note: response should always be in human like with easy to understand words so random human and easily understand. Also avoid over advicing",
          },
        },
        required: ["health", "productivity", "reason", "guidance"],
      },
    };

    const functions = {
      theRating: ({ health, productivity, reason, guidance }) => {
        return this.theRating(health, productivity, reason, guidance);
      },
    };

    const generativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: {
        functionDeclarations: [evaluatePostureFunctionDeclaration],
      },
    });


    const chat = await this.startChat(prompt, functions, generativeModel);
    console.log({ chatValue: chat?.values })
    return chat;
  }

  async startChat(prompt, functions, genModel) {
    const chat = genModel.startChat();
    const result = await chat.sendMessage(prompt);
    const call = result.response.functionCalls()[0];

    if (call) {
      const apiResponse = await functions[call.name](call.args);
      const result2 = await chat.sendMessage([
        {
          functionResponse: {
            name: "theRating",
            response: apiResponse,
          },
        },
      ]);

      console.log(result2.response.text());
      return {
        message: result2.response.text(),
        values: apiResponse,
      }
    } else {
        return {
            message: "",
            values: null,
        }
    }
  }

  async createPrompt({ postureAngles }) {
    const postureTxt = await this.createPostureText(postureAngles);
    const fileContentText = await this.fileContentTxt();
    const secondPrompt = `
                You are a rehabilitation expert and ergonomics coach. The user has provided data about their current posture. Based on the user's posture, evaluate their health and productivity. Here are the steps to follow:

                1. **Health Rating**: Evaluate the user's posture for comfort, ergonomics, and injury prevention. Rate the posture on a scale from 1 to 100, where 100 means optimal health posture, and 1 means poor posture with high risk of strain or injury.
                2. **Productivity Rating**: Assess how conducive this posture is for long-term productivity. Consider factors like ease of movement, comfort, and minimizing distractions or discomfort. Rate this posture on a scale from 1 to 100, with 100 indicating ideal posture for focus and work efficiency.
                3. **Reasoning**: Explain why the posture is beneficial or detrimental for health and productivity. Highlight any potential risks or benefits of the current posture.
                4. **Guidance**: Provide simple guidance for the user to improve their posture and sustain health and productivity. This could include tips for posture adjustments, ergonomic improvements, or stretching routines.

                here's the user posture description:
                - The user's pose: ${postureTxt}.
                - The file contains additional anatomical information, listing different body parts, and the bones and muscles associated with each part.
                potentially for use in a medical or educational context, for understanding human body structure or as part of a project requiring this data.
                here's the file ${fileContentText}

                Respond with:
                - Health Rating: (number between 1 and 100)
                - Productivity Rating: (number between 1 and 100)
                - Reason: (explanation of the posture's impact), Note: response should always be in human like so random human and easily understand. Also don't recommend and exercises or workout maybe when health rating is below 50.
                - Guidance: (suggestions to improve posture for better health and productivity), Note: response should always be in human like so random human and easily understand. Also don't recommend and exercises or workout maybe when productivity rating is below 50.

                Note: response should always be in human like so random human and easily understand
            `;
    return secondPrompt;
  }

  async createPostureText(latestPose) {
    if (!latestPose || !latestPose.middle || latestPose.middle.length === 0) {
        console.log("No middle range data found.");
        return "User doesn't have any record yet. just return a good score";
      }
  
      const outputs = latestPose.middle.map(range => {
        return `${range.label} has been on ${range.from} to ${range.to}`;
      });
    
      outputs.forEach(output => console.log(output));
      return outputs || "User doesn't have any record yet. just return a good score";
  }

  async fileContentTxt() {
    return fs.readFile(fileContent, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the file:", err);
        return;
      }
      return data;
    });
  }

  async theRating(health, productivity, reason, guidance) {
    return {
      health,
      productivity,
      reason,
      guidance,
    };
  }
}

module.exports = new GeminiAI();

// new GeminiAI().useGemini({ postureAngles: { middle: [{ from: 5, to: 45, label: "neck" }] }})
