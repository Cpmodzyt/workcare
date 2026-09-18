package com.example

import android.app.Application
import android.system.Os

class WorkCareApp : Application() {
  companion object {
    init {
      try {
        Os.setenv("LIBGL_ALWAYS_SOFTWARE", "1", true)
        Os.setenv("GALLIUM_DRIVER", "llvmpipe", true)
      } catch (_: Throwable) {}
    }
  }

  override fun onCreate() {
    super.onCreate()
    try {
      Os.setenv("LIBGL_ALWAYS_SOFTWARE", "1", true)
      Os.setenv("GALLIUM_DRIVER", "llvmpipe", true)
      val cache = cacheDir
      java.io.File(cache, "org.chromium.android_webview").deleteRecursively()
    } catch (_: Throwable) {}
  }
}
