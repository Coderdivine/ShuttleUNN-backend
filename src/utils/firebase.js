const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const registrationToken = "eb1a2v7B2H8T4hVtUcY5Lb:APA91bHG1tDutAEroXX85S83JizrRf5JMvxo75FYyd_cyBx4ja7KdoYpBO0UODqqyMLpr_QSxPPS49J4QEIGv027fIw8Fb6k5aaJeMAM8j6Ufkjgk1K29L_2vtjWteVCGmyEaIJEMMbx";

const message = {
  token: registrationToken,
  notification: {
    title: "Greetings",
    body: "Welcome to DevSensor",
  },
//   data: {
//     title: "DevSensor",
//     body: "Welcome to DevSensor",
//     icon: "/img/icon.png",
//     link_url: "http://localhost:3000",
//   },
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
    // You should handle the resolve and reject logic accordingly in your context
  })
  .catch((error) => {
    console.error('Error sending message:', error);
    // You should handle the resolve and reject logic accordingly in your context
  });
