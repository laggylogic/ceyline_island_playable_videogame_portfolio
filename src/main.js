import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

// Use Vite base URL so assets load correctly on GitHub Pages
const BASE = import.meta.env.BASE_URL;

k.loadSprite("spritesheet", BASE + "spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 964,
    "walk-down": { from: 964, to: 965, loop: true, speed: 8 },
    "idle-right": 1003,
    "walk-right": { from: 1003, to: 1004, loop: true, speed: 8 },
    "idle-up": 1042,
    "walk-up": { from: 1042, to: 1043, loop: true, speed: 8 },
    "idle-left": 1081,
    "walk-left": { from: 1081, to: 1082, loop: true, speed: 8 },
    // 2-frame “bob” so NPC looks like it’s moving (adjust from/to to match your sheet)
    "npc-bunny": { from: 780, to: 781, loop: true, speed: 4 },
    "npc-ghost": { from: 864, to: 865, loop: true, speed: 4 },
  },
});

k.loadSprite("island_map", BASE + "ceyline_island.png");
k.loadSprite("ceyline_house_map", BASE + "ceyline_house.png");
k.loadSound("bgm", BASE + "background_music.mp3");
k.loadSound("grass_walk", BASE + "grass_walking.m4a");
k.loadSound("door_open", BASE + "door_open.m4a");
k.loadSound("floor_walk", BASE + "floor_walk.m4a");

k.setBackground(k.Color.fromHex("#311047"));

function addPlayer(map, scaleFactor) {
  return k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    k.z(1),
    {
      speed: 125,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);
}

function setupScene(mapData, mapSpriteName, scaleFactor, onEnterhouse = null, onExithouse = null, useExitSpawn = false, dialogueCooldownSeconds = 0) {
  const layers = mapData.layers;
  const map = k.add([k.sprite(mapSpriteName), k.pos(0), k.scale(scaleFactor)]);
  const player = addPlayer(map, scaleFactor);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        if (boundary.width <= 0 || boundary.height <= 0) continue;
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.vel = k.vec2(0, 0);
            if (player.direction === "down") player.play("idle-down");
            else if (player.direction === "up") player.play("idle-up");
            else if (player.direction === "right") player.play("idle-right");
            else player.play("idle-left");
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }
      continue;
    }

    if (layer.name === "enterhouse" && onEnterhouse) {
      for (const obj of layer.objects) {
        const w = obj.width || 24;
        const h = obj.height || 24;
        map.add([
          k.area({ shape: new k.Rect(k.vec2(0), w, h) }),
          k.pos(obj.x, obj.y),
          "enterhouse",
        ]);
      }
      player.onCollide("enterhouse", onEnterhouse);
      continue;
    }

    if (layer.name === "exithouse" && onExithouse) {
      for (const obj of layer.objects) {
        const w = obj.width || 24;
        const h = obj.height || 24;
        map.add([
          k.area({ shape: new k.Rect(k.vec2(0), w, h) }),
          k.pos(obj.x, obj.y),
          "exithouse",
        ]);
      }
      player.onCollide("exithouse", onExithouse);
      continue;
    }

    // Map object names from your "interactables" / object layer to dialogue keys
    const interactableNameMap = {
      bookshelf: "book_shelves",
      bookself: "book_shelves",
      bed: "bed",
      hobby_station: "hobby_station",
      "hobby station": "hobby_station",
    };
    const getDialogueKey = (layerName, obj) => {
      if (layerName === "interactables" && obj.name && interactableNameMap[obj.name] != null)
        return interactableNameMap[obj.name];
      return obj.name;
    };

    if (layer.name === "dialogue_triggers" || layer.name === "interactables") {
      if (dialogueCooldownSeconds > 0 && !window.__dialogueCooldowns) window.__dialogueCooldowns = {};
      for (const obj of layer.objects) {
        const dialogueKey = getDialogueKey(layer.name, obj);
        if (!dialogueKey || !dialogueData[dialogueKey]) continue;
        const w = Math.max(1, obj.width || 16);
        const h = Math.max(1, obj.height || 16);
        map.add([
          k.area({ shape: new k.Rect(k.vec2(0), w, h) }),
          k.pos(obj.x, obj.y),
          dialogueKey,
        ]);
        const triggerName = dialogueKey;
        const triggerX = obj.x;
        const triggerY = obj.y;
        const triggerW = w;
        const triggerH = h;
        const noEngageFromTop = triggerName === "sister";
        player.onCollide(triggerName, () => {
          if (player.isInDialogue) return;
          if (dialogueCooldownSeconds > 0) {
            const now = k.time();
            if (now - (window.__dialogueCooldowns[triggerName] || 0) < dialogueCooldownSeconds) return;
          }
          if (noEngageFromTop) {
            const triggerCenterYWorld = (map.pos.y + (triggerY + triggerH * 0.5)) * scaleFactor;
            const triggerCenterXWorld = (map.pos.x + (triggerX + triggerW * 0.5)) * scaleFactor;
            const fromFront = player.pos.y >= triggerCenterYWorld;
            if (triggerName === "sister") {
              const fromLeft = player.pos.x <= triggerCenterXWorld;
              if (!fromFront && !fromLeft) return;
            } else {
              if (!fromFront) return;
            }
          }
          player.vel = k.vec2(0, 0);
          if (player.direction === "down") player.play("idle-down");
          else if (player.direction === "up") player.play("idle-up");
          else if (player.direction === "right") player.play("idle-right");
          else player.play("idle-left");
          player.isInDialogue = true;
          displayDialogue(dialogueData[triggerName], () => {
            player.isInDialogue = false;
            if (dialogueCooldownSeconds > 0) window.__dialogueCooldowns[triggerName] = k.time();
          });
        });
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      const spawnName = useExitSpawn ? "player_exit" : "player";
      let placed = false;
      for (const entity of layer.objects) {
        if (entity.name === spawnName) {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          placed = true;
          break;
        }
      }
      if (!placed) {
        const fallback = layer.objects.find((e) => e.name === "player");
        if (fallback) {
          player.pos = k.vec2(
            (map.pos.x + fallback.x) * scaleFactor,
            (map.pos.y + fallback.y) * scaleFactor
          );
        }
      }
      k.add(player);
    }
  }

  return { map, player };
}

