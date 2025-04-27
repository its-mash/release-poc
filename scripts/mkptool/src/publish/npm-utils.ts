import { ExitError } from "@changesets/errors";
import { error, info, warn } from "@changesets/logger";
import { PackageJSON } from "@changesets/types";
import pc from "picocolors";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function jsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error("error parsing json:", input);
    }
    throw err;
  }
}

export async function getPackageInfo(packageJson: PackageJSON) {
  info(`npm info ${packageJson.name}`);

  try {
    let { stdout } = await execAsync(`pnpm info ${packageJson.name} --json`);

    // Github package registry returns empty string when calling npm info
    // for a non-existent package instead of a E404
    if (stdout !== "") {
      return jsonParse(stdout);
    }
  } catch (err) {}

  return {
    error: {
      code: "E404",
    },
  };
}

export async function infoAllow404(packageJson: PackageJSON) {
  let pkgInfo = await getPackageInfo(packageJson);
  if (pkgInfo.error?.code === "E404") {
    warn(`Received 404 for npm info ${pc.cyan(`"${packageJson.name}"`)}`);
    return { published: false, pkgInfo: {} };
  }
  if (pkgInfo.error) {
    error(
      `Received an unknown error code: ${
        pkgInfo.error.code
      } for npm info ${pc.cyan(`"${packageJson.name}"`)}`
    );
    error(pkgInfo.error.summary);
    if (pkgInfo.error.detail) error(pkgInfo.error.detail);

    throw new ExitError(1);
  }
  return { published: true, pkgInfo };
}
