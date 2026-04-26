import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { generateToken } from "../utils/generateToken.js";
import { sendResponse } from "../utils/sendResponse.js";
import multer from "multer";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import validator from "validator";
import { getEmailErrorMessage } from "../utils/getEmailErrorMessage.js";
import { ClientProfile } from "../models/clientProfile.model.js";
import { WorkerProfile } from "../models/workerProfile.model.js";
import { buildFilter, getPagination } from "../utils/queryHelper.js";
import { Agreement } from "../models/agreement.model.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const registerUser = catchAsync(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    address,
    phoneNumber,
    dateOfBirth,
    termsAccepted,
    accountManagerName,
    isSelfManaged,
    isNdisProvider,
  } = req.body;

  const allowedRoles = ["client", "worker"];

  if (!allowedRoles.includes(role)) {
    throw new AppError("Invalid role", 400);
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  if (!validator.isEmail(email)) {
    throw new AppError("Invalid email address", 400);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const verificationToken = hashedToken;
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const cleanedLastName =
    isNdisProvider && role === "worker" ? undefined : lastName;

  const userData: any = {
    email,
    password,
    firstName,
    lastName: cleanedLastName,
    role,
    phoneNumber,
    dateOfBirth,
    isVerified: false,
    verificationToken,
    termsAccepted,
    address,
    verificationTokenExpiry,
    isSelfManaged,
    accountManagerName,
    isNdisProvider,
  };

  if (role === "client") {
    userData.isSelfManaged = isSelfManaged;
    if (!userData.isSelfManaged) {
      userData.accountManagerName = accountManagerName || "";
    }
  }

  // Only add worker-specific fields
  if (role === "worker") {
    userData.isNdisProvider = isNdisProvider;
  }

  const newUser = new User(userData);
  await newUser.save();

  const profileModel = role === "client" ? ClientProfile : WorkerProfile;

  await profileModel.create({
    user: newUser._id,
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/info?token=${rawToken}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:40px 30px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            
            <!-- Title -->
            <tr>
              <td>
                <h2 style="margin:0; color:#333; font-size:22px;">
                  Verify Your Email
                </h2>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="20"></td></tr>

            <!-- Message -->
            <tr>
              <td style="color:#555; font-size:15px; line-height:1.6;">
                Hi <b>${firstName}</b>,<br/><br/>
                Thanks for signing up! Please confirm your email address by clicking the button below.
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="30"></td></tr>

            <!-- Button -->
            <tr>
              <td>
                <a href="${verifyUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background-color:#4CAF50;
                    color:#ffffff;
                    font-size:15px;
                    font-weight:bold;
                    text-decoration:none;
                    border-radius:6px;
                  ">
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="30"></td></tr>

            <!-- Fallback -->
            <tr>
              <td style="font-size:13px; color:#888;">
                If the button doesn't work, copy and paste this link into your browser:
                <br/>
                <a href="${verifyUrl}" style="color:#4CAF50; word-break:break-all;">
                  ${verifyUrl}
                </a>
              </td>
            </tr>

          </table>

          <!-- Footer -->
          <table width="480" style="margin-top:20px;">
            <tr>
              <td align="center" style="font-size:12px; color:#aaa;">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `,
    });
  } catch (err: any) {
    const message = getEmailErrorMessage(err);

    console.error("EMAIL ERROR:", {
      message: err.message,
      code: err.code,
      responseCode: err.responseCode,
    });

    throw new AppError(message, 500);
  }

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message:
      "Registration successful. A verification link is sent to your email.",
  });
});

export const resendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  if (user.isVerified) {
    throw new AppError("Email already verified", 400);
  }

  // generate new token
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const verificationToken = hashedToken;

  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;

  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL}/info?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
      <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>

  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:40px 30px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            
            <!-- Title -->
            <tr>
              <td>
                <h2 style="margin:0; color:#333; font-size:22px;">
                  Verify Your Email
                </h2>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="20"></td></tr>

            <!-- Message -->
            <tr>
              <td style="color:#555; font-size:15px; line-height:1.6;">
                Hi <b>${user.firstName}</b>,<br/><br/>
                Thanks for signing up! Please confirm your email address by clicking the button below.
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="30"></td></tr>

            <!-- Button -->
            <tr>
              <td>
                <a href="${verifyUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background-color:#4CAF50;
                    color:#ffffff;
                    font-size:15px;
                    font-weight:bold;
                    text-decoration:none;
                    border-radius:6px;
                  ">
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Spacer -->
            <tr><td height="30"></td></tr>

            <!-- Fallback -->
            <tr>
              <td style="font-size:13px; color:#888;">
                If the button doesn't work, copy and paste this link into your browser:
                <br/>
                <a href="${verifyUrl}" style="color:#4CAF50; word-break:break-all;">
                  ${verifyUrl}
                </a>
              </td>
            </tr>

          </table>

          <!-- Footer -->
          <table width="480" style="margin-top:20px;">
            <tr>
              <td align="center" style="font-size:12px; color:#aaa;">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `,
    });
  } catch (err: any) {
    const message = getEmailErrorMessage(err);

    console.error("EMAIL ERROR:", {
      message: err.message,
      code: err.code,
      responseCode: err.responseCode,
    });
    throw new AppError(message, 500);
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Verification email resent. Please check your inbox.",
  });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;

  if (!token) throw new AppError("Token is required", 400);

  const hashedToken = crypto
    .createHash("sha256")
    .update(token as string)
    .digest("hex");

  // Try to find user with valid token
  let user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (user) {
    // Token is valid, verify the user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Email verified successfully",
      data: {
        email: user.email,
      },
    });
  }

  // If no user found with valid token, check if user is already verified
  // This handles the case where the token was already used
  user = await User.findOne({
    verificationToken: hashedToken,
  });

  if (user && user.isVerified) {
    // User is already verified, return success
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Email already verified",
      data: {
        email: user.email,
      },
    });
  }

  // Token is invalid or expired
  throw new AppError("Invalid or expired token", 400);
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid email", 401);

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new AppError("Incorrect Password", 401);

  if (user.isSuspended) {
    throw new AppError("Account is suspended. Please contact support.", 403);
  }

  if (!["admin", "client", "worker"].includes(user.role)) {
    throw new AppError("Invalid user role", 403);
  }

  const token = generateToken(user._id.toString(), user.role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name:
          user.role === "admin"
            ? "Admin"
            : `${user.firstName} ${user?.lastName}`,
        email: user.email,
        role: user.role,
        address: user.address,
        approved: user.approved,
      },
      token,
    },
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Email not found", 404);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  sendEmail({
    to: user.email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "OTP has been sent to your email",
  });
});

