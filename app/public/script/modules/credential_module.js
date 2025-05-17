

export async function init()
{
    DIDSelection.addEventListener("change",updateCredentialsTable)
    createSelection().then(async ()=>{
        updateCredentialsTable()
        console.log("credentials loaded.")
    })
}


async function createSelection()
{
    const DIDS = await (await fetch("/did/")).json()
    DIDS.forEach((did)=>{
        const option = document.createElement("option")
        option.innerText = did.alias
        option.value=did.did
        DIDSelection.appendChild(option)
    })
}

async function updateCredentialsTable()
{
    const selectedOption = DIDSelection.options[DIDSelection.selectedIndex]
    const rows = Array.from(credentials.querySelectorAll("tr"))
    rows.shift()
    rows.forEach((row)=>{
        row.remove()
    })
    
    const OPTIONS = {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({alias:selectedOption.innerText,did:selectedOption.value})
    }
    const CREDENTIALS = await (await fetch("/credential",OPTIONS)).json()
    CREDENTIALS.forEach(async (credential)=>{
        credentials.appendChild(await createCredentialsTableData(credential))
    })
}


function createCredentialsTableData(credential)
{
    credential = credential.verifiableCredential || credential

    const TABLE_ROW = document.createElement("tr")
    
    const ID_TD = document.createElement("td")
    ID_TD.innerText = credential.proof.jwt
    ID_TD.addEventListener("click",()=>{
        navigator.clipboard.writeText(ID_TD.innerText);

    })
    
    const SUBJECT_NAME_TD = document.createElement("td")
    SUBJECT_NAME_TD.innerText = credential.credentialSubject.you
    
    const ISSUER_TD = document.createElement("td")
    ISSUER_TD.innerText = credential.issuer.name
    
    const TYPE_TD = document.createElement("td")
    TYPE_TD.innerText = credential.type[1]
    
    const CREATION_DATE_TD = document.createElement("td")
    CREATION_DATE_TD.innerText = credential.issuanceDate
    
    const expirationDate = credential.expirationDate || ""
    const EXPIRATION_DATE_TD = document.createElement("td")
    EXPIRATION_DATE_TD.innerText = credential.expirationDate || ""

    const isExpired = (expirationDate == "" || new Date() < new Date(expirationDate))
    const REVOKED_TD = document.createElement("td")
    REVOKED_TD.innerText = isExpired ? "✔" : "X"
    
    const BUTTONS = document.createElement("td")
    BUTTONS.classList.add("layoutHorizontal","tableButtons")

    const QRCODE_BUTTON = document.createElement("button")
    QRCODE_BUTTON.setAttribute("type","button")
    const QRCODE_ILLUSTRATION = document.createElement("img")
    QRCODE_ILLUSTRATION.src = "images/qrcode.svg"
    QRCODE_BUTTON.appendChild(QRCODE_ILLUSTRATION)
    QRCODE_BUTTON.addEventListener("click",()=>{
        getQrCode(ID_TD.innerText)
    })
    BUTTONS.appendChild(QRCODE_BUTTON)

    const DELETE_BUTTON = document.createElement("button")
    DELETE_BUTTON.classList.add("cancelButton")
    DELETE_BUTTON.setAttribute("type","button")
    const DELETE_BUTTON_ILLUSTRATION = document.createElement("img")
    DELETE_BUTTON_ILLUSTRATION.src = "images/trash_bin.svg"
    DELETE_BUTTON.appendChild(DELETE_BUTTON_ILLUSTRATION)
    DELETE_BUTTON.addEventListener("click",async ()=>{
        const res = await delete_credential(ID_TD.innerText)
        if(res.status == 204)
            TABLE_ROW.remove()
        /*
        else
        {
            // TODO: Pop up error
        }
        */
    })
    
    BUTTONS.appendChild(DELETE_BUTTON)
    
    TABLE_ROW.appendChild(ID_TD)
    TABLE_ROW.appendChild(SUBJECT_NAME_TD)
    TABLE_ROW.appendChild(ISSUER_TD)
    TABLE_ROW.appendChild(TYPE_TD)
    TABLE_ROW.appendChild(CREATION_DATE_TD)
    TABLE_ROW.appendChild(EXPIRATION_DATE_TD)
    TABLE_ROW.appendChild(REVOKED_TD)
    TABLE_ROW.appendChild(BUTTONS)
    return TABLE_ROW
}

export async function createCredentialModal()
{
    const container = buildModal()
    fetch("/modal/credential_modal.ejs").then((res)=>{
        res.text().then((content)=>{
            container.modal.innerHTML = content
            setTimeout(()=>{
                issuerSelection.innerHTML = DIDSelection.innerHTML
                subjectSelection.innerHTML = DIDSelection.innerHTML
                container.show()
            },100)
        })
    })
}


export async function createCredential()
{
    if(subjectStatusInput.value == "")
    {
        subjectStatusInput.focus()
        // TODO : Pop up error
        return
    }

    const BODY ={
        issuerDID:issuerSelection.value,
        subjectDID:subjectSelection.value,
        subjectStatus:subjectStatusInput.value,
        expirationDate:expirationDateInput.value != "" ? expirationDateInput.value : null
    }
    const OPTIONS = {
        method:"POST",
        body:JSON.stringify(BODY),
        headers: {
            "Content-Type": "application/json"
        }
    }
    const res = await fetch("credential/create",OPTIONS)
    if(res.status == 200)
    {
        credentials.appendChild(await createCredentialsTableData(await res.json()))
        modal.close()
    }
    else
    {
        // TODO: popup error
    }
}

async function delete_credential(jwt)
{
    const OPTIONS = {
        method:"DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({token:jwt})
    }
    return await fetch("/credential/delete", OPTIONS)
}

async function getQrCode(jwt)
{
    fetch(`/credential/code?token=${jwt}`).then(res => {
        const disposition = res.headers.get('Content-Disposition');
        const match = disposition?.match(/filename="(.+)"/);
        const filename = match ? match[1] : 'qrcode.png';

        return res.blob().then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        });
    });

}