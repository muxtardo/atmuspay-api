import { UserAccountBank } from "entity/UserBankAccount";
import { User } from "../entity/User";
import { Helper } from "../_core/decorators";

@Helper()
export class UserHelper {
	maskEmail(email: string): string | null {
		if (!email) return null;

		// Email mask ema****@example.com
		const [ username, host ] = email.split("@");
		return username.slice(0, 3) + "*".repeat(4) + "@" + host;
	}

	maskPhone(phone: string): string | null {
		if (!phone) return null;

		// Phone mask 55****3572
		return phone.substring(0, 2) + "*".repeat(4) + phone.slice(-4);
	}

	publicData(user: User): any {
		const userData = {
			_id: user.id,
			user: user.username,
			verified_account: user.verified_account,
			document: {
				document: user.document,
				type: user.document_type,
			}
		};

		return userData;
	}

	privateData(user: User): any {
		const userData = {
			_id: user.id,
			document: {
				document: user.document,
				type: user.document_type
			},
			withdrawal_bank: {
				is_active: true,
				third_enabled: false,
				custom_rate: false,
				rate: 3390,
				custom_third_rate: false,
				third_rate: 4890,
				custom_limit: false,
				limit: 1234,
				custom_min_value: false,
				min_value: 1000
			},
			monthly_payment: {
				custom_payment: false,
				value: 0,
				pending_value: 0
			},
			admin: {
				is_active: false,
				permissions: []
			},
			password: {
				two_factors: {
					is_active: user.two_factor?.is_active,
					disable_attempts: user.two_factor?.disable_attempts,
					type: user.two_factor?.type
				},
				last_change: user.password_last_change_at,
				login_attempts: user.fail_login
			},
			email: {
				verified: user.email_verified,
				email: this.maskEmail(user.email),
				email_change: user?.email_change
			},
			validation: {
				is_valid: false,
				files: []
			},
			phone: {
				count_send_verification_code: 0,
				verified: user.phone_verified,
				phone: this.maskPhone(user.phone)
			},
			address: user.address,
			images: {
				profile: {
					updated: user.avatar_updated_at,
					profile: user?.avatar
				}
			},
			balance: {
				balance: user.balance.balance,
				balance_blocked: user.balance.balance_blocked,
				balance_future: user.balance.balance_future
			},
			birthday: user.birthday,
			gender: user.gender,
			access_card: user.access_card,
			is_active: user.is_active,
			finished_by_user: user.finished_by_user,
			is_blocked: user.is_blocked,
			blocked_by_user: user.blocked_by_user,
			verified_account: user.verified_account,
			updated_at: user.updated_at,
			user: user.username,
			name: user.name,
			accounts: user.accounts.map(account => this.accountPrivateData(account)),
			created_at: user.created_at
		};

		if (!user.avatar) delete userData.images.profile.profile;
		if (!user.document) delete userData.document;

		return userData;
	}

	public accountPrivateData(userAccountBank: UserAccountBank): any {
		const userAccountBankData = {
			_id: userAccountBank.id,
			bank: userAccountBank.bank.name,
			agency: userAccountBank.agency,
			account: userAccountBank.account,
			codigo: userAccountBank.bank.code,
			ispb: userAccountBank.bank.ispb,
			account_type: userAccountBank.account_type,
			is_third: userAccountBank.is_third,
			default: userAccountBank.is_default,
			name: userAccountBank.name,
			document: userAccountBank.document
		};

		if (!userAccountBankData.is_third) {
			delete userAccountBankData.name;
			delete userAccountBankData.document;
		}

		return userAccountBankData;
	}
}
