import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";
import * as dotenv from "dotenv";

export interface APIOptions {
    host: string;
    port: number;
}

export type LoggingOptions = ("log" | "error" | "warn" | "debug" | "verbose")[]


export default () => {
    const envConfig = dotenv.parse(
        readFileSync(join(__dirname,"..", "..", ".env"))
    );

    const yamlConfig = yaml.load(
        readFileSync(join(__dirname, `config.${process.env.NODE_ENV ?? "development"}.yaml`), "utf8")
    ) as Record<string, any>

    return {...envConfig, ...yamlConfig} as Record<string, any>; 
}