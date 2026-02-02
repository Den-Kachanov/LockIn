// Universal SPA loader
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("visible");
    attachSPAHandlers();
});

async function loadPage(url) {
    const content = document.getElementById("content");
    document.body.classList.remove("visible"); // fade out

    setTimeout(async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch page");

            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const newContent = doc.getElementById("content");
            if (!newContent) throw new Error("No #content found in page");

            content.innerHTML = newContent.innerHTML;
            document.body.classList.add("visible"); // fade in

            attachSPAHandlers(); // reattach link handlers
        } catch (err) {
            console.error("Navigation error:", err);
            content.innerHTML = "<h1>Error loading page</h1>";
        }
    }, 500); // fade duration
}

function attachSPAHandlers() {
    document.querySelectorAll(".smooth-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            loadPage(link.href);
        });
    });
}
