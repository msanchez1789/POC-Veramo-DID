export async function init()
{
    const DIDS = await (await fetch("/did")).json()
    DIDS.forEach(async (did)=>{
        try
        {
            dids.appendChild(await buildTableData(did))
        }
        catch(err)
        {
            console.log(err)
        }
    })

}
export async function createDIDModal()
{
    const container = buildModal()
    fetch("/modal/did_modal.ejs").then((res)=>{
        res.text().then((content)=>{
            container.modal.innerHTML = content
            container.show()
        })
    })
}

export async function createDid()
{
    if(didAlias.value)
        {
        const OPTIONS = {
            method:"POST",
            body:JSON.stringify({alias:didAlias.value}),
            headers: {
                "Content-Type": "application/json"
            }
        }
        fetch("/did/create",OPTIONS).then(async (res)=>{
            if(res.status == 201)
            {
                dids.appendChild(await buildTableData(await res.json()))
                modal.close()
            }
            else if(res.status == 409)
            {
                didAlias.value=""
                // TODO: ERROR POP UP "ALREADY EXISTS"
            }
            else
            {
                // TODO: ERROR POP UP
            }
        })
    }
    else
    {
        didAlias.focus()
    }
}


async function buildTableData(did)
{
    const TABLE_ROW = document.createElement("tr")
    
    const ISSUER = document.createElement("td")
    ISSUER.innerText = did.alias
    
    const PROVIDER = document.createElement("td")
    PROVIDER.innerText = did.provider
    
    const DID = document.createElement("td")
    DID.innerText = did.did
    
    const CREDENTIALS = document.createElement("td")
    const count = await getCredentialCount(did.did)
    CREDENTIALS.innerText = count

    const BUTTONS = document.createElement("td")
    BUTTONS.classList.add("layoutHorizontal","tableButtons")
    const DELETE_BUTTON = document.createElement("button")
    DELETE_BUTTON.classList.add("cancelButton")
    DELETE_BUTTON.setAttribute("type","button")
    const DELETE_BUTTON_ILLUSTRATION = document.createElement("img")
    DELETE_BUTTON_ILLUSTRATION.src = "images/trash_bin.svg"
    DELETE_BUTTON.appendChild(DELETE_BUTTON_ILLUSTRATION)
    DELETE_BUTTON.addEventListener("click",async ()=>{
        const OPTIONS = {
            method:"DELETE",
            body:JSON.stringify({did:DID.innerText, alias:ISSUER.innerText}),
            headers: {
                "Content-Type": "application/json"
            }
        }
        const res = await fetch("/did/delete",OPTIONS)
        if(res.status == 204)
            TABLE_ROW.remove()
        else
        {
            // TODO: POP UP ERROR
        }
    })
    BUTTONS.appendChild(DELETE_BUTTON)
    
    TABLE_ROW.appendChild(ISSUER)
    TABLE_ROW.appendChild(PROVIDER)
    TABLE_ROW.appendChild(DID)
    TABLE_ROW.appendChild(CREDENTIALS)
    TABLE_ROW.appendChild(BUTTONS)
    return TABLE_ROW
}

async function getCredentialCount(did)
{
    const OPTIONS = {
        method:"POST",
        body:JSON.stringify({did}),
        headers: {
            "Content-Type": "application/json"
        }
    }
    return (await (await fetch("/credential/count",OPTIONS)).json()).count
}