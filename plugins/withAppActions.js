"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const SHORTCUTS_XML = `<?xml version="1.0" encoding="utf-8"?>
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">

  <!-- Log oil change via Gemini: "Log oil change in BikeLog" -->
  <capability android:name="actions.intent.CREATE_REVIEW">
    <intent
      android:action="android.intent.action.VIEW"
      android:targetPackage="com.rinalnamori.bikelog"
      android:targetClass="com.rinalnamori.bikelog.MainActivity">
      <parameter android:name="reviewType" android:key="type" />
    </intent>
    <url-template android:value="bikelog://log/new{?type,miles,cost,description}" />
  </capability>

  <!-- Static shortcuts for common tasks -->
  <shortcut
    android:shortcutId="log_oil_change"
    android:enabled="true"
    android:icon="@mipmap/ic_launcher"
    android:shortcutShortLabel="@string/shortcut_oil_label"
    android:shortcutLongLabel="@string/shortcut_oil_long">
    <intent
      android:action="android.intent.action.VIEW"
      android:data="bikelog://log/new?type=oil" />
    <categories android:name="android.shortcut.conversation" />
  </shortcut>

  <shortcut
    android:shortcutId="log_repair"
    android:enabled="true"
    android:icon="@mipmap/ic_launcher"
    android:shortcutShortLabel="@string/shortcut_repair_label"
    android:shortcutLongLabel="@string/shortcut_repair_long">
    <intent
      android:action="android.intent.action.VIEW"
      android:data="bikelog://log/new?type=repair" />
    <categories android:name="android.shortcut.conversation" />
  </shortcut>

</shortcuts>`;
const STRINGS_ADDITIONS = `
  <string name="shortcut_oil_label">Log Oil Change</string>
  <string name="shortcut_oil_long">Log an oil change in BikeLog</string>
  <string name="shortcut_repair_label">Log Repair</string>
  <string name="shortcut_repair_long">Log a repair in BikeLog</string>`;
const withAppActions = (config) => {
    // Step 1: Write shortcuts.xml
    config = (0, config_plugins_1.withDangerousMod)(config, [
        'android',
        async (cfg) => {
            const resXmlDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
            fs.mkdirSync(resXmlDir, { recursive: true });
            fs.writeFileSync(path.join(resXmlDir, 'shortcuts.xml'), SHORTCUTS_XML, 'utf8');
            const resValuesDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'values');
            const stringsPath = path.join(resValuesDir, 'strings.xml');
            if (fs.existsSync(stringsPath)) {
                let content = fs.readFileSync(stringsPath, 'utf8');
                if (!content.includes('shortcut_oil_label')) {
                    content = content.replace('</resources>', `${STRINGS_ADDITIONS}\n</resources>`);
                    fs.writeFileSync(stringsPath, content, 'utf8');
                }
            }
            return cfg;
        },
    ]);
    // Step 2: Add meta-data to AndroidManifest activity
    config = (0, config_plugins_1.withAndroidManifest)(config, (cfg) => {
        var _a, _b, _c;
        const mainActivity = (_c = (_b = (_a = cfg.modResults.manifest.application) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.activity) === null || _c === void 0 ? void 0 : _c.find((a) => { var _a; return ((_a = a.$) === null || _a === void 0 ? void 0 : _a['android:name']) === '.MainActivity'; });
        if (mainActivity) {
            const act = mainActivity;
            if (!act['meta-data'])
                act['meta-data'] = [];
            const alreadyAdded = act['meta-data'].some((m) => { var _a; return ((_a = m.$) === null || _a === void 0 ? void 0 : _a['android:name']) === 'android.app.shortcuts'; });
            if (!alreadyAdded) {
                act['meta-data'].push({
                    $: {
                        'android:name': 'android.app.shortcuts',
                        'android:resource': '@xml/shortcuts',
                    },
                });
            }
        }
        return cfg;
    });
    return config;
};
exports.default = withAppActions;
