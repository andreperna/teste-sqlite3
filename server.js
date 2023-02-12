import app from "./api/index.js";
import http from "http"
const PORT = 3000 | process.PORT

const server = http.createServer(app)

server.listen(PORT, "0.0.0.0", ()=>console.log("server run"))