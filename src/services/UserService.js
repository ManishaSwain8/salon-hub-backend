const { where } = require("sequelize");
const UserError = require("../ErrorHandler/UserError");
var db = require("../db/models");

var User = db.User;
var SalonService = db.SalonService;
var Salon = db.Salon;
var Service = db.Service;
var Appointment = db.Appointment;

class UserService {
  static async getAllUsers(query) {
    const { salon, extraAttri } = query;
    const arr = [];
    if (salon === "true") arr.push(Salon);
    const extraData = [];
    if (!extraAttri) extraData.push("createdAt", "updatedAt");

    const user = await User.findAll({
      include: [...arr, Appointment],
      attributes: { exclude: extraData },
    });

    return [user, 200];
  }

  static async getUserById(userId) {
    const user = await User.findOne({
      where: { userId },
      include: [Salon],
    });

    if (!user) {
      const message = "User not found";
      const extraDetails = "No such user exists with id: " + userId;
      throw new UserError(message, 404, extraDetails);
    }

    return [user, 200];
  }

  static async createUser({ fullName, email, role, password, gender }) {
    let imageUrl;
    if (gender === "male") {
      imageUrl = `https://avatar.iran.liara.run/public/boy?username=${fullName}`;
    } else if (gender === "female") {
      imageUrl = `https://avatar.iran.liara.run/public/girl?username=${fullName}`;
    } else {
      imageUrl = `https://avatar.iran.liara.run/username?username=${fullName}`;
    }
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        role: role || "USER",
        ...{ fullName, email, password, imageUrl, gender },
      },
    });

    return [user, created ? 201 : 200];
  }

  static async updateUser({ fullName, email, role }, { userId }) {
    const [userDetails, status] = await UserService.getUserById(userId);

    await User.update(
      {
        fullName: fullName ? fullName : userDetails.fullName,
        email: email ? email : userDetails.email,
        role: role ? role : userDetails.role,
      },
      { where: { userId } }
    );
    return { message: "user data updated", id: userId };
  }

  static async deleteUser(userId) {
    const [user] = await UserService.getUserById(userId);
    console.log(user.salon);

    if (user.Salon) await user.setSalon(null);
    await User.destroy({ where: { userId } });

    return {
      message: "user id " + userId + " data DELETED",
      id: userId,
    };
  }
}

module.exports = UserService;
