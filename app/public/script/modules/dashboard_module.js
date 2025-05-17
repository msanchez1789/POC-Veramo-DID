export async function init()
{
    console.log("dashboard loaded")
    fetch("/did/count").then(async (count)=>{
        did_dashboard.querySelector(".counter").innerText= await count.json()
    })
}