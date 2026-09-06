package com.jooble.jooble_app

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.jooble.app/native_channel"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "getNativePerformanceInfo" -> {
                    val info = mapOf(
                        "platform" to "Android Native Kotlin",
                        "sdkInt" to Build.VERSION.SDK_INT,
                        "device" to Build.MODEL,
                        "highRefreshRateSupported" to true
                    )
                    result.success(info)
                }
                else -> result.notImplemented()
            }
        }
    }
}
