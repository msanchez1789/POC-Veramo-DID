console.clear()

import express from "express"
import { createServer} from "http"


import { COLORCODELIST, Logger } from './utils/logs/logs';
import {router as DIDRouter} from "./routing/did/did"
import {router as credentialRouter} from "./routing/credential/credential"
import {router as modulesRouter} from "./routing/modules"
import {router as modalRouter} from "./routing/modal"

const logger = new Logger("./log",`${COLORCODELIST.fgGreen}GENERAL${COLORCODELIST.reset}`,true)

const app = express()
const server = createServer(app);

app.set("view engine", "ejs");
app.use(express.static("public"))



const PORT = 7777
app.get("/",(req:any,res:any)=>{
    res.render("index")
})


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/did",DIDRouter)
app.use("/modules",modulesRouter)
app.use("/modal",modalRouter)
app.use("/credential",credentialRouter)

server.listen(PORT,()=>{
    logger.infoLog(`Server listenning on ${COLORCODELIST.fgCyan}http://localhost:${PORT}${COLORCODELIST.reset}`)
})