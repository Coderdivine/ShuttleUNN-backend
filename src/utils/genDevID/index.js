const uuid = require("uuid");
const nameTheUsername = require("unique-username-generator");

const genDevSensorID = (email) => {
    // result => email_name, sixuuid, and username.
    const email_name = email.split("@")[0];
    const sixuuid = ((uuid.v4()).split("-")[0]).concat("dev");
    const nickname = nameTheUsername.generateUsername();
    const result = email_name + sixuuid + nickname;
    return result;
}

module.exports = {
    genDevSensorID,
}