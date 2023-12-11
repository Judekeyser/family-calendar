export default function(doc)
{
    // Handle `date-based-navigation` if provided
    {
        const subDocument = doc["date-based-navigation"];
        const baseElement = document.querySelector("*[data-id=date-based-navigation]");
        if(!subDocument) {
            baseElement.classList.add("nonvisible");
        } else {
            baseElement.classList.remove("nonvisible");
            {
                baseElement.focusdate.value = subDocument["displayed-date"];

                const nextAction = subDocument["next-date"];
                if(nextAction) {
                    baseElement.next.onclick = nextAction;
                    baseElement.next.disabled = false;
                } else {
                    baseElement.next.disabled = true;
                }

                const prevAction = subDocument["previous-date"];
                if(prevAction) {
                    baseElement.previous.onclick = prevAction;
                    baseElement.previous.disabled = false;
                } else {
                    baseElement.previous.disabled = true;
                }
            }
        }
    }
}