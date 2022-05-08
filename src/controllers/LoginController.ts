import validator from "validator";
import { Repository } from "typeorm";
import { RequestMethod } from "../lib/enums/RequestMethod";
import { Controller, HttpRequest, Inject, InjectRepository, Request } from "../lib/decorators";
import { IUserLogin } from "../interfaces/UserLogin";
import { UtilsHelper } from "../helpers/UtilsHelper";
import { User } from "../entity/User";
import { ApiResError, ApiResSuccess } from "../utils/Response";

@Controller({
	path: ["/login"]
})
export class LoginController {
	@Inject() private utilsHelper: UtilsHelper;

	@InjectRepository(User) private userRepo: Repository<User>;

	@Request({
		path: "/",
		method: RequestMethod.POST
	})
	async index(@HttpRequest() req): Promise<any> {
		try {
			const {
				username,
				password
			}: IUserLogin = req.body;


			// Validar formulário
			if (!username || !password) {
				return ApiResError(2, {
					title: "Erro no login",
					message: "Dados para login não enviados."
				});
			}

			// Check if user exists
			const user: User = await this.userRepo.findOneBy({ username });
			if (!user) {
				return ApiResError(3, {
					title: "Erro no login",
					message: "Usuário ou senha inválidos, tente novamente."
				});
			}

			if (user.fail_login >= 3) {
				return ApiResError(4, {
					title: "Erro no login",
					message: "Voce errou sua senha mais de 3 vezes. Para conseguir acessar novamente voce deve criar uma nova senha."
				});
			}


			// Check if password is correct
			const isPasswordCorrect: boolean = await user.checkPassword(password);
			if (!isPasswordCorrect) {
				// Increment fail_login
				++user.fail_login;
				await this.userRepo.save(user);

				return ApiResError(3, {
					title: "Erro no login",
					message: "Usuário ou senha inválidos, tente novamente."
				});
			}

			// Generate token
			const token: string = this.utilsHelper.createJWT(user.id, {
				expiresIn: "1d"
			});

			// Reset failLogin
			user.fail_login = 0;
			await this.userRepo.save(user);

			// Return token
			return ApiResSuccess({
				title: "Sucesso no login",
				message: "Login efetuado com sucesso"
			}, { token });
		} catch (error) {
			return ApiResError(1, {
				title: "Falha na solicitação",
				message: "Não foi possível realizar a solicitação, tente novamente mais tarde."
			});
		}
	}
}
