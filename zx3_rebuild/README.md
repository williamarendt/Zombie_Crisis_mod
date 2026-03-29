# ZX3 Rebuild Prototype

## Run

Open `index.html` in browser.

If local file policy causes issues, run a local static server in this folder, for example:

```powershell
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Current state

- Beige ground + white wall style map
- WASD movement
- Wall collision
- Player + zombie blocky pseudo-3D models with 8-direction facing
- Zombie chase AI (flow-field pathing + anti-stuck wander)
- Player HP, zombie melee damage, respawn invincibility, passive regen
- Zombie separation collision (zombies do not overlap)
- Weapon slot framework (press `1` for pistol)
- Pistol shooting: mouse aim, LMB/Space fire, projectile beam, 1 ricochet, ammo in HUD
