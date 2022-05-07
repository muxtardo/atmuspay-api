import { Column, Entity, Generated, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { EntityBase } from "../lib/abstracts/EntityBase";
import {
	compare as bcryptCompare,
	hash as bcryptHash
} from "bcrypt";
import { UserBalance } from "./UserBalance";
import { UserAddress } from "./UserAddress";
import { Transaction } from "./Transaction";
import { Category } from "./Category";
import { UserAccountBank } from "./UserBankAccount";
import { Transfer } from "./Transfer";
import { Withdrawal } from "./Withdrawal";
import { UserConfig } from "./UserConfig";
import { UserToken } from "./UserToken";
import { UserTwoFactor } from "./UserTwoFactor";

export enum UserGender {
	FEMALE = "F",
	MALE = "M"
}

export enum UserDocumentType {
	CPF = "CPF",
	CNPJ = "CNPJ"
}

@Entity()
export class User extends EntityBase {
	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	password_last_change_at: Date;

	@Column()
	name: string;

	@Column({ nullable: true })
	birthday: Date;

	@Column({
		type: "enum",
		enum: UserGender,
		nullable: true
	})
	gender: UserGender;

	@Column({ unique: true })
	email: string;

	@Column({ unique: true, nullable: true })
	email_change: string;

	@Column({ default: false })
	email_verified: boolean;

	@Column({ nullable: true })
	email_verified_at: Date;

	@Column({ nullable: true })
	email_changed_at: Date;

	@Column({ nullable: true })
	email_code: string;

	@Column({ nullable: true })
	email_code_send_at: Date;

	@Column({ unique: true, nullable: true })
	document: string;

	@Column({
		type: "enum",
		enum: UserDocumentType,
		nullable: true
	})
	document_type: UserDocumentType;

	@Column({ default: "profile/default.jpg" })
	avatar: string;

	@Column({ default: new Date() })
	avatar_updated_at: Date;

	@Column({ nullable: true, unique: true })
	phone: string;

	@Column({ default: false })
	phone_verified: boolean;

	@Column({ default: 0 })
	fail_login: number;

	@OneToOne(() => UserAddress, userAddress => userAddress.user)
	address: UserAddress;

	@OneToOne(() => UserBalance, userBalance => userBalance.user)
	balance: UserBalance;

	@OneToOne(() => UserConfig, userConfig => userConfig.user)
	config: UserConfig;

	@OneToOne(() => UserTwoFactor, userTwoFactor => userTwoFactor.user)
	two_factor: UserTwoFactor;

	@OneToOne(() => Category)
	@JoinColumn({ name: "category_id" })
	category: Category;

	@Column({ default: false })
	is_international: boolean;

	@Column({ default: false })
	is_active: boolean;

	@Column({ default: false })
	finished_by_user: boolean;

	@Column({ default: false })
	is_blocked: boolean;

	@Column({ default: false })
	blocked_by_user: boolean;

	@Column({ default: false })
	verified_account: boolean;

	@Column({ default: false })
	access_card: boolean;

	@OneToMany(() => UserAccountBank, userAccountBank => userAccountBank.user)
	accounts: UserAccountBank[];

	@OneToMany(() => Transaction, transaction => transaction.user)
	transactions: Transaction[];

	@OneToMany(() => Transaction, transfer => transfer.user)
	transfers: Transfer[];

	@OneToMany(() => Withdrawal, withdrawal => withdrawal.user)
	withdrawals: Withdrawal[];

	@OneToMany(() => UserToken, token => token.user)
	tokens: UserToken[];

	toJSON(): User {
		const obj: any = { ...this };
		delete obj.password;

		return obj;
	}

	static hashPassword(password: string, salt = 10): Promise<string> {
		return bcryptHash(password, salt);
	}

	checkPassword(password: string): Promise<boolean> {
		return bcryptCompare(password, this.password);
	}
}
