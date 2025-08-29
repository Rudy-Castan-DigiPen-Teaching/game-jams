let gAllLevels        = {};
let gCurrentLevelName = null;

function PreLoadLevels()
{
    // localStorage.clear();
    let saved_level_json = localStorage.getItem("levels");
    if (saved_level_json)
    {
        // Use localStorage if it exists
        gAllLevels = JSON.parse(saved_level_json);
    }
    else
    {
        // Only load from start_levels.json if localStorage is empty
        gAllLevels = loadJSON("start_levels.json");
    }
}

function LoadLevels()
{
    console.log(gAllLevels);
    gCurrentLevelName = localStorage.getItem("current_level") || "default";
    // console.log(gAllLevels);
}

function SaveLevels()
{
    localStorage.setItem("levels", JSON.stringify(gAllLevels));
    localStorage.setItem("current_level", gCurrentLevelName || "default");
    console.log("Level saved to local storage.");
}
