import {
    AuditCard,
    SkillsGraph,
    Header,
    UserCard,
    XPCard,
    ProjectsGraph,
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
    const user = {};
    await GraphQLQuery({ query: "{ user { id login } }" })
        .then((data) => {
            user.id = data.user[0].id;
            user.login = data.user[0].login;
        })
        .catch(console.error);

    if (!user || !user.id || !user.login) return;

    root.innerHTML = `<div class="loading viewport">
        <span class="loader"></span>
    </div>`;

    const header = Header(user);
    const main = document.createElement("main");

    const userDiv = document.createElement("div");

    const XP = document.createElement("div");
    const audit = document.createElement("div");

    const skills = document.createElement("div");

    const graph = document.createElement("div");

    GraphQLQuery({
        query: 'query rootEvents($userId: Int!, $campus: String!) {\n event(where: {\n campus: { _eq: $campus }\n usersRelation: { userId: { _eq: $userId} }\n object: { type: { _in: ["module", "piscine"]} }\n }) {\n id\n path\n }\n }',
        variables: { userId: user.id, campus: "rouen" },
    })
        .then(async (data) => {
            if (!data.event) throw new Error("No event found");
            Object.assign(user, { courses: data.event });

            XP.replaceWith(XPCard(user));
            XPGraph(user);
        })
        .catch(console.error);

    GraphQLQuery({
        query: 'query user($userId: Int!) {\n user: user_by_pk(id: $userId) {\n id\n login\n lastName\n firstName\n auditRatio\n totalUp\n totalDown\n transactions (\n order_by: [{ type: desc }, { amount: desc }]\n distinct_on: [type]\n where: { userId: { _eq: $userId }, type: { _like: "skill_%" } },\n )\n { type, amount }\n }\n }',
        variables: { userId: user.id },
    })
        .then((data) => {
            if (!data.user) throw new Error("No user");
            Object.assign(user, data.user);
            skills.replaceWith(SkillsGraph(user));
            audit.replaceWith(AuditCard(user));
            userDiv.replaceWith(UserCard(user));
        })
        .catch(console.error);

    root.replaceChildren(header, main);
    main.append(projects, userDiv, XP, audit, skills);
}

loadPage(getJWT);