const STEP_INTERVAL = 0.35;

function addMovementAndCamera(player, options = {}) {
  const onStep = options.onStep;
  let isMoving = false;
  let lastStepTime = 0;

  k.onUpdate(() => {
    if (player.isInDialogue) {
      player.vel = k.vec2(0, 0);
      return;
    }
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
    if (onStep && isMoving) {
      const now = k.time();
      if (lastStepTime === 0 || now - lastStepTime >= STEP_INTERVAL) {
        onStep();
        lastStepTime = now;
      }
    }
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;
    isMoving = true;
    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-right") player.play("walk-right");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-left") player.play("walk-left");
      player.direction = "left";
      return;
    }
  });

  function stopAnims() {
    isMoving = false;
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    if (player.direction === "right") {
      player.play("idle-right");
      return;
    }
    player.play("idle-left");
  }

  k.onMouseRelease(stopAnims);
  k.onKeyRelease(stopAnims);

  k.onKeyDown((key) => {
    const keyMap = [
      k.isKeyDown("right") || k.isKeyDown("d"),
      k.isKeyDown("left") || k.isKeyDown("a"),
      k.isKeyDown("up") || k.isKeyDown("w"),
      k.isKeyDown("down") || k.isKeyDown("s"),
    ];
    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) nbOfKeyPressed++;
    }
    if (nbOfKeyPressed > 1) return;
    if (player.isInDialogue) return;
    if (keyMap[0]) {
      isMoving = true;
      player.flipX = false;
      if (player.curAnim() !== "walk-right") player.play("walk-right");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }
    if (keyMap[1]) {
      isMoving = true;
      player.flipX = false;
      if (player.curAnim() !== "walk-left") player.play("walk-left");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }
    if (keyMap[2]) {
      isMoving = true;
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }
    if (keyMap[3]) {
      isMoving = true;
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
}

