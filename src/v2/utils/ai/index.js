require("dotenv").config();
const CombineAI = require("./combine.ai");
const WorkoutAI = require("./workout.ai");
const PostureAI = require("./posture.ai");
const useMessageAI = require("./Message.ai");
const open_ai = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new open_ai({
  apiKey,
});



async function useAi(prompt){
    try {
        let MSG_ARRAY = []

        const requestData = {
            prompt: prompt,
            max_tokens: 200,
        };
        
        MSG_ARRAY = [...MSG_ARRAY, { role: "user", content: requestData.prompt }];
        const { data } = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: MSG_ARRAY,
        });

        console.log({ response: data.choices });
        MSG_ARRAY = [...MSG_ARRAY, data.choices[0].message]
        return {
            bool:true,
            message: data.choices[0]?.message?.content
        }

      } catch (error) {
        console.log({ ai_error: error })
        return {
            bool:false,
            message: error.message
        }
      }
}


module.exports = { 
    useAi,
    CombineAI,
    WorkoutAI,
    PostureAI,
    useMessageAI
 };
