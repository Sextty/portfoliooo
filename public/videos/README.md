# Demo videos (baked into the deployed site)

Files dropped here are served at `/videos/<filename>` and are visible to **every
visitor on every device** — unlike videos uploaded through the Admin panel, which
live only in the browser that uploaded them (IndexedDB).

## How to publish a demo video so everyone sees it

1. In the Admin panel, upload the video (for local preview) **or** just grab the
   video file directly.
2. Put the file here, e.g. `public/videos/girls-boutique.mp4`.
3. Point the project's `videoUrl` at it — set it to `/videos/girls-boutique.mp4`
   in `src/data/projects.json` (or via the Admin panel's **Export for deploy**
   button, which writes this for you) and bump the `version` field.
4. Commit & push (`git push newrepo master`) — Vercel redeploys and the video is
   live for all devices.

Keep files reasonably small (a few MB) so the git repo and page loads stay light.
For large videos, host on YouTube/Cloudinary and paste that URL as `videoUrl` instead.