k.scene("island", async (opts = {}) => {
  const loadingEl = document.getElementById("loading-screen");
  const tapEl = document.getElementById("tap-to-start");
  if (tapEl) tapEl.style.display = "none";

  const useExitSpawn = opts.useExitSpawn === true;
  const mapData = await (await fetch(BASE + "ceyline_island.json")).json();
  const { player } = setupScene(
    mapData,
    "island_map",
    scaleFactor,
    () => {
      k.play("door_open", { volume: 1 });
      k.go("ceyline_house");
    },
    null,
    useExitSpawn,
    2
  );

  // NPCs: same spritesheet, 2-frame anim so they look like they’re moving
  const npcAnims = {
    welcome_bunny: "npc-bunny",
  };
  const triggersLayer = mapData.layers?.find((l) => l.name === "dialogue_triggers");
  if (triggersLayer) {
    for (const obj of triggersLayer.objects) {
      const anim = npcAnims[obj.name];
      if (!anim) continue;
      const x = (obj.x + (obj.width || 0) / 2) * scaleFactor;
      const y = (obj.y + (obj.height || 0) / 2) * scaleFactor;
      k.add([
        k.sprite("spritesheet", { anim }),
        k.pos(x, y),
        k.anchor("center"),
        k.scale(scaleFactor),
        k.z(0),
      ]);
    }
  }

  setCamScale(k);
  k.onResize(() => setCamScale(k));
  addMovementAndCamera(player, {
    onStep: () => {
      k.play("grass_walk", { volume: 0.7 });
    },
  });

  if (loadingEl) loadingEl.style.display = "none";
  if (!window.__bgmStarted && tapEl) {
    tapEl.style.display = "flex";
    const startBgm = () => {
      window.__bgmStarted = true;
      k.play("bgm", { loop: true, volume: 0.48 });
      tapEl.style.display = "none";
      const gameCanvas = document.getElementById("game");
      const focusCanvas = () => {
        if (gameCanvas) {
          gameCanvas.focus({ preventScroll: true });
        }
      };
      focusCanvas();
      requestAnimationFrame(() => {
        focusCanvas();
        requestAnimationFrame(focusCanvas);
      });
      setTimeout(focusCanvas, 50);
      setTimeout(focusCanvas, 200);
      let focusAttempts = 0;
      const focusUntilActive = k.onUpdate(() => {
        if (!gameCanvas) {
          focusUntilActive.cancel();
          return;
        }
        if (document.activeElement === gameCanvas) {
          focusUntilActive.cancel();
          return;
        }
        focusCanvas();
        focusAttempts++;
        if (focusAttempts > 180) focusUntilActive.cancel();
      });
      document.removeEventListener("mousedown", startBgm);
      document.removeEventListener("touchstart", startBgm);
      document.removeEventListener("keydown", startBgm);
    };
    document.addEventListener("mousedown", startBgm, { once: true });
    document.addEventListener("touchstart", startBgm, { once: true });
    document.addEventListener("keydown", startBgm, { once: true });
  } else if (window.__bgmStarted && tapEl) {
    tapEl.style.display = "none";
    const gameCanvas = document.getElementById("game");
    if (gameCanvas) gameCanvas.focus();
  }
});

k.scene("ceyline_house", async () => {
  const loadingEl = document.getElementById("loading-screen");
  const tapEl = document.getElementById("tap-to-start");
  if (tapEl) tapEl.style.display = "none";

  const mapData = await (await fetch(BASE + "ceyline_house.json")).json();
  const { player } = setupScene(
    mapData,
    "ceyline_house_map",
    scaleFactor,
    null,
    () => {
      k.play("door_open", { volume: 1 });
      k.go("island", { useExitSpawn: true });
    },
    null,
    false,
    0.4
  );

  // Animated NPCs in ceyline_house
  const houseNpcAnims = { ghost: "npc-ghost" };
  const houseTriggers = mapData.layers?.find((l) => l.name === "dialogue_triggers");
  if (houseTriggers) {
    for (const obj of houseTriggers.objects) {
      const anim = houseNpcAnims[obj.name];
      if (!anim) continue;
      const x = (obj.x + (obj.width || 0) / 2) * scaleFactor;
      const y = (obj.y + (obj.height || 0) / 2) * scaleFactor;
      k.add([
        k.sprite("spritesheet", { anim }),
        k.pos(x, y),
        k.anchor("center"),
        k.scale(scaleFactor),
        k.z(0),
      ]);
    }
  }

  setCamScale(k);
  k.onResize(() => setCamScale(k));
  addMovementAndCamera(player, {
    onStep: () => k.play("floor_walk", { volume: 0.7 }),
  });

  if (loadingEl) loadingEl.style.display = "none";
  if (!window.__bgmStarted && tapEl) {
    tapEl.style.display = "flex";
    const startBgm = () => {
      window.__bgmStarted = true;
      k.play("bgm", { loop: true, volume: 0.48 });
      tapEl.style.display = "none";
      const gameCanvas = document.getElementById("game");
      if (gameCanvas) gameCanvas.focus({ preventScroll: true });
      document.removeEventListener("mousedown", startBgm);
      document.removeEventListener("touchstart", startBgm);
      document.removeEventListener("keydown", startBgm);
    };
    document.addEventListener("mousedown", startBgm, { once: true });
    document.addEventListener("touchstart", startBgm, { once: true });
    document.addEventListener("keydown", startBgm, { once: true });
  } else if (window.__bgmStarted && tapEl) {
    tapEl.style.display = "none";
    const gameCanvas = document.getElementById("game");
    if (gameCanvas) gameCanvas.focus();
  }
});

k.go("island");
