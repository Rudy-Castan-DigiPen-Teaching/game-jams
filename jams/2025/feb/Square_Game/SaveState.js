let gStartingLevels = {};
let gCachedLevels = {};
let gAllLevels = {};
let gCurrentLevelName = null;

function PreLoadLevels() {
  // localStorage.clear();
  gStartingLevels = loadJSON("start_levels.json");
  let saved_level_json = localStorage.getItem("levels");
  if (saved_level_json) gCachedLevels = JSON.parse(saved_level_json);
  else gCachedLevels = {};
}

function LoadLevels() {
  console.log(gStartingLevels);
  gAllLevels = { ...gStartingLevels, ...gCachedLevels };
  gCurrentLevelName = localStorage.getItem("current_level") || "default";
  // console.log(gAllLevels);
}

function SaveLevels() {
  localStorage.setItem("levels", JSON.stringify(gAllLevels));
  localStorage.setItem("current_level", gCurrentLevelName || "default");
  console.log("Level saved to local storage.");
}
