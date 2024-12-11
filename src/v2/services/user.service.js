require("dotenv").config();
const { BCRYPT_SALT, SCHEDULE_SECRET } = require("../config");
const User = require("./../models/user.model");
const Device = require("./../models/device.model");
const Billing = require("./../models/billing.model");
const VToken = require("./../models/vtoken.model");
const CustomError = require("./../utils/custom-error");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const uuid = require("uuid");
const passport = require("passport");
const cookieSession = require("cookie-session");
const randonNum = require("../utils/randonNum");
const { sendMail, resetPassword } = require("../utils/sendMail");
const { genDevSensorID } = require("../utils/genDevID");
require("../utils/firebase");


class UserService {

  generateAccessSignature(hashedPassword) {
    const secretKey = SCHEDULE_SECRET;
    const createdHash = crypto
    .createHmac("sha256", secretKey)
    .update(hashedPassword)
    .digest("hex");
    return createdHash;
  }

  async register(data) {
    if (!data.email) throw new CustomError("Please provide email address");
    const user_id = uuid.v4().toString();
    console.log({ user_id });
    const hash = await bcrypt.hash(data.password, 10);
    const finEmail = await User.findOne({ email: data.email });
    if (finEmail)
      throw new CustomError(
        "Email already registered. Please choose another one."
      );

    if (!data.email.includes("@"))
      throw new CustomError("Please provide a valid email address", 400);
    if (!data.password) throw new CustomError("Please provide a password", 400);

    const devsensor_id = genDevSensorID(data.email);
    console.log({ devsensor_id });
    const accessSignature = this.generateAccessSignature(hash);
    console.log({ accessSignature });

    const newUser = new User({
      email: data.email,
      user_id,
      devsensor_id,
      username: `${data.email.split("@")[0]}` || "",
      password: hash,
      accountCreated: Date.now(),
      isNewUser: true,
      access: accessSignature
    });

    const newDevice = new Device({
      user_id,
      devsensor_id,
    });

    const saved = await newUser.save();
    const new_d_saved = await newDevice.save();
    if (!saved || !new_d_saved)
      throw new CustomError("Unable to Register user, Please try again");
    await this.sendEmail({ email: data.email });
    console.log({ saved });
    saved.password = "";
    return saved;
  }

  async googleAuth(data) {
    if (!data) throw new CustomError("Not Authorized", 403);
    return data;
  }

  async googleAuthFailed() {
    return false;
  }

  async login(data) {
    const email = data.email;
    const user_data = await User.findOne({ email });
    console.log({ user_data });

    if (!user_data) throw new CustomError("Wrong email address", 404);

    const decoded_hash = await bcrypt.compare(
      data.password,
      user_data.password
    );

    if(!user_data?.access) {
      const accessSignature = this.generateAccessSignature(user_data?.password);
      user_data.access = accessSignature;
      await user_data?.save();
    }

    console.log({ decoded_hash });

    user_data.password = "";
    if (!decoded_hash) throw new CustomError("Wrong password", 403);
    return user_data;
  }

  async dlt(email) {
    const dlt = await User.deleteMany({ email: email });
    if (dlt.deletedCount >= 1) {
      return {
        message: "Account deleted successfully",
      };
    } else {
      return {
        message: "Account not found. Please try again",
      };
    }
  }

  async sendEmail({ email }) {
    const emailSent = await sendMail({
      email: email,
    });
    console.log({ emailSent });
    return emailSent;
  }

  async user_data(data) {
    const user_id = data.user_id;
    const user_data = await User.findOne({ user_id });
    console.log({ user_data });
    if (!user_data) throw new CustomError("No user found", 404);
    user_data.password = "";
    return user_data;
  }

  async resetPassword(data) {
    const { email } = data;
    if (!data.email) throw new CustomError("User email is needed", 400);
    const findAndDeleteEmail = await VToken.deleteMany({ email: data.email });
    console.log({ findAndDeleteEmail });
    const otp = await randonNum.randomNum();
    const hash = await bcrypt.hash(otp, 10);
    const newVtoken = new VToken({
      email,
      hashedOtp: hash,
    });

    const save = await newVtoken.save();
    console.log(save);
    await resetPassword({ email: data.email, otp });
    return save;
  }

  async verifyResetToken(data) {
    const { otp, email, new_password } = data;
    if (!otp || !data) throw new CustomError("No otp passed", 400);
    if (!email) throw new CustomError("No email passed", 400);
    const findToken = await VToken.findOne({ email });
    if (!findToken) throw new CustomError("Please resend otp", 400);
    const decoded_token = await bcrypt.compare(otp, findToken.hashedOtp);
    console.log({ decoded_token, findToken });
    if (!decoded_token) throw new CustomError("Wrong otp code", 400);
    const result = await VToken.deleteMany({ email });
    const hash = await bcrypt.hash(new_password, 10);
    const user = await User.findOne({ email });
    const accessSignature = this.generateAccessSignature(hash);
    user.password = hash;
    user.access = accessSignature;
    const saved = await user.save();
    console.log(saved);
    console.log({ result });
    return result;
  }

