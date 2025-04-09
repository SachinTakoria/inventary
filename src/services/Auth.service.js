const httpStatus = require("http-status");
const { UserModel, ProfileModel } = require("../models");
const ApiError = require("../utils/ApiError");
const { generatoken } = require("../utils/Token.utils");
const axios = require("axios");

class AuthService {
  static async RegisterUser(body) {
    const { email, password, name, token, role } = body;

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: process.env.CAPTCHA_SCREATE_KEY,
          response: token,
        },
      }
    );

    const data = await response.data;

    if (!data.success) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Captcha Not Valid");
    }

    const checkExist = await UserModel.findOne({ email });
    if (checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User Already Registered");
    }

    const user = await UserModel.create({
      email,
      password,
      name,
      role: role || 'subadmin' // ✅ default role subadmin
    });

    const tokend = generatoken(user);
    const refresh_token = generatoken(user, "2d");

    await ProfileModel.create({
      user: user._id,
      refresh_token,
    });

    return {
      msg: "User Registered Successfully",
      token: tokend,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  static async LoginUser(body) {
    const { email, password, token } = body;

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: process.env.CAPTCHA_SCREATE_KEY,
          response: token,
        },
      }
    );

    const data = await response.data;

    if (!data.success) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Captcha Not Valid");
    }

    const checkExist = await UserModel.findOne({ email });
    if (!checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User Not Registered");
    }

    if (password !== checkExist.password) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Credentials");
    }

    const tokend = generatoken(checkExist);

    return {
      msg: "User Login Successfully",
      token: tokend,
      user: {
        name: checkExist.name,
        email: checkExist.email,
        role: checkExist.role
      }
    };
  }

  static async ProfileService(user) {
    const checkExist = await UserModel.findById(user).select("name email role");

    if (!checkExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User Not Registered");
    }

    return {
      msg: "Data fetched",
      user: checkExist,
    };
  }
}

module.exports = AuthService;
