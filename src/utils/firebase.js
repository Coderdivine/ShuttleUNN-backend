const admin = require("firebase-admin");
const axios = require("axios");
const serviceAccount = require("./serviceAccount.json");
const CustomError = require("./custom-error");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


class PushMessage {

    async sendMessage({ message, user }) {
      if(!message) throw new CustomError("Please provide message to send.", 400);
      const response = await admin
      .messaging()
      .send(message);

      console.log({ response });
      if(!response) throw new CustomError("Unable to send push message to user", 400);
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
