const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let menus = [];

app.post("/addMenu", (req, res) => {
  const { name, parent } = req.body;
  const menu = { name, parent };
  menus.push(menu);
  res.json({ success: true, message: "Menu added successfully" });
});

app.get("/getMenus", (req, res) => {
  const organizedMenus = organizeMenus();
  const flattenedMenus = flattenMenus(organizedMenus);
  res.json(flattenedMenus);
});

function organizeMenus() {
  const organizedMenus = [];

  // Find and organize root menus (menus without a parent)
  const rootMenus = menus.filter((menu) => !menu.parent);
  rootMenus.forEach((rootMenu) => {
    const organizedMenu = organizeMenuHierarchy(rootMenu);
    organizedMenus.push(organizedMenu);
  });

  return organizedMenus;
}

function organizeMenuHierarchy(menu) {
  const organizedMenu = { ...menu, children: [] };

  // Find and organize child menus recursively
  const childMenus = menus.filter(
    (childMenu) => childMenu.parent === menu.name
  );
  childMenus.forEach((childMenu) => {
    const organizedChildMenu = organizeMenuHierarchy(childMenu);
    organizedMenu.children.push(organizedChildMenu);
  });

  return organizedMenu;
}

function flattenMenus(organizedMenus) {
  const flattenedMenus = [];

  const flatten = (menu) => {
    flattenedMenus.push(menu);

    // Sort children before flattening
    menu.children.sort((a, b) => a.name.localeCompare(b.name));

    menu.children.forEach((childMenu) => {
      flatten(childMenu);
    });
  };

  // Sort root menus before flattening
  organizedMenus.sort((a, b) => a.name.localeCompare(b.name));

  organizedMenus.forEach((menu) => {
    flatten(menu);
  });

  return flattenedMenus;
}

app.put("/editMenu", (req, res) => {
  const { originalName, updatedName, updatedParent } = req.body;

  const menuIndex = menus.findIndex((menu) => menu.name === originalName);

  if (menuIndex !== -1) {
    menus[menuIndex].name = updatedName;
    menus[menuIndex].parent = updatedParent;
    res.json({ success: true, message: "Menu updated successfully" });
  } else {
    res.status(404).json({ success: false, message: "Menu not found" });
  }
});


app.delete("/deleteMenu/:name", (req, res) => {
  const menuName = req.params.name;

  const deleteMenuRecursive = (menu) => {
    // Recursively delete child menus
    const childMenus = menus.filter(
      (childMenu) => childMenu.parent === menu.name
    );
    childMenus.forEach((childMenu) => deleteMenuRecursive(childMenu));

    // Remove the menu from the main list
    menus = menus.filter((menu) => menu.name !== menuName);
  };

  const menuToDelete = menus.find((menu) => menu.name === menuName);

  if (menuToDelete) {
    deleteMenuRecursive(menuToDelete);
    res.json({
      success: true,
      message: "Menu and its children deleted successfully",
    });
  } else {
    res.status(404).json({ success: false, message: "Menu not found" });
  }
});

// ... (unchanged part) ...

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
