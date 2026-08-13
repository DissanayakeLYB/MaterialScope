# LatticeLab — preview run doc

## Reproduce uncommitted artifacts

- This worktree is the main checkout. On a fresh checkout, first run
  `npm install` (Next.js 14.2.35; `node_modules` already present here).
- No `.env*` files exist and none are required.
- **Important:** this environment exports `PORT=0` (random port), so the dev
  server must be started with `PORT=3000` set explicitly to use the project's
  default port (it is free).
- Content lives in `content/` (committed MDX); there is no build-time content
  generation step — frontmatter is parsed at runtime by `lib/content.ts`.

## Run the server

Start it detached (Windows) with PowerShell and capture the printed pid.
stdout and stderr must go to different files:

```powershell
powershell -NoProfile -Command "$env:PORT='3000'; (Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput 'C:\Coding Projects\MaterialScope\.freebuff\preview.log' -RedirectStandardError 'C:\Coding Projects\MaterialScope\.freebuff\preview.log.err' -WindowStyle Hidden -PassThru).Id"
```

Then:

- Confirm the process survived: `powershell -NoProfile -Command "Get-Process -Id <pid>"`
- Wait for `Ready in ...` in the log, then verify
  `http://localhost:3000` answers before registering the preview.
