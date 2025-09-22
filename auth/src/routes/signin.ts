import express, { Request, Response } from "express";
import { User } from "../models/user";
import { body } from "express-validator";
import {
  BadRequestError,
  validationCredsHandler,
  TokenService,
} from "@ticketsproj/services";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("invalidEmail"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password must not be empty "),
  ],
  validationCredsHandler,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("invalid credentials");
    }

    const isPasswordMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!isPasswordMatch) {
      throw new BadRequestError("invalid credentials");
    }

    req.session = TokenService.generateToken({
      id: existingUser.id,
      email: existingUser.email,
    });

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
