function getFormFields() {
    const fields = Array.from(
        document.querySelectorAll("input, textarea, select")
    );

    return fields
        .filter((field) => {
            
            if (field.type === "hidden") return false;

            if (field.type === "submit" || field.type === "button") return false;

            if (field.type === "checkbox") return false;

            return true;
        })
        .map((field) => {
            const label =
                field.labels?.[0]?.innerText ||
                field.getAttribute("aria-label") ||
                field.getAttribute("placeholder") ||
                "";

            return {
                tag: field.tagName,
                type: field.type || "",
                name: field.name || "",
                label: label.trim()
            };
        });
}


chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "scanFields") {
        const fields = getFormFields();
        console.log("Detected fields:");
        console.table(fields);
    }
});
