import * as faker from "faker";

import db from "../../../knex";
import { TestClientApollo } from "../../../utils/TestClientApollo";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail
} from "./errorMessages";
import { passwordNotLongEnough } from "../shared/errorMessages";

faker.seed(Date.now() + process.hrtime()[1]);
const email = faker.internet.email();
const password = faker.internet.password();

describe("Register User", async () => {
  test("check for duplicate email", async () => {
    // make sure we can register a user
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.register(email, password);

    expect(response.data).toEqual({
      register: { register: null, error: null }
    });
    // const users = await User.find({ where: { email } });
    const users = await db("users").where({ email }); // User.query().where({ email });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    // test for duplicate emails
    const response2 = (await client.register(email, password)) as any;
    expect(response2.data.register.error).toHaveLength(1);
    expect(response2.data.register.error[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  test("check bad email", async () => {
    // catch bad email
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.register("b", password);

    expect(response.data).toEqual({
      register: {
        error: [
          { message: emailNotLongEnough, path: "email" },
          { message: invalidEmail, path: "email" }
        ],
        register: null
      }
    });
  });

  test("check bad password", async () => {
    // catch bad password
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.register(email, "ad");

    expect(response.data).toEqual({
      register: {
        error: [{ message: passwordNotLongEnough, path: "password" }],
        register: null
      }
    });
  });

  test("check bad password and bad email", async () => {
    // catch bad password and bad email
    const client = new TestClientApollo(process.env.TEST_HOST as string);
    const response = await client.register("df", "ad");

    expect(response.data).toEqual({
      register: {
        error: [
          { message: emailNotLongEnough, path: "email" },
          { message: invalidEmail, path: "email" },
          { message: passwordNotLongEnough, path: "password" }
        ],
        register: null
      }
    });
  });
});
