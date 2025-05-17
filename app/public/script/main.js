document.querySelectorAll("nav button").forEach((button)=>{
	button.addEventListener("click",async ()=>{
		const CONTENT_NAME = button.getAttribute("data-fetch")
		if(CONTENT_NAME != actualContent)
		{
			setActive(button, CONTENT_NAME)
		}
	})
})
function setActive(button, contentName)
{
	document.querySelector("nav .active")?.classList.remove("active")
	button.classList.add("active")
	actualContent = contentName
	loadModule(contentName)
}
async function loadModule(moduleName)
{
	currentModule = undefined
	mainContent.innerHTML = await loadModuleContent(moduleName)
	currentModule = await loadModuleScript(moduleName)
	if(currentModule)
		currentModule.init()
}
async function loadModuleScript(moduleName)
{
	try
	{
		return await import(`./modules/${moduleName}_module.js`)
	}
	catch(err)
	{
		//Ignore
	}
}
async function loadModuleContent(moduleName)
{
	try
	{
		return await (await fetch(`/modules/${moduleName}.ejs`)).text()
	}
	catch(err)
	{
		console.log(err)
	}
}
let actualContent = "did"
setActive(document.querySelector(`button[data-fetch='${actualContent}']`),actualContent)


