import dotenv from "dotenv";
import { App } from "./app";

dotenv.config({ path: ".env" });

new App();