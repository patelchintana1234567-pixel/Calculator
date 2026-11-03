import JSZip from 'jszip';
import { ANDROID_FILES } from '../data/androidFiles';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'README.md',
    `# Android Calculator Vault DPC (Device Policy Controller)

A stealth enterprise Device Policy Controller disguised as a fully functional calculator application.

## Master Code Access
Open the app, enter:
\`25797\` followed by \`=\`
to launch the **AdminDashboardActivity**.

## Device Owner Provisioning via ADB
To enforce strict enterprise restrictions (DISALLOW_FACTORY_RESET, DISALLOW_MODIFY_ACCOUNTS, DISALLOW_APPS_CONTROL), this app must be designated as the Device Owner before any user accounts are added to the device:

\`\`\`bash
# 1. Install debug APK
adb install -r -t app-debug.apk

# 2. Grant Device Owner status
adb shell dpm set-device-owner com.company.calculatorvault/.SecureDeviceAdmin

# 3. Verify
adb shell dumpsys device_policy | grep "com.company.calculatorvault"
\`\`\`
`
  );

  // Add source files
  for (const file of ANDROID_FILES) {
    zip.file(file.path, file.code.trim());
  }

  // Add strings.xml
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Calculator</string>
    <string name="admin_dashboard_title">Enterprise Vault Console</string>
    <string name="device_admin_label">Enterprise Vault DPC</string>
    <string name="device_admin_description">Device Policy Controller for company-owned device lockdown and policy compliance.</string>
</resources>`
  );

  // Add colors.xml
  zip.file(
    'app/src/main/res/values/colors.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="status_active">#10B981</color>
    <color name="status_warning">#F59E0B</color>
    <color name="status_error">#EF4444</color>
    <color name="status_disabled">#64748B</color>
</resources>`
  );

  // Add styles.xml
  zip.file(
    'app/src/main/res/values/styles.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.CalculatorVault" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:statusBarColor">#121316</item>
        <item name="android:navigationBarColor">#121316</item>
    </style>
    <style name="Theme.CalculatorVault.Admin" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">#0F172A</item>
        <item name="android:statusBarColor">#0F172A</item>
    </style>
    <style name="CalcButton">
        <item name="android:layout_width">0dp</item>
        <item name="android:layout_height">64dp</item>
        <item name="android:layout_weight">1</item>
        <item name="android:layout_margin">4dp</item>
        <item name="android:textSize">22sp</item>
        <item name="android:insetTop">0dp</item>
        <item name="android:insetBottom">0dp</item>
    </style>
    <style name="CalcButton.Digit" parent="CalcButton">
        <item name="backgroundTint">#23262F</item>
        <item name="android:textColor">#FFFFFF</item>
    </style>
    <style name="CalcButton.Function" parent="CalcButton">
        <item name="backgroundTint">#353945</item>
        <item name="android:textColor">#777E90</item>
    </style>
    <style name="CalcButton.Operator" parent="CalcButton">
        <item name="backgroundTint">#3772FF</item>
        <item name="android:textColor">#FFFFFF</item>
    </style>
    <style name="CalcButton.Equals" parent="CalcButton">
        <item name="backgroundTint">#10B981</item>
        <item name="android:textColor">#FFFFFF</item>
    </style>
</resources>`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'android-calculator-vault-dpc.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
