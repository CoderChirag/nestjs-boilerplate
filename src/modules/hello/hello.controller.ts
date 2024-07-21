import { Controller, Get } from "@nestjs/common";
import { HelloService } from "./hello.service";

@Controller()
export class HelloController {
	constructor(private readonly helloService: HelloService) {}

	@Get()
	async getHello() {
		return await this.helloService.getHello22();
	}
	@Get("sql")
	async getH() {
		return await this.helloService.getHello44();
	}
}
