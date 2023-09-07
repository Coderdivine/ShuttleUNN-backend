require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


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
    useAi
 };
