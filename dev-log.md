# Egypt Roads — dev log

Notes kept so a restart loses nothing. Update this file with every shipped version.

## Build and publish

- `index.html` is generated. `python3 build.py` splices `styles.css` and the 10 module
  scripts (order is in `build.py`) into it; `python3 build.py --check` verifies it is in
  sync. Never edit `index.html` by hand.
- Bump `CACHE` in `sw.js` on every release. Current: `er-v53`.
- Publish: upload `index.html` + any changed module + `sw.js` through the GitHub web
  uploader on a new branch, open the PR, merge, wait ~60 s for Pages, then verify the
  live `sw.js` cache name and that the live `index.html` matches the local build byte
  for byte.
- Never touch `.github/workflows`.

## Map constants (`roam.js`)

- `NB=11` street grid, `PITCH=120`, `sc(i)=(i-NB/2)*PITCH`, street half width `HWN=8`,
  boulevard row `BLV=6` with half width `HWB=15`.
- City bounds and the perimeter wall are `this.bounds`. Buildings and other solid
  footprints go into `this.bl[i*100+j]` through `rects(i,j)`; collision walks the 3x3
  blocks around the player.
- Desert: sand road west from street `j=1` (`sc(1)`) to the pyramids; Nile water strip
  just outside the west wall at x -694..-774; pyramids gate on the far bank at x -812.
- `Geo` is the merged-geometry helper (boxes + quads, vertex colours, one mesh = one
  draw call). Use it for anything repeated.

## Version log

- v45–v49: street name signs, Pyramids road, Giza pyramids + minimap marker, shop fronts.
- v50: standalone Giza desert, sand road, pyramids gate.
- v51: traffic 16 → 20 with a 40% bias to the boulevard row (draw calls 208 → 298).
- v52: traffic concentrated near the player — 16 cars (10 coarse / 6 low), spawn 80–250 m
  from the player, recycle past 330 m, sub-mesh detail LOD at 50 m. Draw calls back to
  ~208.
- v53: Nile bridge (tied arches over the river on the desert road) and two footbridges
  over the boulevard, all merged into 2 meshes (+2 draw calls). Pyramids gate moved to
  the far bank; median trees leave a gap where the footbridges land; footbridge towers
  and stairs got collision rects.

## Performance rules

- Draw calls are the metric that gets checked. Measure the delta of a feature by hiding
  its meshes and re-rendering (`probe.mjs`: reads `renderer.info.render.calls` with the
  meshes on and off).
- A traffic car costs ~12 draw calls. Keep the car count and the LOD radius capped.
- Test at 390x844 (mobile width).

## Next

- v54 curves: gentle S-curves so the grid stops reading as a square grid. Plan: warp the
  world in the vertex shader (`project_vertex` patch), apply the same warp to the camera,
  car/ped positions and the shadow camera centre, tessellate `gnd` / road planes /
  median, set `frustumCulled=false` for cars and peds. Physics and traffic stay on the
  straight grid; the minimap stays a grid (disclosed to the user).
