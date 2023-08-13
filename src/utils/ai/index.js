require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


async function useAi(prompt){
    try {
        const requestData = {
            prompt: prompt,
            max_tokens: 2000,
        };
        const response = await openai.Completion.create(requestData);
        console.log('Generated code:\n', response.choices[0].text);
        return {
            bool:true,
            message: response.choices[0].text
        }
      } catch (error) {
        console.error('OpenAI API Error:', error.message);
        return {
            bool:false,
            message: error.message
        }
      }
}

module.exports = { useAi };
