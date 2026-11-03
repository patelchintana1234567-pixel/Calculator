export interface AndroidCodeFile {
  id: string;
  filename: string;
  path: string;
  language: 'kotlin' | 'xml' | 'groovy';
  description: string;
  required: boolean;
  code: string;
}

export const ANDROID_FILES: AndroidCodeFile[] = [
  {
    id: 'main-activity',
    filename: 'MainActivity.kt',
    path: 'app/src/main/java/com/company/calculatorvault/MainActivity.kt',
    language: 'kotlin',
    description: 'Stealth Calculator UI logic with expression parsing and secret master code (25797=) interception to launch AdminDashboardActivity.',
    required: true,
    code: `package com.company.calculatorvault

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.text.DecimalFormat
import kotlin.math.abs

/**
 * MainActivity - Disguised Calculator Vault
 * 
 * Provides standard calculator functionality to ordinary users.
 * Intercepts the hardcoded master passcode "25797" followed by "="
 * to securely route to the Enterprise Device Policy Controller (DPC)
 * Admin Dashboard without raising suspicion.
 */
class MainActivity : AppCompatActivity(), View.OnClickListener {

    companion object {
        // Master code required to unlock Enterprise DPC Admin Console
        private const val MASTER_VAULT_CODE = "25797"
        private const val MAX_DISPLAY_DIGITS = 12
    }

    private lateinit var tvExpression: TextView
    private lateinit var tvResult: TextView

    // Calculator state
    private var currentInput = StringBuilder()
    private var firstOperand: Double? = null
    private var pendingOperator: String? = null
    private var isNewOperation = true
    private var lastResult: Double = 0.0

    private val decimalFormat = DecimalFormat("#,###.########")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupClickListeners()
    }

    private fun initViews() {
        tvExpression = findViewById(R.id.tvExpression)
        tvResult = findViewById(R.id.tvResult)
        updateDisplay("0", "")
    }

    private fun setupClickListeners() {
        val buttonIds = intArrayOf(
            R.id.btn0, R.id.btn1, R.id.btn2, R.id.btn3, R.id.btn4,
            R.id.btn5, R.id.btn6, R.id.btn7, R.id.btn8, R.id.btn9,
            R.id.btnDot, R.id.btnPlus, R.id.btnMinus, R.id.btnMultiply,
            R.id.btnDivide, R.id.btnPercent, R.id.btnClear, R.id.btnBackspace,
            R.id.btnEquals
        )

        for (id in buttonIds) {
            findViewById<View?>(id)?.setOnClickListener(this)
        }
    }

    override fun onClick(v: View) {
        triggerHapticFeedback()

        when (v.id) {
            R.id.btn0 -> onDigitPressed("0")
            R.id.btn1 -> onDigitPressed("1")
            R.id.btn2 -> onDigitPressed("2")
            R.id.btn3 -> onDigitPressed("3")
            R.id.btn4 -> onDigitPressed("4")
            R.id.btn5 -> onDigitPressed("5")
            R.id.btn6 -> onDigitPressed("6")
            R.id.btn7 -> onDigitPressed("7")
            R.id.btn8 -> onDigitPressed("8")
            R.id.btn9 -> onDigitPressed("9")
            R.id.btnDot -> onDotPressed()
            R.id.btnPlus -> onOperatorPressed("+")
            R.id.btnMinus -> onOperatorPressed("-")
            R.id.btnMultiply -> onOperatorPressed("×")
            R.id.btnDivide -> onOperatorPressed("÷")
            R.id.btnPercent -> onPercentPressed()
            R.id.btnClear -> onClearPressed()
            R.id.btnBackspace -> onBackspacePressed()
            R.id.btnEquals -> onEqualsPressed()
        }
    }

    /**
     * Handles digit input and checks buffer limits.
     */
    private fun onDigitPressed(digit: String) {
        if (isNewOperation) {
            currentInput.clear()
            isNewOperation = false
        }

        if (currentInput.length < MAX_DISPLAY_DIGITS) {
            if (currentInput.toString() == "0") {
                currentInput.clear()
            }
            currentInput.append(digit)
            updateDisplay(currentInput.toString(), getExpressionString())
        }
    }

    /**
     * Handles decimal point input.
     */
    private fun onDotPressed() {
        if (isNewOperation) {
            currentInput.clear()
            currentInput.append("0.")
            isNewOperation = false
        } else if (!currentInput.contains(".")) {
            if (currentInput.isEmpty()) {
                currentInput.append("0.")
            } else {
                currentInput.append(".")
            }
        }
        updateDisplay(currentInput.toString(), getExpressionString())
    }

    /**
     * Handles arithmetic operators (+, -, ×, ÷).
     */
    private fun onOperatorPressed(operator: String) {
        if (currentInput.isNotEmpty()) {
            val currentValue = currentInput.toString().toDoubleOrNull() ?: 0.0

            if (firstOperand == null) {
                firstOperand = currentValue
            } else if (pendingOperator != null && !isNewOperation) {
                firstOperand = calculate(firstOperand!!, currentValue, pendingOperator!!)
            }

            pendingOperator = operator
            isNewOperation = true
            updateDisplay(formatNumber(firstOperand!!), "$firstOperand $operator")
        } else if (firstOperand != null) {
            pendingOperator = operator
            updateDisplay(formatNumber(firstOperand!!), "$firstOperand $operator")
        }
    }

    /**
     * Handles percentage calculation.
     */
    private fun onPercentPressed() {
        if (currentInput.isNotEmpty()) {
            val value = currentInput.toString().toDoubleOrNull() ?: return
            val percentage = value / 100.0
            currentInput.clear()
            currentInput.append(percentage.toString())
            updateDisplay(formatNumber(percentage), getExpressionString())
        }
    }

    /**
     * Critical Interceptor:
     * When user presses '=', verify if current buffer equals MASTER_VAULT_CODE (25797).
     * If matched, intercepts and launches the AdminDashboardActivity.
     * Otherwise, performs standard mathematical evaluation.
     */
    private fun onEqualsPressed() {
        val rawInput = currentInput.toString().trim()

        // 1. MASTER VAULT CODE INTERCEPTION
        if (rawInput == MASTER_VAULT_CODE) {
            // Instantly clear display for stealth
            onClearPressed()

            // Open Admin Dashboard
            val intent = Intent(this, AdminDashboardActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(intent)

            // Optional stealth feedback: quiet double buzz
            triggerAdminUnlockFeedback()
            return
        }

        // 2. STANDARD EVALUATION
        if (firstOperand != null && pendingOperator != null && currentInput.isNotEmpty()) {
            val secondOperand = currentInput.toString().toDoubleOrNull() ?: return
            val fullExpression = "\${formatNumber(firstOperand!!)} $pendingOperator \${formatNumber(secondOperand)} ="
            val result = calculate(firstOperand!!, secondOperand, pendingOperator!!)

            lastResult = result
            firstOperand = null
            pendingOperator = null
            isNewOperation = true
            currentInput.clear()
            currentInput.append(result.toString())

            updateDisplay(formatNumber(result), fullExpression)
        }
    }

    private fun calculate(a: Double, b: Double, op: String): Double {
        return when (op) {
            "+" -> a + b
            "-" -> a - b
            "×" -> a * b
            "÷" -> {
                if (abs(b) < 0.000000001) {
                    Toast.makeText(this, "Cannot divide by zero", Toast.LENGTH_SHORT).show()
                    0.0
                } else {
                    a / b
                }
            }
            else -> b
        }
    }

    private fun onClearPressed() {
        currentInput.clear()
        firstOperand = null
        pendingOperator = null
        isNewOperation = true
        updateDisplay("0", "")
    }

    private fun onBackspacePressed() {
        if (currentInput.isNotEmpty() && !isNewOperation) {
            currentInput.deleteCharAt(currentInput.length - 1)
            if (currentInput.isEmpty()) {
                currentInput.append("0")
                isNewOperation = true
            }
            updateDisplay(currentInput.toString(), getExpressionString())
        }
    }

    private fun getExpressionString(): String {
        return if (firstOperand != null && pendingOperator != null) {
            "\${formatNumber(firstOperand!!)} $pendingOperator"
        } else {
            ""
        }
    }

    private fun updateDisplay(resultText: String, expressionText: String) {
        tvResult.text = resultText
        tvExpression.text = expressionText
    }

    private fun formatNumber(value: Double): String {
        return if (value == value.toLong().toDouble()) {
            String.format("%,d", value.toLong())
        } else {
            decimalFormat.format(value)
        }
    }

    private fun triggerHapticFeedback() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                vibrator?.vibrate(15)
            }
        } catch (_: Exception) {
            // Ignore if vibration permissions or hardware missing
        }
    }

    private fun triggerAdminUnlockFeedback() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                val pattern = longArrayOf(0, 50, 70, 90)
                vibrator?.vibrate(VibrationEffect.createWaveform(pattern, -1))
            }
        } catch (_: Exception) { }
    }
}
`
  },
  {
    id: 'admin-dashboard',
    filename: 'AdminDashboardActivity.kt',
    path: 'app/src/main/java/com/company/calculatorvault/AdminDashboardActivity.kt',
    language: 'kotlin',
    description: 'Enterprise DPC Dashboard activity with toggle switch for Enterprise Lockdown, Device Owner status inspection, restriction audits, and policy enforcement.',
    required: true,
    code: `package com.company.calculatorvault

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Bundle
import android.os.UserManager
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.cardview.widget.CardView

/**
 * AdminDashboardActivity - Private Enterprise DPC Console
 * 
 * Accessible only via master passcode '25797=' entered in MainActivity.
 * Hosts the "Enterprise Lockdown" toggle switch to govern company-owned
 * device restrictions (Factory reset prevention, Account modification lock,
 * and App control protection).
 */
class AdminDashboardActivity : AppCompatActivity() {

    private lateinit var dpm: DevicePolicyManager
    private lateinit var adminComponent: ComponentName

    // UI elements
    private lateinit var switchEnterpriseLockdown: SwitchCompat
    private lateinit var tvDeviceOwnerStatus: TextView
    private lateinit var cardDeviceOwnerWarning: CardView
    private lateinit var tvStatusFactoryReset: TextView
    private lateinit var tvStatusModifyAccounts: TextView
    private lateinit var tvStatusAppsControl: TextView
    private lateinit var btnLockDevice: Button
    private lateinit var btnExitDashboard: Button
    private lateinit var btnAdbInstructions: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_dashboard)

        // Initialize DevicePolicyManager
        dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        adminComponent = SecureDeviceAdmin.getComponentName(this)

        initViews()
        refreshDashboardState()
        setupListeners()
    }

    override fun onResume() {
        super.onResume()
        refreshDashboardState()
    }

    private fun initViews() {
        switchEnterpriseLockdown = findViewById(R.id.switchEnterpriseLockdown)
        tvDeviceOwnerStatus = findViewById(R.id.tvDeviceOwnerStatus)
        cardDeviceOwnerWarning = findViewById(R.id.cardDeviceOwnerWarning)
        tvStatusFactoryReset = findViewById(R.id.tvStatusFactoryReset)
        tvStatusModifyAccounts = findViewById(R.id.tvStatusModifyAccounts)
        tvStatusAppsControl = findViewById(R.id.tvStatusAppsControl)
        btnLockDevice = findViewById(R.id.btnLockDevice)
        btnExitDashboard = findViewById(R.id.btnExitDashboard)
        btnAdbInstructions = findViewById(R.id.btnAdbInstructions)
    }

    private fun setupListeners() {
        // Toggle Enterprise Lockdown Switch
        switchEnterpriseLockdown.setOnCheckedChangeListener { _, isChecked ->
            val isOwner = dpm.isDeviceOwnerApp(packageName)

            if (!isOwner) {
                // Device Owner privileges are mandatory for hard restrictions
                Toast.makeText(
                    this,
                    "Cannot enforce restrictions: App is not provisioned as Device Owner!",
                    Toast.LENGTH_LONG
                ).show()
                // Revert switch visually without re-triggering listener
                switchEnterpriseLockdown.post { switchEnterpriseLockdown.isChecked = false }
                showProvisioningDialog()
                return@setOnCheckedChangeListener
            }

            if (isChecked) {
                // Call Enterprise Lockdown activation
                val success = SecureDeviceAdmin.enableEnterpriseLockdown(this)
                if (success) {
                    Toast.makeText(this, "Enterprise Lockdown ACTIVATED", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "Failed to apply lockdown policies", Toast.LENGTH_SHORT).show()
                }
            } else {
                // Disable Lockdown
                val success = SecureDeviceAdmin.disableEnterpriseLockdown(this)
                if (success) {
                    Toast.makeText(this, "Enterprise Lockdown RELEASED", Toast.LENGTH_SHORT).show()
                }
            }

            refreshDashboardState()
        }

        // Lock Device Now
        btnLockDevice.setOnClickListener {
            if (dpm.isAdminActive(adminComponent)) {
                try {
                    dpm.lockNow()
                } catch (e: SecurityException) {
                    Toast.makeText(this, "Permission denied: \${e.message}", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(this, "Admin receiver not active", Toast.LENGTH_SHORT).show()
            }
        }

        // Show ADB instructions dialog
        btnAdbInstructions.setOnClickListener {
            showProvisioningDialog()
        }

        // Stealth Exit to Calculator
        btnExitDashboard.setOnClickListener {
            finish()
        }
    }

    /**
     * Reads actual DevicePolicyManager / UserManager states and updates UI indicators.
     */
    private fun refreshDashboardState() {
        val isDeviceOwner = dpm.isDeviceOwnerApp(packageName)
        val isAdminActive = dpm.isAdminActive(adminComponent)

        // Update Device Owner status badge
        if (isDeviceOwner) {
            tvDeviceOwnerStatus.text = "PROVISIONED: DEVICE OWNER"
            tvDeviceOwnerStatus.setTextColor(getColor(R.color.status_active))
            cardDeviceOwnerWarning.visibility = View.GONE
            switchEnterpriseLockdown.isEnabled = true
        } else if (isAdminActive) {
            tvDeviceOwnerStatus.text = "ACTIVE ADMIN (NOT DEVICE OWNER)"
            tvDeviceOwnerStatus.setTextColor(getColor(R.color.status_warning))
            cardDeviceOwnerWarning.visibility = View.VISIBLE
            switchEnterpriseLockdown.isEnabled = false
        } else {
            tvDeviceOwnerStatus.text = "NOT PROVISIONED (NO ADMIN PRIVILEGES)"
            tvDeviceOwnerStatus.setTextColor(getColor(R.color.status_error))
            cardDeviceOwnerWarning.visibility = View.VISIBLE
            switchEnterpriseLockdown.isEnabled = false
        }

        // Query active user restrictions directly from UserManager
        val userManager = getSystemService(Context.USER_SERVICE) as UserManager
        val isFactoryResetBlocked = userManager.hasUserRestriction(UserManager.DISALLOW_FACTORY_RESET)
        val isModifyAccountsBlocked = userManager.hasUserRestriction(UserManager.DISALLOW_MODIFY_ACCOUNTS)
        val isAppsControlBlocked = userManager.hasUserRestriction(UserManager.DISALLOW_APPS_CONTROL)

        // Reflect in restriction status labels
        tvStatusFactoryReset.text = if (isFactoryResetBlocked) "ENFORCED (BLOCKED)" else "NOT RESTRICTED"
        tvStatusFactoryReset.setTextColor(if (isFactoryResetBlocked) getColor(R.color.status_active) else getColor(R.color.status_disabled))

        tvStatusModifyAccounts.text = if (isModifyAccountsBlocked) "ENFORCED (BLOCKED)" else "NOT RESTRICTED"
        tvStatusModifyAccounts.setTextColor(if (isModifyAccountsBlocked) getColor(R.color.status_active) else getColor(R.color.status_disabled))

        tvStatusAppsControl.text = if (isAppsControlBlocked) "ENFORCED (BLOCKED)" else "NOT RESTRICTED"
        tvStatusAppsControl.setTextColor(if (isAppsControlBlocked) getColor(R.color.status_active) else getColor(R.color.status_disabled))

        // Set switch state matching all 3 critical policies
        val isFullyLocked = isFactoryResetBlocked && isModifyAccountsBlocked && isAppsControlBlocked
        switchEnterpriseLockdown.isChecked = isFullyLocked
    }

    private fun showProvisioningDialog() {
        val adbCommand = "adb shell dpm set-device-owner com.company.calculatorvault/.SecureDeviceAdmin"
        
        AlertDialog.Builder(this)
            .setTitle("Device Owner Setup (ADB)")
            .setMessage(
                "Company-owned restrictions (DISALLOW_FACTORY_RESET, DISALLOW_MODIFY_ACCOUNTS, DISALLOW_APPS_CONTROL) require Device Owner privileges.\\n\\n" +
                "To provision on an unmanaged device (before any accounts are added):\\n\\n" +
                adbCommand
            )
            .setPositiveButton("OK", null)
            .show()
    }
}
`
  },
  {
    id: 'secure-device-admin',
    filename: 'SecureDeviceAdmin.kt',
    path: 'app/src/main/java/com/company/calculatorvault/SecureDeviceAdmin.kt',
    language: 'kotlin',
    description: 'DeviceAdminReceiver implementation that enforces DISALLOW_FACTORY_RESET, DISALLOW_MODIFY_ACCOUNTS, and DISALLOW_APPS_CONTROL using DevicePolicyManager.',
    required: true,
    code: `package com.company.calculatorvault

import android.app.admin.DeviceAdminReceiver
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.UserHandle
import android.os.UserManager
import android.util.Log
import android.widget.Toast

/**
 * SecureDeviceAdmin - Enterprise Device Policy Controller (DPC)
 * 
 * Inherits from DeviceAdminReceiver. Provides the operational backbone
 * for company-owned device lockdown.
 * 
 * When configured as Device Owner via ADB or QR provisioning, this class
 * enforces critical enterprise restrictions:
 *  1. UserManager.DISALLOW_FACTORY_RESET: Prevents unauthorized hard resets from Settings or Recovery.
 *  2. UserManager.DISALLOW_MODIFY_ACCOUNTS: Blocks adding or removing corporate/personal accounts.
 *  3. UserManager.DISALLOW_APPS_CONTROL: Blocks force-stopping, clearing data, or uninstalling apps via App Info.
 */
class SecureDeviceAdmin : DeviceAdminReceiver() {

    companion object {
        private const val TAG = "SecureDeviceAdmin"

        /**
         * Returns the ComponentName identifying this receiver to the system.
         */
        fun getComponentName(context: Context): ComponentName {
            return ComponentName(context.applicationContext, SecureDeviceAdmin::class.java)
        }

        /**
         * Helper to get DevicePolicyManager service.
         */
        private fun getDpm(context: Context): DevicePolicyManager {
            return context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        }

        /**
         * Checks if the app is currently granted Device Owner status.
         */
        fun isDeviceOwner(context: Context): Boolean {
            val dpm = getDpm(context)
            return dpm.isDeviceOwnerApp(context.packageName)
        }

        /**
         * Checks if the admin receiver is enabled on the device.
         */
        fun isAdminActive(context: Context): Boolean {
            val dpm = getDpm(context)
            return dpm.isAdminActive(getComponentName(context))
        }

        /**
         * Enforces strict Enterprise Lockdown on the company-owned device.
         * 
         * Applies the following user restrictions:
         * - DISALLOW_FACTORY_RESET: Block hard reset through Settings / Recovery
         * - DISALLOW_MODIFY_ACCOUNTS: Block changing or removing enterprise accounts
         * - DISALLOW_APPS_CONTROL: Prevent force-stop, clearing cache, or uninstalling
         * 
         * @param context Application context
         * @return true if successfully applied; false if device owner privileges are missing
         */
        fun enableEnterpriseLockdown(context: Context): Boolean {
            val dpm = getDpm(context)
            val admin = getComponentName(context)

            if (!dpm.isDeviceOwnerApp(context.packageName)) {
                Log.e(TAG, "Cannot enable enterprise lockdown: App is NOT Device Owner.")
                return false
            }

            try {
                // 1. Block hard factory reset (disables Settings -> Reset options)
                dpm.addUserRestriction(admin, UserManager.DISALLOW_FACTORY_RESET)
                Log.i(TAG, "Restriction applied: DISALLOW_FACTORY_RESET")

                // 2. Block modifying or adding user accounts
                dpm.addUserRestriction(admin, UserManager.DISALLOW_MODIFY_ACCOUNTS)
                Log.i(TAG, "Restriction applied: DISALLOW_MODIFY_ACCOUNTS")

                // 3. Prevent force-stopping or uninstalling company apps via App Info
                dpm.addUserRestriction(admin, UserManager.DISALLOW_APPS_CONTROL)
                Log.i(TAG, "Restriction applied: DISALLOW_APPS_CONTROL")

                // Optional Enterprise hardening: block USB file transfer and safe boot
                dpm.addUserRestriction(admin, UserManager.DISALLOW_USB_FILE_TRANSFER)
                dpm.addUserRestriction(admin, UserManager.DISALLOW_SAFE_BOOT)

                // Prevent user from changing date & time to circumvent policies
                dpm.setAutoTimeRequired(admin, true)

                Log.i(TAG, "All Enterprise Lockdown restrictions applied successfully.")
                return true
            } catch (e: SecurityException) {
                Log.e(TAG, "SecurityException enforcing lockdown restrictions: \${e.message}", e)
                return false
            }
        }

        /**
         * Releases the Enterprise Lockdown restrictions.
         */
        fun disableEnterpriseLockdown(context: Context): Boolean {
            val dpm = getDpm(context)
            val admin = getComponentName(context)

            if (!dpm.isDeviceOwnerApp(context.packageName)) {
                Log.e(TAG, "Cannot disable enterprise lockdown: App is NOT Device Owner.")
                return false
            }

            try {
                // Clear the 3 core restrictions
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_FACTORY_RESET)
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_MODIFY_ACCOUNTS)
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_APPS_CONTROL)

                // Clear optional hardening
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_USB_FILE_TRANSFER)
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_SAFE_BOOT)

                Log.i(TAG, "Enterprise Lockdown restrictions cleared.")
                return true
            } catch (e: SecurityException) {
                Log.e(TAG, "SecurityException clearing restrictions: \${e.message}", e)
                return false
            }
        }

        /**
         * Checks whether Enterprise Lockdown is currently active.
         */
        fun isEnterpriseLockdownActive(context: Context): Boolean {
            val userManager = context.getSystemService(Context.USER_SERVICE) as UserManager
            return userManager.hasUserRestriction(UserManager.DISALLOW_FACTORY_RESET) &&
                   userManager.hasUserRestriction(UserManager.DISALLOW_MODIFY_ACCOUNTS) &&
                   userManager.hasUserRestriction(UserManager.DISALLOW_APPS_CONTROL)
        }
    }

    // --- DeviceAdminReceiver Lifecycle Callbacks ---

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.i(TAG, "Device Admin successfully ENABLED.")
        Toast.makeText(context, "Company Device Policy Controller Activated", Toast.LENGTH_SHORT).show()
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Log.w(TAG, "Device Admin has been DISABLED.")
        Toast.makeText(context, "Company Device Policy Controller Deactivated", Toast.LENGTH_SHORT).show()
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence {
        // Warning shown if someone tries to deactivate admin in Settings
        return "WARNING: Disabling Enterprise Device Admin will violate company device policy and alert IT administrators."
    }

    override fun onPasswordFailed(context: Context, intent: Intent, user: UserHandle) {
        super.onPasswordFailed(context, intent, user)
        Log.w(TAG, "Failed device lockscreen unlock attempt detected.")
    }

    override fun onPasswordSucceeded(context: Context, intent: Intent, user: UserHandle) {
        super.onPasswordSucceeded(context, intent, user)
        Log.d(TAG, "Device unlocked successfully.")
    }

    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        super.onProfileProvisioningComplete(context, intent)
        Log.i(TAG, "Enterprise Profile Provisioning Complete.")
        
        // Auto-enforce lockdown upon provisioning
        enableEnterpriseLockdown(context)
    }
}
`
  },
  {
    id: 'android-manifest',
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'System manifest binding the DeviceAdminReceiver with BIND_DEVICE_ADMIN permission and configuring stealth launcher activity.',
    required: true,
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.company.calculatorvault">

    <!-- Permission to trigger tactile feedback on button presses -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Optional permission for enterprise rebooting -->
    <uses-permission android:name="android.permission.REBOOT" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher_calculator"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_calculator_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CalculatorVault">

        <!-- 
            1. MainActivity: Stealth Entry Point
            Presents a genuine calculator icon and title in the launcher.
        -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:windowSoftInputMode="stateAlwaysHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- 
            2. AdminDashboardActivity: Private DPC Console
            Non-exported; accessible only via the master passcode '25797='
            intercepted inside MainActivity.
        -->
        <activity
            android:name=".AdminDashboardActivity"
            android:exported="false"
            android:label="@string/admin_dashboard_title"
            android:parentActivityName=".MainActivity"
            android:theme="@style/Theme.CalculatorVault.Admin" />

        <!-- 
            3. SecureDeviceAdmin: Device Policy Controller Receiver
            Must require android.permission.BIND_DEVICE_ADMIN to prevent
            unauthorized intents from third-party apps.
        -->
        <receiver
            android:name=".SecureDeviceAdmin"
            android:description="@string/device_admin_description"
            android:label="@string/device_admin_label"
            android:permission="android.permission.BIND_DEVICE_ADMIN"
            android:exported="true">
            <meta-data
                android:name="android.app.device_admin"
                android:resource="@xml/device_admin_receiver" />
            <intent-filter>
                <!-- Essential intent filter actions for DPC -->
                <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
                <action android:name="android.app.action.DEVICE_ADMIN_DISABLE_REQUESTED" />
                <action android:name="android.app.action.DEVICE_ADMIN_DISABLED" />
                <action android:name="android.app.action.PROFILE_PROVISIONING_COMPLETE" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
`
  },
  {
    id: 'device-admin-xml',
    filename: 'device_admin_receiver.xml',
    path: 'app/src/main/res/xml/device_admin_receiver.xml',
    language: 'xml',
    description: 'Declares security policy limits required by the DeviceAdminReceiver in AndroidManifest.',
    required: false,
    code: `<?xml version="1.0" encoding="utf-8"?>
<!-- 
    Policy declarations for DeviceAdminReceiver.
    Specifies capabilities requested by the Enterprise DPC.
-->
<device-admin xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-policies>
        <limit-password />
        <watch-login />
        <reset-password />
        <force-lock />
        <wipe-data />
        <expire-password />
        <encrypted-storage />
        <disable-camera />
        <disable-keyguard-features />
    </uses-policies>
</device-admin>
`
  },
  {
    id: 'activity-main-layout',
    filename: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    description: 'XML layout for the Stealth Calculator UI with clean Material 3 design and high-contrast keypad.',
    required: false,
    code: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="#121316"
    android:padding="16dp">

    <!-- Top Display Area -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:gravity="bottom|end"
        android:orientation="vertical"
        android:paddingBottom="16dp">

        <TextView
            android:id="@+id/tvExpression"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text=""
            android:textColor="#8E929E"
            android:textSize="22sp"
            android:fontFamily="sans-serif" />

        <TextView
            android:id="@+id/tvResult"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="0"
            android:textColor="#FFFFFF"
            android:textSize="56sp"
            android:fontFamily="sans-serif-light"
            android:maxLines="1"
            android:ellipsize="start" />
    </LinearLayout>

    <!-- Keypad Grid (Rows 1 to 5) -->
    <!-- Row 1: C, ( ), %, ÷ -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginBottom="12dp">
        <Button android:id="@+id/btnClear" style="@style/CalcButton.Function" android:text="C" />
        <Button android:id="@+id/btnBackspace" style="@style/CalcButton.Function" android:text="⌫" />
        <Button android:id="@+id/btnPercent" style="@style/CalcButton.Function" android:text="%" />
        <Button android:id="@+id/btnDivide" style="@style/CalcButton.Operator" android:text="÷" />
    </LinearLayout>

    <!-- Row 2: 7, 8, 9, × -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginBottom="12dp">
        <Button android:id="@+id/btn7" style="@style/CalcButton.Digit" android:text="7" />
        <Button android:id="@+id/btn8" style="@style/CalcButton.Digit" android:text="8" />
        <Button android:id="@+id/btn9" style="@style/CalcButton.Digit" android:text="9" />
        <Button android:id="@+id/btnMultiply" style="@style/CalcButton.Operator" android:text="×" />
    </LinearLayout>

    <!-- Row 3: 4, 5, 6, - -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginBottom="12dp">
        <Button android:id="@+id/btn4" style="@style/CalcButton.Digit" android:text="4" />
        <Button android:id="@+id/btn5" style="@style/CalcButton.Digit" android:text="5" />
        <Button android:id="@+id/btn6" style="@style/CalcButton.Digit" android:text="6" />
        <Button android:id="@+id/btnMinus" style="@style/CalcButton.Operator" android:text="-" />
    </LinearLayout>

    <!-- Row 4: 1, 2, 3, + -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginBottom="12dp">
        <Button android:id="@+id/btn1" style="@style/CalcButton.Digit" android:text="1" />
        <Button android:id="@+id/btn2" style="@style/CalcButton.Digit" android:text="2" />
        <Button android:id="@+id/btn3" style="@style/CalcButton.Digit" android:text="3" />
        <Button android:id="@+id/btnPlus" style="@style/CalcButton.Operator" android:text="+" />
    </LinearLayout>

    <!-- Row 5: 00, 0, ., = (Secret trigger is 25797 + =) -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginBottom="16dp">
        <Button android:id="@+id/btn0" style="@style/CalcButton.Digit" android:layout_weight="2" android:text="0" />
        <Button android:id="@+id/btnDot" style="@style/CalcButton.Digit" android:text="." />
        <Button android:id="@+id/btnEquals" style="@style/CalcButton.Equals" android:text="=" />
    </LinearLayout>

</LinearLayout>
`
  },
  {
    id: 'activity-admin-layout',
    filename: 'activity_admin_dashboard.xml',
    path: 'app/src/main/res/layout/activity_admin_dashboard.xml',
    language: 'xml',
    description: 'XML layout for the AdminDashboardActivity featuring the Enterprise Lockdown toggle switch, DPM policy badges, and status cards.',
    required: false,
    code: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0F172A"
    android:fillViewport="true">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="20dp">

        <!-- Header -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Enterprise DPC Console"
            android:textColor="#F8FAFC"
            android:textSize="22sp"
            android:fontFamily="sans-serif-medium" />

        <TextView
            android:id="@+id/tvDeviceOwnerStatus"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="CHECKING DEVICE OWNER..."
            android:textColor="#38BDF8"
            android:textSize="12sp"
            android:layout_marginTop="4dp" />

        <!-- Warning Card if not Device Owner -->
        <androidx.cardview.widget.CardView
            android:id="@+id/cardDeviceOwnerWarning"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            app:cardBackgroundColor="#2D1A1E"
            app:cardCornerRadius="10dp"
            app:cardElevation="0dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="16dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Device Owner Privileges Required"
                    android:textColor="#F87171"
                    android:textStyle="bold"
                    android:textSize="14sp" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Android policy restrictions (DISALLOW_FACTORY_RESET, etc.) require this app to be provisioned as Device Owner via ADB before accounts are added."
                    android:textColor="#E2E8F0"
                    android:textSize="12sp"
                    android:layout_marginTop="6dp" />

                <Button
                    android:id="@+id/btnAdbInstructions"
                    android:layout_width="wrap_content"
                    android:layout_height="36dp"
                    android:layout_marginTop="10dp"
                    android:text="View ADB Setup"
                    android:textSize="11sp"
                    android:backgroundTint="#EF4444" />
            </LinearLayout>
        </androidx.cardview.widget.CardView>

        <!-- Main Lockdown Card -->
        <androidx.cardview.widget.CardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="20dp"
            app:cardBackgroundColor="#1E293B"
            app:cardCornerRadius="12dp"
            app:cardElevation="0dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:padding="20dp">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:gravity="center_vertical"
                    android:orientation="horizontal">

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_weight="1"
                        android:orientation="vertical">

                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Enterprise Lockdown"
                            android:textColor="#FFFFFF"
                            android:textSize="17sp"
                            android:textStyle="bold" />

                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Enforces strict company device policies"
                            android:textColor="#94A3B8"
                            android:textSize="12sp"
                            android:layout_marginTop="2dp" />
                    </LinearLayout>

                    <androidx.appcompat.widget.SwitchCompat
                        android:id="@+id/switchEnterpriseLockdown"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content" />
                </LinearLayout>

                <View
                    android:layout_width="match_parent"
                    android:layout_height="1dp"
                    android:background="#334155"
                    android:layout_marginVertical="16dp" />

                <!-- Restriction Item 1 -->
                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:gravity="center_vertical">
                    <TextView
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_weight="1"
                        android:text="DISALLOW_FACTORY_RESET"
                        android:textColor="#CBD5E1"
                        android:textSize="13sp" />
                    <TextView
                        android:id="@+id/tvStatusFactoryReset"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="NOT RESTRICTED"
                        android:textSize="11sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <!-- Restriction Item 2 -->
                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:gravity="center_vertical"
                    android:layout_marginTop="12dp">
                    <TextView
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_weight="1"
                        android:text="DISALLOW_MODIFY_ACCOUNTS"
                        android:textColor="#CBD5E1"
                        android:textSize="13sp" />
                    <TextView
                        android:id="@+id/tvStatusModifyAccounts"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="NOT RESTRICTED"
                        android:textSize="11sp"
                        android:textStyle="bold" />
                </LinearLayout>

                <!-- Restriction Item 3 -->
                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:gravity="center_vertical"
                    android:layout_marginTop="12dp">
                    <TextView
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_weight="1"
                        android:text="DISALLOW_APPS_CONTROL"
                        android:textColor="#CBD5E1"
                        android:textSize="13sp" />
                    <TextView
                        android:id="@+id/tvStatusAppsControl"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="NOT RESTRICTED"
                        android:textSize="11sp"
                        android:textStyle="bold" />
                </LinearLayout>

            </LinearLayout>
        </androidx.cardview.widget.CardView>

        <!-- Action Buttons -->
        <Button
            android:id="@+id/btnLockDevice"
            android:layout_width="match_parent"
            android:layout_height="48dp"
            android:layout_marginTop="20dp"
            android:text="Lock Device Now (dpm.lockNow)"
            android:backgroundTint="#3B82F6" />

        <Button
            android:id="@+id/btnExitDashboard"
            android:layout_width="match_parent"
            android:layout_height="48dp"
            android:layout_marginTop="12dp"
            android:text="Return to Stealth Calculator"
            android:backgroundTint="#334155" />

    </LinearLayout>
</ScrollView>
`
  },
  {
    id: 'build-gradle',
    filename: 'build.gradle.kts (Module: app)',
    path: 'app/build.gradle.kts',
    language: 'groovy',
    description: 'Gradle configuration for Android 14/15 target with AndroidX CardView, Material components, and ViewBinding.',
    required: false,
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.company.calculatorvault"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.company.calculatorvault"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.cardview)
    implementation(libs.androidx.constraintlayout)
}
`
  }
];

export const PROVISIONING_COMMANDS = {
  adbSetOwner: 'adb shell dpm set-device-owner com.company.calculatorvault/.SecureDeviceAdmin',
  adbRemoveOwner: 'adb shell dpm remove-active-admin com.company.calculatorvault/.SecureDeviceAdmin',
  adbVerify: 'adb shell dumpsys device_policy | grep "com.company.calculatorvault"',
  adbListUsers: 'adb shell pm list users',
  installApk: 'adb install -r -t app-debug.apk'
};
