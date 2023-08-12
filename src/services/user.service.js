const { BCRYPT_SALT } = require("../config");
const User = require("./../models/user.model");
const Billing = require("./../models/billing.model");
const VToken = require("./../models/vtoken.model");
const CustomError = require("./../utils/custom-error");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const randonNum = require("../utils/randonNum");
const { sendMail, resetPassword } = require("../utils/sendMail");

class UserService {

  async register(data) {
    if (!data.email) throw new CustomError("Please provide email address");
    const user_id = uuid.v4().toString();
    console.log({ user_id });
    const hash = await bcrypt.hash(data.password, 10);
    const finEmail = await User.findOne({ email: data.email });
    if (finEmail)
      throw new CustomError(
        "Oops! Email already registered. Please choose another one."
      );
    const newUser = new User({
      email: data.email,
      user_id,
      username: `${data.email.split("@")[0]}` || "",
      password: hash,
    });
    const saved = await newUser.save();
    if (!saved)
      throw new CustomError("Unable to Register email, Please try again");
    await this.sendEmail({ email: data.email });
    console.log({ saved });
    saved.password = "";
    return saved;
  }

  async login(data) {
    const email = data.email;
    const user_data = await User.findOne({ email });
    console.log({ user_data });
    if (!user_data) throw new CustomError("No user found", 404);
    const decoded_hash = await bcrypt.compare(
      data.password,
      user_data.password
    );
    console.log({ decoded_hash });
    user_data.password = "";
    if (!decoded_hash) throw new CustomError("Wrong password", 403);
    return user_data;
  }

  async dlt(email) {
    const dlt = await User.deleteMany({ email: email });
    return dlt;
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
    console.log({ data });
    const findAndDeleteEmail = await VToken.deleteMany({ email: data.email });
    console.log({ findAndDeleteEmail });
    const otp = await randonNum.randomNum();
    console.log({ otp })
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
    user.password = hash;
    const saved = await user.save();
    console.log(saved);
    console.log({ result });
    return result;
  }

  async update(user_id, data) {
    if (data.password) {
      const hash = await bcrypt.hash(data.password, 10);
      data.password = hash;
      console.log({ ["ripping_hash"]: data.password });
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
    try {
      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );
      const user_account = await User.findOne({ user_id });
      user_account.isSuspended = true;
      const saved = await user_account.save();
      return saved;
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async realeaseAccount(user_id) {
    try {
      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );
      const user_account = await User.findOne({ user_id });
      user_account.isSuspended = false;
      const saved = await user_account.save();
      return saved;
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }


  async userBilling(user_id) {
    try {
      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );
      const user_bills = await Billing.find({ user_id });
      return user_bills;
    } catch (error) {
      console.log(error);
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async addToUserbilling(user_id, data) {
    try {
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
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }


  async getUserRoutine(user_id) {
    try {
      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );
      const user_routine = await User.findOne({ user_id });
      const routine = user_routine.dailyRoutine;
      return routine;
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async addToUserRoutine(user_id, routine_name, time) {
    try {

      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );

      const newRoutine = {
        routine_id:uuid.v4().toString(),
        routine: routine_name,
        time,
        date: Date.now(),
      };

      const saved = await User.updateOne(
        { user_id: user_id },
        { $push: { dailyRoutine: newRoutine } }
      );

      return saved;
    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async editUserRoutine(user_id, routine_id, updatedValue, updatedField) {
    try {
      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );
        
        const updateQuery = {};
        updateQuery[`dailyRoutine.$.${updatedField}`] = updatedValue;

        const edited = await User.updateOne(
        { user_id: user_id, 'dailyRoutine.routine_id': routine_id },
        { $set: updateQuery }
        )
        return edited;

    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }

  async deleteFromUserRoutine(user_id, routine_id) {
    try {
      if (!user_id)
        throw new CustomError(
          "Kindly log in once more to finalize this attempt.",
          400
        );
        
        const deleted = await User.updateOne(
        { user_id: user_id },
        { $pull: { dailyRoutine: { routine_id: routine_id } } }
        )

        return deleted;

    } catch (error) {
      throw new CustomError(
        "An issue has arisen. Please try again later.",
        500
      );
    }
  }


}

module.exports = new UserService();
