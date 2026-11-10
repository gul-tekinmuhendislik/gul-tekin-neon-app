// Static (GitHub Pages) build.
// `output: 'export'` cannot include server route handlers, so the build runs in a
// staging copy of the project WITHOUT app/api. The resulting `out/` is copied back.
// The working tree is never modified.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const stage = path.join(os.tmpdir(), 'gul-tekin-static-build');
const stageModules = path.join(stage, 'node_modules');
const skip = ['node_modules', '.next', '.git', 'out', '.static-build', path.join('app', 'api')];

const isSkipped = (src) => {
  const rel = path.relative(root, src);
  return skip.some((s) => rel === s || rel.startsWith(s + path.sep));
};

// The staging node_modules is a link to the real one. Unlink it first, so that a
// recursive delete never follows it into the real dependency folder.
function removeStage() {
  if (!fs.existsSync(stage)) return;
  try {
    if (fs.lstatSync(stageModules).isSymbolicLink()) fs.rmdirSync(stageModules);
  } catch {
    // no link present
  }
  fs.rmSync(stage, { recursive: true, force: true, maxRetries: 5 });
}

removeStage();
fs.mkdirSync(stage, { recursive: true });
let status = 1;
try {
  fs.cpSync(root, stage, { recursive: true, filter: (src) => !isSkipped(src) });

  // Copy static JSON data to public/static-data so client components can fetch them
  const staticDataSrc = path.join(stage, 'data', 'static');
  const staticDataDst = path.join(stage, 'public', 'static-data');
  if (fs.existsSync(staticDataSrc)) {
    fs.mkdirSync(staticDataDst, { recursive: true });
    for (const file of fs.readdirSync(staticDataSrc)) {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(staticDataSrc, file), path.join(staticDataDst, file));
      }
    }
    console.log(`Copied static data files to public/static-data/`);
  }

  fs.symlinkSync(path.join(root, 'node_modules'), stageModules, process.platform === 'win32' ? 'junction' : 'dir');

  const result = spawnSync('npx', ['next', 'build'], { cwd: stage, stdio: 'inherit', shell: true, env: process.env });
  status = result.status ?? 1;
  if (status === 0) {
    const outDir = path.join(root, 'out');
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.cpSync(path.join(stage, 'out'), outDir, { recursive: true });
    console.log(`Static site written to ${outDir}`);
  }
} finally {
  removeStage();
}
process.exit(status);
