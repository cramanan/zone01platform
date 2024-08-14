const API_ENDPOINT = "https://zone01normandie.org/api";

const root = document.getElementById("root");

const form = document.getElementById("login");

function getJWT() {
    const regex = new RegExp(`(^| )JWT=([^;]+)`);
    const match = document.cookie.match(regex);
    if (match) return match[2];
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    fetch(`${API_ENDPOINT}/auth/signin`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            Authorization: "Basic " + btoa(data.username + ":" + data.password),
        },
    })
        .then((resp) => (resp.ok ? resp.json() : ""))
        .then((jwt) => (document.cookie = `JWT=${jwt};`))
        .then(loadPage)
        .catch(console.error);
});

async function loadPage(JWT) {
    root.innerHTML = ``;
    fetch(`${API_ENDPOINT}/graphql-engine/v1/graphql`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + JWT,
        },
    })
        .then((resp) => (resp.ok ? resp.text() : null))
        .then(console.log);
}
