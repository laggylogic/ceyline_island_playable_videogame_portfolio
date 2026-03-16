# Deploy this project to a new GitHub repo

This folder is the full Ceyline Land game. To put it in a new repo and deploy:

## 1. Create a new repo on GitHub

- Go to GitHub and click **New repository**.
- Name it whatever you like (e.g. `ceyline-land`, `ceyline-island`, `2d-game-portfolio`).
- Do **not** add a README, .gitignore, or license (this project already has them).
- Create the repo.

## 2. Point this project at the new repo and push

If this folder is already a git repo (it has a `.git` from the old project), you have two options.

### Option A: Replace the remote and push (keeps history)

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_NEW_REPO_NAME` with your GitHub username and the new repo name.

### Option B: Start fresh (no history from the old repo)

```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit: Ceyline Land"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO_NAME.git
git push -u origin main
```

Again, replace the URL with your new repo.

## 3. Turn on GitHub Pages (optional)

- In the new repo, go to **Settings** > **Pages**.
- Under **Source**, choose **GitHub Actions** (recommended) or **Deploy from a branch**.
- If using Actions, add the workflow from [HOW_TO_DEPLOY.MD](HOW_TO_DEPLOY.MD) (Method 1). Make sure the `base` in `vite.config.js` matches your repo name (e.g. `base: "/ceyline-land"`).

Done. The game is now in its own repo and can be deployed from there.
