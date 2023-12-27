const admin = require("firebase-admin");
const axios = require("axios");
const serviceAccount = require("./serviceAccount.json");
const CustomError = require("./custom-error");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const registrationToken = "eb1a2v7B2H8T4hVtUcY5Lb:APA91bFs39sQLhyPiSCGjTddG9iyo3sncMEaOTB2Px2cS-XTjWp21eCF0nfXOqN9iK0iKi99Rwq5MworION4ygsTRGW82TP9bIMurBXDs9i1_yHvAwOxLmifFL8fEcWZY9OYTua1T-xO"
const message = {
  token: registrationToken,
  notification: {
    title: "Greetings",
    body: "Welcome to DevSensor."
  },
  data: {
    icon: "https://devsensor.axgura.com/devsensor_logo_image.png",
    link_url: "http://localhost:3000",
  },
};

// admin
//   .messaging()
//   .send(message)
//   .then((response) => {
//     console.log("Successfully sent message:", response);
//   })
//   .catch((error) => {
//     console.error("Error sending message:", error);
//   });


class PushMessage {

    async sendMessage(message) {
      if(!message) throw new CustomError("Please provide message to send.", 400);
      const response = await admin
      .messaging()
      .send(message);
      console.log({ workingReg: registrationToken });
      if(!response) throw new CustomError("Unable to send push message to user", 400);
      console.log({ response });
      return response;
    }
}

// async function getAllParametersFromArray(arr) {
//   return Promise.all(arr.reduce((parameters, obj) => {
//     const values = Object.values(obj);
//     const nestedParameters = values.some(v => typeof v === 'object' && v !== null)
//         ? getAllParametersFromArray(values.filter(v => typeof v === 'object' && v !== null))
//         : values;

//     return parameters.concat(nestedParameters);
// }, []));
// }

// axios.get("https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr%3Asport%3A1&_t=1703268701089")
// .then( async ({ data }) => {
//   const parametervalues = await getAllParametersFromArray(data?.data);
//   console.log({ parametervalue: parametervalues[0][0][0][2][0][0] });
// });

module.exports = new PushMessage();
