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

async function useAiImage(prompt){
    try {

        const promptConfig = [
            `
            Please explain what's written in this image.
            Explain each lesson by giving examples,
            and solutions to it
            `,
            "Please answer all question with solutions and calculations if required",
            "Please create an explain in details with real-life exmaples explaining each of the topic here not sub-topics."
        ]
        console.log(promptConfig[prompt]);

        const requestData = {
            prompt: promptConfig[prompt],
            max_tokens: 3000,
        };

        const images = [
            "https://res.cloudinary.com/dkfauaaqd/image/upload/v1699900510/b56ecbcb694a22c888b34c68da13ce3f.jpg",
            "https://res.cloudinary.com/dkfauaaqd/image/upload/v1699900589/b74fcabe106b0df1026b1369e8fca7a2.jpg",
            "https://res.cloudinary.com/dkfauaaqd/image/upload/v1699900620/a82acabd2df7d2fea5b916d614824f3b.jpg",
            "https://res.cloudinary.com/dkfauaaqd/image/upload/v1699900655/774d3d1eeec10f9ec30bc0e93a6a57f8.jpg"
        ]
        
        const { data } = await openai.createChatCompletion({
            model: "gpt-4-vision-preview",
            messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: promptConfig[prompt] },
                    {
                      type: "image_url",
                      image_url:
                        images[3],
                    },
                  ],
                },
              ],
              max_tokens: requestData?.max_tokens
        });

        // console.log({ response: data.choices[0]?.message?.content });

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


// useAiImage(2).then((res) =>{
//     console.log(res)
// });

module.exports = { 
    useAi,
    CombineAI,
    WorkoutAI,
    PostureAI,
    useMessageAI
 };