  async update(user_id, data) {
    if (data.password) {
      const hash = await bcrypt.hash(data.password, 10);
      data.password = hash;
      const isUsername = await User.findOne({ username: data?.username });
      if (isUsername && isUsername?.user_id !== user_id)
        throw new CustomError("Username taken", 400);

      const user = await User.updateOne({ user_id }, { $set: data });
      console.log({ user });

      if (!user) throw new CustomError("user does not exist", 404);

      return user;
    } else {
      const user = await User.updateOne({ user_id }, { $set: data });
      if (!user) throw new CustomError("user does not exist", 404);

      return user;
    }
  }

  async suspendAccount(user_id) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );
    const user_account = await User.findOne({ user_id });
    user_account.isSuspended = true;
    const saved = await user_account.save();
    return saved;
  }

  async realeaseAccount(user_id) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );
    const user_account = await User.findOne({ user_id });
    user_account.isSuspended = false;
    const saved = await user_account.save();
  }

  async registerDeviceForNotification(user_id, data) {
    if (!user_id) throw new CustomError("User not found", 404);
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not found", 404);
    if (!data.fcm_token) throw new CustomError("Unable to regster device", 400);
    const fcm_token = { device: "no_name", token: data.fcm_token };
    console.log({ fcm_token: data.fcm_token });
    const ifToken = user.fcm_token.some(
      (token) => token.token === data.fcm_token
    );
    if (ifToken) throw new CustomError("Device already registered", 400);
    user.fcm_token = [...user.fcm_token, fcm_token];
    const saved = await user.save();
    return saved;
  }

  async deleteRegisteredDevice(user_id, data) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not found", 404);
    if (!data?.fcm_token)
      throw new CustomError("Unable to unregister device", 400);
    const fcm_token = data.fcm_token;
    const index = (user?.fcm_token).findIndex((t) => t.token === fcm_token);
    console.log({ index });
    if (index === -1) {
      console.log("FCM token not found");
      throw new CustomError("FCM token not found", 404);
    }
    user.fcm_token.splice(index, 1);
    const user_saved = await user.save();
    console.log("Device token deleted successfully");
    return user_saved;
  }

  async userBilling(user_id) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );
    const user_bills = await Billing.find({ user_id });
    return user_bills;
  }

  async addToUserbilling(user_id, data) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );
    const nextExpires = 100000000;
    const newBilling = new Billing({
      user_id,
      period: data.period,
      billing_id: uuid.v4().toString(),
      plan_name: data.plan_name,
      plan_price: data.plan_price,
      time: Date.now(),
      expires: Date.now() + nextExpires,
      nextBilling: Date.now() + nextExpires + 360000,
    });
    const saved = await newBilling.save();
    console.log({ saved });
    return saved;
  }

  async getUserRoutine(user_id) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );
    const user_routine = await User.findOne({ user_id });
    const routine = user_routine.dailyRoutine;
    return routine;
  }

  async addToUserRoutine(user_id, routine_name, time) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );

    const newRoutine = {
      routine_id: uuid.v4().toString(),
      routine: routine_name,
      time,
      date: Date.now(),
    };

    const saved = await User.updateOne(
      { user_id: user_id },
      { $push: { dailyRoutine: newRoutine } }
    );

    return saved;
  }

  async editUserRoutine(user_id, routine_id, updatedValue, updatedField) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );

    const updateQuery = {};
    updateQuery[`dailyRoutine.$.${updatedField}`] = updatedValue;

    const edited = await User.updateOne(
      { user_id: user_id, "dailyRoutine.routine_id": routine_id },
      { $set: updateQuery }
    );
    return edited;
  }

  async deleteFromUserRoutine(user_id, routine_id) {
    if (!user_id)
      throw new CustomError(
        "Kindly log in once more to finalize this attempt.",
        400
      );

    const deleted = await User.updateOne(
      { user_id: user_id },
      { $pull: { dailyRoutine: { routine_id: routine_id } } }
    );

    return deleted;
  }

  async useProfileForWorkout(user_id) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("No user found. Login again", 400);
    const value = user?.useProfileForWorkout;
    user.useProfileForWorkout = !value;
    console.log({ useProfile: user.useProfileForWorkout });
    const saved = await user.save();
    return saved;
  }

  async useMagicFix(user_id) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not found", 400);
    const magicFix = !user?.enableMagicFix;
    user.enableMagicFix = magicFix;
    await user.save();
    return { magicFix };
  }

  async magicFixEnabled(user_id) {
    const user = await User.findOne({ user_id });
    if (!user) throw new CustomError("User not found", 400);
    return user?.enableMagicFix;
  }
}

module.exports = new UserService();