export const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new AppError("Email not found", 404);

  if (user.otp !== otp) throw new AppError("Invalid OTP", 400);

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired", 400);
  }

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "OTP verified successfully",
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Email not found", 404);

  user.password = newPassword;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password has been reset successfully",
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const { email, currentPassword, newPassword } = req.body;

  const user = await User.findOne({ _id: userId, email });
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError("Current password is incorrect", 400);

  user.password = newPassword;
  await user.save();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password changed successfully",
  });
});

export const getAllUsers = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = buildFilter(req.query, {
    searchFields: ["firstName", "lastName", "email"],
    exact: ["role"],
    boolean: ["approved", "isNdisProvider"],
  });

  filter.role = req.query.role ? req.query.role : { $ne: "admin" };

  if (filter.role === "admin") {
    filter.role = { $ne: "admin" };
  }
  const users = await User.find(filter)
    .select("-password -otp -otpExpiry")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password -otp -otpExpiry");

  if (!user) throw new AppError("User not found", 400);

  const profile =
    user.role === "worker"
      ? await WorkerProfile.findOne({ user: userId as string })
      : await ClientProfile.findOne({ user: userId as string });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User data retrieved successfully",
    data: { user, profile },
  });
});

export const getMe = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const user = await User.findById(userId).select("-password -otp -otpExpiry");
  if (!user) throw new AppError("User not found", 404);

  const profile =
    user.role === "worker"
      ? await WorkerProfile.findOne({ user: userId })
      : await ClientProfile.findOne({ user: userId });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User profile retrieved successfully",
    data: { user, profile },
  });
});

