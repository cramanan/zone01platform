export const Capitalize = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

export const Title = (string) => string.split(" ").map(Capitalize).join(" ");

export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return "0 B";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
