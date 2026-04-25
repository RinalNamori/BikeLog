import { ConfigPlugin, withAndroidManifest, withDangerousMod } from 'expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

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

const withAppActions: ConfigPlugin = (config) => {
  config = withDangerousMod(config, [
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

  config = withAndroidManifest(config, (cfg) => {
    const mainActivity = cfg.modResults.manifest.application?.[0]?.activity?.find(
      (a: any) => a.$?.['android:name'] === '.MainActivity'
    );
    if (mainActivity) {
      const act = mainActivity as any;
      if (!act['meta-data']) act['meta-data'] = [];
      const alreadyAdded = (act['meta-data'] as any[]).some(
        (m: any) => m.$?.['android:name'] === 'android.app.shortcuts'
      );
      if (!alreadyAdded) {
        (act['meta-data'] as any[]).push({
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

export default withAppActions;
