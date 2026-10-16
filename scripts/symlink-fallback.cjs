// Windows workaround: `vercel build` (used by @cloudflare/next-on-pages) creates
// symlinks in .vercel/output/functions, which fails with EPERM on Windows
// without Developer Mode. This preload falls back to copying instead.
// Usage: NODE_OPTIONS="--require ./scripts/symlink-fallback.cjs" npm run pages:build
const fs = require("fs");

async function copyTarget(target, linkPath) {
  const resolved = require("path").resolve(require("path").dirname(linkPath), target);
  await fs.promises.cp(resolved, linkPath, { recursive: true, force: true });
}

const origSymlink = fs.promises.symlink;
fs.promises.symlink = async (target, path, type) => {
  try {
    return await origSymlink(target, path, type);
  } catch (e) {
    if (e.code === "EPERM" || e.code === "ENOSYS") return copyTarget(target, path);
    throw e;
  }
};

const origSymlinkCb = fs.symlink;
fs.symlink = (target, path, type, callback) => {
  if (typeof type === "function") { callback = type; type = undefined; }
  origSymlinkCb(target, path, type, (err) => {
    if (err && (err.code === "EPERM" || err.code === "ENOSYS")) {
      copyTarget(target, path).then(() => callback(null), callback);
    } else callback(err);
  });
};

const origSymlinkSync = fs.symlinkSync;
fs.symlinkSync = (target, path, type) => {
  try {
    return origSymlinkSync(target, path, type);
  } catch (e) {
    if (e.code === "EPERM" || e.code === "ENOSYS") {
      const resolved = require("path").resolve(require("path").dirname(path), target);
      return fs.cpSync(resolved, path, { recursive: true, force: true });
    }
    throw e;
  }
};
