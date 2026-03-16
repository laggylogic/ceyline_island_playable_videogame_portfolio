# Deploy Ceyline Land to the web (GitHub Pages)

Your repo can use a workflow that builds and deploys the game. Turn on GitHub Pages and point it at that workflow.

## One-time setup on GitHub

1. **Name your repo** (e.g. `ceyline-land` or `ceyline_island_playable_videogame_portfolio`) so the site is at `https://YOUR_USERNAME.github.io/REPO_NAME/`:
   - Open your repo → **Settings** → under **Repository name** set the name → **Rename**.
   - Update your local remote if needed:  
     `git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git`

2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment**:
   - **Source:** choose **GitHub Actions** (not "Deploy from a branch").
4. Save. Add the workflow from `.github/workflows/deploy-pages.yml` if it isn’t already there.

## Deploy (automatic and manual)

- **Automatic:** Every push to `main` can run the workflow and deploy the latest build.
- **Manual:** **Actions** tab → **Deploy to GitHub Pages** (or your workflow name) → **Run workflow** → **Run workflow**.

## Your live URL

After the first successful run:

**https://YOUR_USERNAME.github.io/REPO_NAME/**

Use your GitHub username and repo name. The `base` in `vite.config.js` must match the repo name (e.g. `base: "/ceyline_island_playable_videogame_portfolio/"`).

## Using a custom domain (optional)

In **Settings** → **Pages**, you can add a custom domain. Then set `base: "/"` in `vite.config.js` and redeploy.
