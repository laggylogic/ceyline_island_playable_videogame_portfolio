# Ceyline House map – how to update

The house map is defined by **`ceyline_house.json`** (data) and **`ceyline_house.png`** (image). There is no `ceyline_house.js`; the game loads the JSON at runtime.

## Units

- **Map size:** `width` × `height` in **tiles** (here 27×20).
- **Tile size:** 16×16 pixels (`tilewidth`, `tileheight`).
- **All object positions/sizes** in the layers are in **pixels** (same as your image).

## Layers (order matters)

### 1. `spawnpoints`
Where the player appears when entering the house.

- **`player`** – default spawn when entering from the island.
- **`player_exit`** – optional; used when returning from another scene (e.g. exit from house back to island).

Edit `x` and `y` (in pixels) to move the spawn.

### 2. `exithouse`
Invisible zone that triggers going back to the island when the player walks into it.

- **`x`, `y`** – top-left of the zone (pixels).
- **`width`, `height`** – size of the zone (pixels).

Adjust to match the door/exit on your `ceyline_house.png`.

### 3. `dialogue_triggers`
Clickable areas that show dialogue when the player collides with them.

Each object needs:

- **`name`** – must match a key in **`src/constants.js`** → `dialogueData` (e.g. `ceyline_computer`, `ghost`, `sister`, `fridge`, `certificate`, `study_table`, `matcha_station`).
- **`x`, `y`** – position in pixels (top-left).
- **`width`, `height`** – hitbox size in pixels.

To add a new trigger:

1. Add an entry here with a unique `name`.
2. Add that same key and dialogue text in **`src/constants.js`** inside `dialogueData`.
3. If it should use the ghost sprite, add it to `houseNpcAnims` in **`src/main.js`** (ceyline_house scene).

### 4. `interactables` (object layer: bookshelf, bed, hobby station)
Use this layer for your **bookshelf**, **bed**, and **hobby station** objects. The game maps these object names to dialogue:

| Object name in JSON | Dialogue used |
|---------------------|----------------|
| `bookshelf` or `bookself` | `book_shelves` |
| `bed` | `bed` |
| `hobby_station` or `hobby station` | `hobby_station` |

- **`x`, `y`** – position in pixels (top-left).
- **`width`, `height`** – hitbox in pixels.

Update **`x`, `y`, `width`, `height`** to match where you drew the objects in your map editor (e.g. Tiled). If you export from Tiled, copy the object layer into the `interactables` layer in `ceyline_house.json` and use the names above.

### 5. `boundaries`
Walls and obstacles the player cannot walk through. No names needed unless you want a boundary to also show dialogue (then set `name` and add that key to `dialogueData`).

- **`x`, `y`** – top-left (pixels).
- **`width`, `height`** – size (pixels).

Add rectangles to match walls/furniture on your map image.

## Changing the visual map

- Edit **`ceyline_house.png`** (same folder as the project’s other assets, or in `public/` if you serve it from there). Keep the same pixel dimensions or update `width`/`height` in the JSON if you change the map size in tiles.
- With the dev server running, saving the PNG or JSON triggers a full reload so you see updates immediately.

## Quick checklist

| I want to…                    | Do this…                                                                 |
|------------------------------|---------------------------------------------------------------------------|
| Move where the player spawns | Edit `spawnpoints` → `player` → `x`, `y` in `ceyline_house.json`.        |
| Move the exit zone           | Edit `exithouse` → object `x`, `y`, `width`, `height`.                    |
| Add/move a dialogue spot     | Add/edit object in `dialogue_triggers` (or `interactables` for bookshelf/bed/hobby_station) and add key in `constants.js`. |
| Move bookshelf / bed / hobby | Edit the `interactables` layer objects’ `x`, `y`, `width`, `height` in `ceyline_house.json`. |
| Reshape walls / obstacles    | Edit or add rectangles in `boundaries`.                                  |
| Change how the house looks   | Edit `ceyline_house.png` and keep coordinates in JSON in sync if needed.   |
