import {agent} from "../../src/veramo/setup.js"

import {Router} from "express"
import {Logger, COLORCODELIST } from '../../utils/logs/logs';
const logger = new Logger("./log/did",`${COLORCODELIST.fgRed}DID${COLORCODELIST.reset}`,true)

export const router = Router()

router.get("/",async (req:any, res:any)=>{
    logger.infoLog("Asked for all DID.")
    res.json(await getAllDid())
})
router.get("/count",async (req:any, res:any)=>{
    logger.infoLog("Asked for did count.")
    res.json(await getDidsCount())
})
router.get("/:alias",async (req:any, res:any)=>{
    logger.infoLog(`asked for did ${req.params.alias}`)
    res.json(await getDIDByAlias(req.params.alias))
})

router.post("/create", async (req:any, res:any)=>{
    logger.infoLog(`Received data to create an alias.`)
    if(Object.keys(req.body).length > 0 && req.body.hasOwnProperty("alias"))
    {
        const {alias} = req.body
        createDid(alias).then((result:any)=>{
            if(typeof(result) == "object")
            {
                logger.successLog(`Successfully created DID ${alias}.`)
                res.status(201).send(result)
            }
            else if(result == -2)
            {
                res.status(409).send({error:"DID Already exist."})
            }
            else
            {
                res.status(500).send({error:`[DID Creation] - Error Unknown ${res}`})
            }
            res.end()
        })
    }
})

router.delete("/delete",async (req:any,res:any)=>{
    if(Object.keys(req.body).length > 0 && req.body.hasOwnProperty("did"))
    {
        const {did, alias} = req.body
        logger.actionLog(`Deleting DID ${alias}`)
        try
        {
            const result = await agent.didManagerDelete({did})
            logger.successLog(`Successfully deleted ${alias}.`)
            res.status(204).end()
        }
        catch(err:any)
        {
            logger.failureLog(`Failed to delete ${alias} :`)
            logger.errorLog(err)
            res.status(500).send(err)
        }
    }
})



async function getDIDByAlias(alias:string)
{
    try
    {
        logger.actionLog(`Looking for ${alias}.`)
        return await agent.didManagerGetByAlias({alias})
    }
    catch(err:any)
    {
        logger.errorLog(err.message)
    }
}

async function getAllDid()
{
    try
    {
        logger.actionLog("Collecting all DIDS.")
        return await agent.didManagerFind()
    }
    catch(err:any)
    {
        logger.errorLog(err)
    }
}

async function getDidsCount()
{
    try
    {
        logger.actionLog("Counting DIDS")
        const DIDS_COUNT = (await agent.didManagerFind()).length
        logger.infoLog(`${DIDS_COUNT} DIDS created.`)
        return DIDS_COUNT
    }
    catch(err:any)
    {
        logger.errorLog(err)
    }
}

async function createDid(alias:string)
{
    logger.actionLog(`Creating new DID named ${alias}.`)
    try
    {
        return await agent.didManagerCreate({alias})
    }
    catch(err:any)
    {
        logger.failureLog(`Couldn't create DID named ${COLORCODELIST.bold}${COLORCODELIST.fgRed}${alias}${COLORCODELIST.reset} :`)
        logger.errorLog(err)
        if(err.message.toLowerCase().includes("already exists"))
            return -2
        else
        {
            return err
        }
    }
}

export async function getDID(did:string)
{
    logger.actionLog(`Fetching ${did}'s did.`)
    return await agent.didManagerGet({did})
}

// getAllDid().then((dids)=>{
//     console.log(JSON.stringify(dids,undefined,2))
// })