import {
    AuditCard,
    SkillsGraph,
    Header,
    UserCard,
    XPCard,
    XPGraph,
} from "./components.js";

const API_ENDPOINT = "https://zone01normandie.org/api";
const GRAPHQL_ENDPOINT = `${API_ENDPOINT}/graphql-engine/v1/graphql`;
export const TOKEN = "hasura-jwt-token";

const getJWT = () => localStorage.getItem(TOKEN);

export const GraphQLQuery = async (query) =>
    fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getJWT()}`,
        },
        body: JSON.stringify(query),
    })
        .then((resp) => (resp.ok ? resp.json() : null))
        .then(({ data }) => data);
const root = document.getElementById("root");
const form = document.getElementById("login");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const auth = btoa(`${data.username}:${data.password}`);
    fetch(`${API_ENDPOINT}/auth/signin`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            Authorization: `Basic ${auth}`,
        },
    })
        .then((resp) => (resp.ok ? resp.json() : null))
        .then((JWT) => {
            if (!JWT) throw new Error("Invalid username or password");
            localStorage.setItem(TOKEN, JWT);
            return () => JWT;
        })
        .then(loadPage)
        .catch(console.error);
});

async function loadPage(JWT) {
    if (!JWT()) return;
    const user = await GraphQLQuery({
        query: `{
        user { 
        id 
        login 
        campus 
        firstName 
        lastName 
        auditRatio 
        totalUp 
        totalDown 
        transactions(
            order_by: [{ type: desc }, { amount: desc }]
            distinct_on: [type]
            where: {type: { _like: "skill_%" } }
            ) {
            type
            amount
            }
        } }`,
    })
        .then(({ user }) => user[0])
        .catch(console.error);

    if (!user || !user.id || !user.login) return;

    root.innerHTML = `<div class="loading viewport">
        <span class="loader"></span>
    </div>`;

    const header = Header(user);
    const main = document.createElement("main");

    const userDiv = UserCard(user);

    const XP = XPCard(user);
    const audit = AuditCard(user);

    const skills = SkillsGraph(user);

    const XPG = XPGraph();
    XPG.id = "XPGraph";

    main.append(userDiv, XP, audit, skills, XPG);
    root.replaceChildren(header, main);
}

loadPage(getJWT);
