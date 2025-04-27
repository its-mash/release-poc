import { Package } from "@manypkg/get-packages";
import { info, warn } from "@changesets/logger";
import * as npmUtils from "./npm-utils";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type PublishedState = "never" | "published" | "only-pre";

type PkgInfo = {
  name: string;
  localVersion: string;
  publishedState: PublishedState;
  publishedVersions: string[];
  packageDir?: string;
};

export type PublishedResult = {
  name: string;
  newVersion: string;
  published: boolean;
};

async function triggerRepositoryDispatch(packagesInfo: PkgInfo[]) {
  const branch = (
    await execAsync("git rev-parse --abbrev-ref HEAD")
  ).stdout.trim();
  const commit = (await execAsync("git rev-parse HEAD")).stdout.trim();

  const payload = {
    event_type: "publish_packages",
    client_payload: {
      packages: packagesInfo.map((pkgInfo) => ({
        packageName: pkgInfo.name,
        packageDir: pkgInfo.packageDir,
        localVersion: pkgInfo.localVersion,
      })),
      branch,
      commit,
    },
  };

  const dispatchRepoOwner = process.env.DISPATCH_REPO_OWNER;
  const dispatchRepoName = process.env.DISPATCH_REPO_NAME;
  const dispatchGithubToken = process.env.DISPATCH_GITHUB_TOKEN;

  if (!dispatchRepoOwner || !dispatchRepoName || !dispatchGithubToken) {
    throw new Error(
      "DISPATCH_REPO_OWNER, DISPATCH_REPO_NAME, or DISPATCH_GITHUB_TOKEN is not set in the environment variables"
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${dispatchRepoOwner}/${dispatchRepoName}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dispatchGithubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to trigger repository dispatch: ${response.status} ${response.statusText}`
    );
  }

  info(`Triggered repository dispatch for ${packagesInfo.length} packages`);
}

export default async function publishPackages({
  packages,
}: {
  packages: Package[];
}) {
  const packagesByName = new Map(packages.map((x) => [x.packageJson.name, x]));
  const publicPackages = packages.filter((pkg) => !pkg.packageJson.private);
  const unpublishedPackagesInfo = await getUnpublishedPackages(publicPackages);

  if (unpublishedPackagesInfo.length === 0) {
    return [];
  }

  const packagesInfo = unpublishedPackagesInfo.map((pkgInfo) => {
    const pkg = packagesByName.get(pkgInfo.name)!;
    return {
      ...pkgInfo,
      packageDir: pkg.dir,
    };
  });

  await triggerRepositoryDispatch(packagesInfo);

  return packagesInfo.map((pkgInfo) => ({
    published: true,
    name: pkgInfo.name,
    newVersion: pkgInfo.localVersion,
  }));
}

async function getUnpublishedPackages(packages: Array<Package>) {
  const results: Array<PkgInfo> = await Promise.all(
    packages.map(async ({ packageJson }) => {
      const response = await npmUtils.infoAllow404(packageJson);
      let publishedState: PublishedState = "never";
      if (response.published) {
        publishedState = "published";
      }

      return {
        name: packageJson.name,
        localVersion: packageJson.version,
        publishedState,
        publishedVersions: response.pkgInfo.versions || [],
      };
    })
  );

  const packagesToPublish: Array<PkgInfo> = [];

  for (const pkgInfo of results) {
    const { name, publishedState, localVersion, publishedVersions } = pkgInfo;
    if (!publishedVersions.includes(localVersion)) {
      packagesToPublish.push(pkgInfo);
      info(
        `${name} is being published because our local version (${localVersion}) has not been published on npm`
      );
    } else {
      // If the local version is behind npm, something is wrong, we warn here, and by not getting published later, it will fail
      warn(
        `${name} is not being published because version ${localVersion} is already published on npm`
      );
    }
  }

  return packagesToPublish;
}
