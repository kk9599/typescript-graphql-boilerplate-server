import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { GrantedPermission } from "./GrantedPermission";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text") password: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @OneToMany(
    _ => GrantedPermission,
    grantedPermission => grantedPermission.team,
    {
      cascade: true
    }
  )
  grantedPermissions: GrantedPermission[];

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
