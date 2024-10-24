const builder = require("electron-builder");

builder.build({
    config: {
        appId: "electron.rename",
        productName: "electron-app_v1.0.4",
        win: {
            target: {
                target: "zip",
                arch: "x64",
            },
        },
    },
});