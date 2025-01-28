const lockJson = require("../package-lock.json");
const fs = require("fs");

lockJson.dependencies["gatsby"].requires["webpack"] = "5.88.1";
fs.writeFileSync("package-lock.json", JSON.stringify(lockJson, null, 2));
