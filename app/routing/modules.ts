import {Router} from "express"


export const router = Router()
import { COLORCODELIST, Logger } from '../utils/logs/logs';
const logger = new Logger("./log/module",`${COLORCODELIST.fgOrange}MODULES${COLORCODELIST.reset}`,true)


router.use((req:any,res:any, next:any)=>{
    logger.infoLog(`Asked for ${COLORCODELIST.bold}${req.path}${COLORCODELIST.reset}`)
    next();
})
router.get("/:moduleName.ejs",(req:any,res:any)=>{
    const {moduleName} = req.params
    logger.actionLog(`Looking for ${COLORCODELIST.bold}${req.path}${COLORCODELIST.reset}.`)
    res.render(`modules/${moduleName}.ejs`,(err:any,html:any)=>{
        if(err)
        {
            logger.errorLog(`Couldn't find module ${COLORCODELIST.bold}${req.path}${COLORCODELIST.reset}.`)
            logger.errorLog(err)
            res.status(404).send("<p>Error : Module not found.</p>")
        }
        else
        {
            res.send(html)
            logger.infoLog(`${COLORCODELIST.bold}${req.path}${COLORCODELIST.reset} sent successfully.`)
        }
    })
})