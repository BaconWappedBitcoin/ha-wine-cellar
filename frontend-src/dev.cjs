const { execSync } = require("child_process");
const path = require("path");

const nodePath = path.dirname(process.execPath);
const env = { ...process.env, PATH: `${nodePath};${process.env.PATH}` };

execSync("npx rollup -c -w", {
  cwd: __dirname,
  env,
  stdio: "inherit",
});
