const admin = require("firebase-admin");
const axios = require("axios");
const serviceAccount = require("./serviceAccount.json");
const CustomError = require("./custom-error");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


class PushMessage {

    async sendMessage({ message, user }) {
      const token = user?.fcm_token;
      if(!message) throw new CustomError("Please provide message to send.", 400);
      await admin
      .messaging()
      .send(message)
      .then((response) => {
        if(!response) throw new CustomError("Unable to send push message to user", 400);
        return response;
      })
      .catch(async (error)=> {
        const err_msg = error?.errorInfo?.message || "Unable to send push message to user";
        if(err_msg !== 'Requested entity was not found.') throw new CustomError(err_msg, 400);
        user.fcm_token = this.deleteById(token, message?.token)
        const saved = await user.save();
        return {};
      });
    }

    deleteById(arr, tokenToDelete) {
    return arr.filter(obj => obj.token !== tokenToDelete);
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
