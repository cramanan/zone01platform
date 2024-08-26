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

export function XPCard({ id }) {
    if (!id) return;
    const XP = document.createElement("div");
    const img = document.createElement("img");
    const coursesDiv = document.createElement("div");

    GraphQLQuery({
        query: `query courses($userId: Int!) {
        event(
            where: {
            object: { type: { _in: ["module", "piscine"] } }
            usersRelation : { userId : {_eq : $userId}}
            }
            ) {
                id
                path
            }
        }`,
        variables: {
            userId: id,
        },
    })
        .then(({ event }) => {
            for (const course of event) {
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
        })
        .catch(console.error);

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

export function XPGraph() {
    const div = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const axis = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const points = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let sum = 0;
    const offset = 10;
    let d = `M${offset} ${100 + offset}`;
    const xAxis = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    const yAxis = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );
    svg.setAttribute("viewBox", `0 0 ${100 + 2 * offset} ${100 + 2 * offset}`);
    axis.setAttribute("stroke", "black");

    xAxis.setAttribute("x1", offset);
    xAxis.setAttribute("x2", 100 + offset);
    xAxis.setAttribute("y1", 100 + offset);
    xAxis.setAttribute("y2", 100 + offset);
    yAxis.setAttribute("y1", offset);
    yAxis.setAttribute("y2", 100 + offset);
    yAxis.setAttribute("x1", offset);
    yAxis.setAttribute("x2", offset);

    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "0.5");

    path.setAttribute("fill", "none");

    GraphQLQuery({
        query: `query XPGraph {
  orderedByDate: transaction(
    where: {
      type: { _eq: "xp" }
      _and: [{ path: { _nilike: "%piscine%" } }, { path: { _nilike: "%checkpoint%" } }]
    }
    order_by: { createdAt: asc }
  ) {
    id
    amount
    createdAt
  }
  maxXP: transaction_aggregate(
    where: {
      type: { _eq: "xp" }
      _and: [{ path: { _nilike: "%piscine%" } }, { path: { _nilike: "%checkpoint%" } }]
    }
  ) {
    aggregate {
      sum {
        amount
      }
    }
  }
}`,
    })
        .then(({ orderedByDate, maxXP }) => {
            const maxAmount = maxXP.aggregate.sum.amount;
            const minDate = Date.parse(orderedByDate[0].createdAt);
            const maxDate = Date.parse(
                orderedByDate[orderedByDate.length - 1].createdAt
            );

            for (const element of orderedByDate) {
                const dateDiff =
                    ((Date.parse(element.createdAt) - minDate) /
                        (maxDate - minDate)) *
                    100;

                element.amount = sum += element.amount;
                const XPDiff = (element.amount / maxAmount) * 100;
                const coords = {
                    x: 100 - XPDiff + offset,
                    y: dateDiff + offset,
                };

                d = `${d} L${coords.y} ${coords.x}`;
                path.setAttribute("d", d);
            }
        })
        .catch(console.error);

    axis.append(xAxis, yAxis);
    svg.append(axis, points, path);
    div.append(svg);
    return div;
}
