import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import {
  BadRequestError,
  TokenService,
  validationCredsHandler,
} from "@ticketsproj/services";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("invalidEmail"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters long"),
  ],
  validationCredsHandler,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    const user = await User.build({ email, password });
    await user.save();
    req.session = TokenService.generateToken({
      id: user.id,
      email: user.email,
    });
    res.status(201).send(user);
  }
);

export { router as signupRouter };
