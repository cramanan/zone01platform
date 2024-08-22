import { GraphQLQuery, TOKEN } from "./script.js";
import { formatBytes, Title } from "./utils.js";

export function Header(user) {
    const header = document.createElement("header");
    const username = document.createElement("div");
    const logout = document.createElement("img");
    const gitea = document.createElement("img");
    const a = document.createElement("a");
    const home = document.createElement("a");
    const logo = document.createElement("img");
    const userbox = document.createElement("div");
    const title = document.createElement("h1");

    title.textContent = "Student Platform";
    home.href = "https://zone01normandie.org";
    logo.src = "assets/logo.png";
    logo.height = 50;
    userbox.id = "userbox";
    username.textContent = user.login;
    logout.src = "assets/logout.svg";
    gitea.src = "assets/gitea.svg";
    logout.width = gitea.width = 50;
    logout.className = "logout";
    a.href = `https://zone01normandie.org/git/${user.login}`;
    home.target = a.target = "_blank";

    logout.addEventListener("click", () => {
        localStorage.removeItem(TOKEN);
        location.reload();
    });

    home.appendChild(logo);
    a.appendChild(gitea);
    userbox.append(username, a, logout);
    header.append(home, title, userbox);
    return header;
}

export function XPCard({ courses, id }) {
    if (!courses || !id) return;
    const XP = document.createElement("div");
    const img = document.createElement("img");
    const coursesDiv = document.createElement("div");

    for (const course of courses) {
        GraphQLQuery({
            query: 'query rootEventDetails($userId: Int!, $rootEventId: Int!) {\n xp: transaction_aggregate(\n where: {\n userId: { _eq: $userId }\n type: { _eq: "xp" }\n eventId: { _eq: $rootEventId }\n }\n ) { aggregate { sum { amount } } }\n level: transaction(\n limit: 1\n order_by: { amount: desc }\n where: {\n userId: { _eq: $userId }\n type: { _eq: "level" }\n eventId: { _eq: $rootEventId }\n }\n ) { amount }\n }',

            variables: {
                userId: id,
                rootEventId: course.id,
            },
        }).then((data) => {
            const subdiv = document.createElement("div");
            const path = document.createElement("h3");
            const sum = document.createElement("div");

            subdiv.className = "courses";
            path.textContent = Title(
                course.path
                    .substring(course.path.lastIndexOf("/") + 1)
                    .replaceAll("-", " ")
            );

            sum.textContent = formatBytes(data.xp.aggregate.sum.amount);
            subdiv.append(path, sum);
            coursesDiv.append(subdiv);
        });
    }

    img.src = "assets/xp.svg";
    img.width = 80;
    XP.id = "xp-bar";

    XP.append(img, coursesDiv);

    return XP;
}

export function AuditCard({ auditRatio, totalUp, totalDown }) {
    const div = document.createElement("div");
    const title = document.createElement("h3");
    const up = document.createElement("div");
    const img = document.createElement("img");
    const down = document.createElement("div");
    const ratio = document.createElement("div");

    div.id = "audits";
    title.textContent = "Audits Ratio";
    title.style.gridArea = "1 / 1 / 2 / 4";
    up.style.gridArea = "2 / 1 / 3 / 2";
    img.style.gridArea = "2 / 2 / 3 / 3";
    down.style.gridArea = "2 / 3 / 3 / 4";
    ratio.style.gridArea = "3 / 1 / 4 / 4";
    down.textContent = formatBytes(totalDown);
    up.textContent = formatBytes(totalUp);
    ratio.textContent = Math.round(auditRatio * 10) / 10;
    img.src = "assets/arrowsUpDown.svg";
    div.append(title, down, img, up, ratio);
    return div;
}

export function UserCard({ firstName, lastName }) {
    const div = document.createElement("div");
    div.textContent = `Welcome, ${firstName}${lastName}`.trim();
    return div;
}

export function SkillsGraph({ transactions }) {
    const div = document.createElement("div");

    const skills = transactions.map((tx) => {
        const skillDiv = document.createElement("div");
        const skill = document.createElement("h3");
        skill.textContent = tx.type.replace("skill_", "").toUpperCase();

        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        const bg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        const amount = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        svg.setAttribute("viewBox", "0 0 36 36");
        amount.setAttribute("x", "18");
        amount.setAttribute("y", "20.35");
        amount.textContent = `${tx.amount}%`;
        amount.setAttribute("font-size", "0.5em");
        amount.setAttribute("text-anchor", "middle");

        for (const c of [bg, circle]) {
            c.setAttribute(
                "d",
                "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            );
            c.setAttribute("fill", "none");
            c.setAttribute("stroke-width", "3");
        }

        circle.setAttribute("stroke", "#106efa");
        circle.setAttribute("stroke-dasharray", `${tx.amount} 100`);

        bg.setAttribute("stroke", "#000");

        svg.append(bg, circle, amount);
        skillDiv.append(skill, svg);
        return skillDiv;
    });
    div.id = "skills";
    div.append(...skills);
    return div;
}

export function XPGraph() {}
