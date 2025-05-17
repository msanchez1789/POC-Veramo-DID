function buildModal()
{
    const MODAL_CONTAINER = document.createElement("div")

    MODAL_CONTAINER.classList.add("modalContainer","layoutVertical", "hidden")
    MODAL_CONTAINER.id = "modal"
    MODAL_CONTAINER.close = ()=>{
        MODAL_CONTAINER.classList.add("hidden")
        setTimeout(()=>{MODAL_CONTAINER.remove()},500)
    }
    MODAL_CONTAINER.addEventListener("click",(e)=>{
        if(e.target == MODAL_CONTAINER)
            MODAL_CONTAINER.close()
    })

    const MODAL = document.createElement("div")
    MODAL.classList.add("modal")

    MODAL_CONTAINER.appendChild(MODAL)
    document.body.prepend(MODAL_CONTAINER)
    MODAL_CONTAINER.show = ()=>{
        setTimeout(()=>{MODAL_CONTAINER.classList.remove("hidden")},1)
    }
    MODAL_CONTAINER.modal = MODAL
    return MODAL_CONTAINER
}


