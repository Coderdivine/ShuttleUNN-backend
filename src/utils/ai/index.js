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
            max_tokens: 200,
        };

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: requestData.prompt }],
        });
        console.log({ response });
        console.log('Generated code:\n', response.choices[0].text);
        return {
            bool:true,
            message: response.choices[0].text
        }
      } catch (error) {
        console.log({ error })
        return {
            bool:false,
            message: error.message
        }
      }
}

module.exports = { 
    useAi
 };
