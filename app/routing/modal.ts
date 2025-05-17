import {Router} from "express"

export const router = Router()
import {Logger, COLORCODELIST} from "../utils/logs/logs"

const logger = new Logger(undefined,`${COLORCODELIST.fgCyan}MODAL${COLORCODELIST.reset}`)

router.use((req:any,res:any,next:Function)=>{
    logger.actionLog(`Asked for ${req.url}.`)
    next()
})

router.get("/:modalName.ejs",(req:any,res:any)=>{
    const {modalName} = req.params
    logger.actionLog(`Looking for ${COLORCODELIST.bold}${req.path}${COLORCODELIST.reset}.`)
    res.render(`modal/${modalName}.ejs`,(err:any,html:any)=>{
        if(err)
        {
            logger.errorLog(`Couldn't find Modal ${COLORCODELIST.bold}${req.path}${COLORCODELIST.reset}.`)
            logger.errorLog(err)
            res.status(404).send("<p>Error : Modal not found.</p>")
        }
        else
        {
            res.send(html)
            logger.infoLog(`${COLORCODELIST.bold}${req.path}${COLORCODELIST.reset} sent successfully.`)
        }
    })
})