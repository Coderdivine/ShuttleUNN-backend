const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

// Initialize Firebase Admin SDK...
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const registrationToken = 
"dtDMuQryPlioRZ5wmyGwe4:APA91bGL2hzxnF5ryAbzYdEgt9UHQkpdIrmFkHnu-TgFChsov4UU8As2UE2s2LL2QFDF4vXrllBPtqrLd0Nuec7W-3ODQd7OzhgDJ-Kltkxf6J4EnWmkArR6GqlRssiWjuDT69rpTNjM";

const message = {
  token: registrationToken,
  notification: {
    title: "Greetings",
    body: "Welcome to DevSensor",
  },
  data: {
    title: "DevSensor",
    body: "Welcome to DevSensor",
    icon: "https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQLmBncEKNealXR8bM8x2%2Fuploads%2Fw60XCtPPJDQL1maTKHb7%2FDevSensorDarkMode1.jpg?alt=media&token=af815cc7-0eae-4d43-94a0-eff068689614",
    link_url: "http://localhost:3000",
  },
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log("Successfully sent message:", response);
  })
  .catch((error) => {
    console.error("Error sending message:", error);
  });
