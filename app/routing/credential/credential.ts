import {agent} from "../../src/veramo/setup.js"

import {Router} from "express"
import QRCode from "qrcode"
import {Logger, COLORCODELIST} from "../../utils/logs/logs"

import {getDID} from "../did/did"
import { UniqueVerifiableCredential } from "@veramo/core"


const logger = new Logger("./log/credentials",`${COLORCODELIST.fgMagenta}CREDENTIALS${COLORCODELIST.reset}`,true)


export const router = Router()


router.post("/",async (req:any, res:any)=>{
    const {did, alias} = req.body
    logger.infoLog(`Asked for all credentials for ${alias}.`)
    res.json(await getCredentials(did))
})

router.post("/create",async (req:any, res:any)=>{
    const {issuerDID, subjectDID, subjectStatus, expirationDate} = req.body
    try
    {
        res.json(await createCredential(issuerDID, subjectDID, subjectStatus, expirationDate))
    }
    catch(err)
    {
        res.status(500).json({error:`Something wrong happened while creating the credentials : ${err}.`})
    }
})

router.post("/count",async (req:any, res:any)=>{
    const {did} = req.body
    res.status(200).json({count:(await getCredentials(did)).length})
})

router.delete("/delete",async (req:any, res:any)=>{
    const {token} = req.body
    if(token)
    {
        const result = await deleteCredential(token)
        if(result)
            res.status(204).end()
        else
        {
            logger.errorLog(`An error occured while deleting the credentials : ${result}`)
            res.status(500).json({error:"An unknown error occured, we'll take care of this shortly."})
        }
        return
    }
    res.status(422).json({error:"the token is missing."})
})

router.post("/verify",async (req:any, res:any)=>{
    const {token} = req.body
    const response = await verifyCredential(token)
    if(response.verified)
    {
        res.status(200).json(response.verifiableCredential)
        return
    }
    res.status(404).json(response)
})
router.get("/code",async (req:any, res:any)=>{
    const {token} = req.query
    const credential = await getCredentialByToken(token)
    console.log(JSON.stringify(credential,null,2))
    QRCode.toBuffer(JSON.stringify(credential),(err,buffer)=>{
        if(err)
            res.status(500).json({error:`Couldn't generate the QrCode : ${err}.`})
        else
        {
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="qrcode_${credential?.verifiableCredential.credentialSubject.you.replace(" ","_")}_${credential?.verifiableCredential.type[1].replace(" ","_")}.png"`);
            res.status(200).send(buffer)
        }
    })
})




async function getCredentials(did:string)
{
    return await agent.dataStoreORMGetVerifiableCredentials({
        where: [{ column: 'subject', value: [did]}]
    });
}

async function createCredential(issuerDID:string,subjectDID:string,subjectStatus:string, expirationDate:string|undefined=undefined)
{
    const issuerIdentifier = await getDID(issuerDID)

    const subjectIdentifier = await getDID(subjectDID)


    logger.infoLog(`Asked to create a credentials for ${issuerIdentifier.alias} as ${subjectStatus} identified by ${subjectIdentifier.alias}${expirationDate!=undefined ? " until " + expirationDate : ""}.`)

    logger.actionLog(`Creating verifiable Credential for ${subjectIdentifier.alias} as ${subjectStatus} identified by ${issuerIdentifier.alias}${expirationDate!=undefined ? " until " + new Date(expirationDate) : ""}.`)
    try
    {
    }
    catch(err)
    {

    }
    const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
            issuer: {
                id: issuerIdentifier.did,
                name:issuerIdentifier.alias
            },
            credentialSubject : {
                id: subjectIdentifier.did,
                you: subjectIdentifier.alias,
            },
            type:[subjectStatus],
            expirationDate,
        },
        proofFormat: 'jwt',
        save:true
    })
    logger.successLog(`Verifiable Credential successfully created.`)
    return verifiableCredential
}


async function verifyCredential(jwt:string)
{
    logger.actionLog(`Checking a jwt.`)
    return await agent.verifyCredential({credential:jwt})
}


async function getCredentialByToken(token:string):Promise<UniqueVerifiableCredential|undefined>
{
        const credentials = await agent.dataStoreORMGetVerifiableCredentials()

        return credentials.find(c => c.verifiableCredential.proof.jwt === token)
}


async function deleteCredential(token:string): Promise<Object>
{
    const credential = await getCredentialByToken(token)
    if(!credential)
        return {error:"No credential linked to this token"}
    const hash = credential.hash
    return await agent.dataStoreDeleteVerifiableCredential({ hash })
}