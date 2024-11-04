import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const client = await new Client().connect( {
	hostname: "localhost",
	port: 32771,
	username: "user",
	password: "secret",
	db: "australia",
	timeout: 120 * 1000,
} );

export default client;