export const getWorkersWithProfile = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { languages, search, approved } = req.query;

  // Build WorkerProfile filter
  const profileFilter: any = {};

  if (languages) {
    const languageList = (languages as string).split(",").map((l) => l.trim());

    const regexList = languageList.map((lang) => new RegExp(`^${lang}$`, "i"));

    profileFilter.$or = [
      { "languages.firstLanguages": { $in: regexList } },
      { "languages.secondLanguages": { $in: regexList } },
    ];
  }

  // Get matching profiles
  const matchingProfiles = await WorkerProfile.find(profileFilter)
    .select("user languages services gender personalDetails.avatar")
    .lean();
  const matchingUserIds = matchingProfiles.map((p) => p.user);

  // Build User filter
  const userFilter: any = {
    role: "worker",
    approved: true,
    _id: { $in: matchingUserIds },
  };

  if (search) {
    const regex = new RegExp(search as string, "i");
    userFilter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  if (approved !== undefined) {
    userFilter.approved = approved === "true";
  }

  const users = await User.find(userFilter)
    .select("-password -otp -otpExpiry")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(userFilter);

  const profileMap = new Map(
    matchingProfiles.map((p) => [
      p.user.toString(),
      {
        languages: p.languages,
        services: p.services,
        gender: p.gender,
        avatar: p.personalDetails?.avatar,
      },
    ]),
  );

  const usersWithProfiles = users.map((u) => ({
    ...u.toObject(),
    profile: profileMap.get(u._id.toString()) ?? {
      languages: { firstLanguages: [], secondLanguages: [] },
      services: [],
      gender: null,
      avatar: null,
    },
  }));

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Workers retrieved successfully",
    data: {
      users: usersWithProfiles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getMyWorkers = catchAsync(async (req, res) => {
  const clientId = req.user._id;
  const { page, limit, skip } = getPagination(req.query);
  const { languages, search, approved } = req.query;

  const agreements = await Agreement.find({
    client: clientId,
    status: "active",
  }).select("worker");

  const myWorkerIds = agreements.map((a) => a.worker);

  if (myWorkerIds.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No active workers found",
      data: { users: [], pagination: { total: 0, page, limit, totalPages: 0 } },
    });
  }

  const profileFilter: any = { user: { $in: myWorkerIds } };

  if (languages) {
    const languageList = (languages as string).split(",").map((l) => l.trim());
    const regexList = languageList.map((lang) => new RegExp(`^${lang}$`, "i"));

    profileFilter.$or = [
      { "languages.firstLanguages": { $in: regexList } },
      { "languages.secondLanguages": { $in: regexList } },
    ];
  }

  const matchingProfiles = await WorkerProfile.find(profileFilter)
    .select("user languages services gender personalDetails.avatar")
    .lean();

  const matchingUserIds = matchingProfiles.map((p) => p.user);

  // Build User filter
  const userFilter: any = {
    role: "worker",
    _id: { $in: matchingUserIds },
  };

  if (search) {
    const regex = new RegExp(search as string, "i");
    userFilter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  if (approved !== undefined) {
    userFilter.approved = approved === "true";
  }

  const users = await User.find(userFilter)
    .select(
      "firstName lastName email phoneNumber avatar address timezone isVerified approved",
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(userFilter);

  const profileMap = new Map(
    matchingProfiles.map((p) => [
      p.user.toString(),
      {
        languages: p.languages,
        services: p.services,
        gender: p.gender,
        avatar: p.personalDetails?.avatar,
      },
    ]),
  );

  const usersWithProfiles = users.map((u) => ({
    ...u.toObject(),
    profile: profileMap.get(u._id.toString()) ?? {
      languages: { firstLanguages: [], secondLanguages: [] },
      services: [],
      gender: null,
      avatar: null,
    },
  }));

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Workers retrieved successfully",
    data: {
      users: usersWithProfiles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getMyClients = catchAsync(async (req, res) => {
  const workerId = req.user._id;
  const { page, limit, skip } = getPagination(req.query);
  const { languages, search, approved } = req.query;

  const agreements = await Agreement.find({
    worker: workerId,
    status: "active",
  }).select("client");

  const myClientIds = agreements.map((a) => a.client);

  if (myClientIds.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "No active client found",
      data: { users: [], pagination: { total: 0, page, limit, totalPages: 0 } },
    });
  }

  const profileFilter: any = { user: { $in: myClientIds } };

  if (languages) {
    const languageList = (languages as string).split(",").map((l) => l.trim());

    const regexList = languageList.map((lang) => new RegExp(`^${lang}$`, "i"));

    profileFilter.$or = [
      { "languages.firstLanguages": { $in: regexList } },
      { "languages.secondLanguages": { $in: regexList } },
    ];
  }

  const matchingProfiles = await ClientProfile.find(profileFilter)
    .select("user gender avatar")
    .lean();

  const matchingUserIds = matchingProfiles.map((p) => p.user);

  // Build User filter
  const userFilter: any = {
    role: "client",
    _id: { $in: matchingUserIds },
  };

  if (search) {
    const regex = new RegExp(search as string, "i");
    userFilter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  if (approved !== undefined) {
    userFilter.approved = approved === "true";
  }

  const users = await User.find(userFilter)
    .select(
      "firstName lastName email phoneNumber avatar address timezone isVerified approved",
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(userFilter);

  const profileMap = new Map(
    matchingProfiles.map((p) => [
      p.user.toString(),
      {
        gender: p.gender,
        avatar: p.avatar ?? null,
      },
    ]),
  );

  const usersWithProfiles = users.map((u) => ({
    ...u.toObject(),
    profile: profileMap.get(u._id.toString()) ?? {
      gender: null,
      avatar: null,
    },
  }));

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Clients retrieved successfully",
    data: {
      users: usersWithProfiles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
