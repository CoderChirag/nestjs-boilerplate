import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { map } from "rxjs";

@Injectable()
export class ReqResInterceptor implements NestInterceptor {
	constructor(private readonly loggerService: Logger) {}
	intercept(context: ExecutionContext, next: CallHandler) {
		const req = context.switchToHttp().getRequest();
		this.loggerService.log({
			body: req.body,
			method: req.method,
			query: req.query,
			url: req.url,
		});
		return next.handle().pipe(
			map((data) => {
				return {
					success: true,
					data,
				};
			}),
		);
	}
}
