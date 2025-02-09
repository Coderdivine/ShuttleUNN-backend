const fs = require("fs");
const path = require("path");
const OpenAi = require("openai");
const axios = require("axios");
require("dotenv");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAi({ apiKey });
const google = require("../drive");
const UniqueIDGenerator = require("../unique-id-generator");


class OpenAI {
  constructor() {
    const url = "https://api.openai.com/v1/audio/speech";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
    this.url = url;
    this.headers = headers;
  }

  async speechToText(audio) {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audio),
      model: "whisper-1",
    });
    return transcription;
  }

  async textToSpeech(text, filePath) {
    const format = "wav";
    if (!filePath) {
      const generator = new UniqueIDGenerator();
      const uniqueId = generator.generateRandom();
      filePath = path.join("/tmp", `${uniqueId}_${Date.now()}.${format}`);
    }

    const data = {
      model: "tts-1",
      input: text,
      voice: "alloy",
      response_format: format,
    };

    try {
      const response = await axios.post(this.url, data, {
        headers: this.headers,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", async () => {
          console.log(`Audio file saved to ${filePath}`);
          await google.uploadFile(filePath, filePath);
          resolve(filePath);
        });
        writer.on("error", (error) => {
          console.error("Error saving the audio file:", error);
          reject(error);
        });
      });

    } catch (error) {
      if (error.response) {
        //  console.log(error);
        console.error(
          `Error with HTTP request: ${error.response.status} - ${error.response.statusText}.`
        );
      } else {
        console.error(`Error in streamedAudio: ${error.message}`);
      }
    }

  }
}

module.exports = new OpenAI();

// new OpenAI()
//   .textToSpeech(`I CODE/PROGRAM

// Founder & Engineer
// Hi, I'm Chimdindu Ezechukwu, an Engineer with 5 years of experience in health, retail, finance, and Web3. I specialize in: Hardware, Backend, and BlockChain`)
//   .then(console.log);
