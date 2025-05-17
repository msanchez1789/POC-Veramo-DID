export async function init()
{
    console.log("Verification loaded.")
}


export async function verifyCredential()
{
    if(jwtInput.value.trim()=="")
    {
        jwtInput.value=""
        jwtInput.focus()
        return
    }
    verificationStatus.classList.add("hidden")
    const OPTIONS = {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({token:jwtInput.value})
    }
    const res = await fetch("/credential/verify",OPTIONS)
    setTimeout(async ()=>{
        verificationInformation.innerHTML = ""
        if(res.status == 200)
        {
            const data = await res.json()
            const issuer = data.issuer
            const subject = data.credentialSubject
            const type = data.type[1]

            const ISSUER = document.createElement("fieldset")
            ISSUER.classList.add("container","layoutVertical")

            const issuerName = document.createElement("legend")
            issuerName.innerText  = `Organisation - ${issuer.name}`
            ISSUER.appendChild(issuerName)

            const issuerDID = document.createElement("span")
            issuerDID.innerText = issuer.id
            ISSUER.appendChild(issuerDID)

            const SUBJECT = document.createElement("fieldset")
            SUBJECT.classList.add("container","layoutVertical")

            const subjectName = document.createElement("legend")
            subjectName.innerText = subject.you
            SUBJECT.appendChild(subjectName)

            const subjectDID = document.createElement("span")
            subjectDID.innerText = subject.id
            SUBJECT.appendChild(subjectDID)

            const CREDENTIAL = document.createElement("fieldset")
            CREDENTIAL.classList.add("container","layoutVertical")

            const credentialName = document.createElement("legend")
            credentialName.innerText = type
            CREDENTIAL.appendChild(credentialName)

            const credentialIssueDate = document.createElement("span")
            const issueDate = new Date(data.issuanceDate)
            credentialIssueDate.innerText = `Délivrée le ${issueDate.toLocaleDateString()} ${issueDate.toLocaleTimeString()}`
            CREDENTIAL.appendChild(credentialIssueDate)

            const credentialExpirationDate = document.createElement("span")
            const expirationDate = new Date(data.expirationDate)
            credentialExpirationDate.innerText = data.expirationDate == null ? "N'expirera pas." : `Expire le ${expirationDate.toLocaleDateString()} ${expirationDate.toLocaleTimeString()}.`
            CREDENTIAL.appendChild(credentialExpirationDate)

            verificationInformation.appendChild(ISSUER)
            verificationInformation.appendChild(SUBJECT)
            verificationInformation.appendChild(CREDENTIAL)
        }
        else
        {
            setValidationIllustration(false)
            const ERROR_MESSAGE = document.createElement("div")
            ERROR_MESSAGE.classList.add("invalid")

            const message = (await res.json()).error.message
            if(message.includes("expired"))
            {
                const EXP_REG = new RegExp("(?<=exp\:\ ).*?(?=\ )")
                const expirationDate = new Date(EXP_REG.exec(message)[0] * 1000).toLocaleDateString()
                ERROR_MESSAGE.innerText = `Cette accréditation existe mais n'est plus valide depuis le ${expirationDate}`
            }
            else if(message.includes("no matching"))
            {
                ERROR_MESSAGE.innerText = "Aucune accréditation liée a ce token."
            }
            else if(message.includes("Incorrect format"))
            {
                ERROR_MESSAGE.innerText = "Ce n'est pas un token JWT"
            }
            verificationInformation.appendChild(ERROR_MESSAGE)
        }
        verificationStatus.classList.remove("hidden")
    },500)
}

function setValidationIllustration(status)
{
    if(status)
        validationIllustration.src = "images/valid.svg"
    else
    {
        validationIllustration.src = "images/invalid.svg"
    }
}