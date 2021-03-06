import db from "../../../../knex";
import { users } from "../../../../types/dbschema";

// load a single user by id
export default async (data: {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
}): Promise<users[]> =>
  db("users")
    .insert(data)
    .returning("*");
