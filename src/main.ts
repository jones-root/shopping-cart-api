import "./dotenv.js";
import { createServer } from "./server_config.js";

const port = Number(process.env.PORT) || 3000;
const app = createServer();

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
