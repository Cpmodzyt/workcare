package com.example

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader

class MainActivity : ComponentActivity() {
  companion object {
    init {
      try {
        android.system.Os.setenv("LIBGL_ALWAYS_SOFTWARE", "1", true)
        android.system.Os.setenv("GALLIUM_DRIVER", "llvmpipe", true)
      } catch (_: Throwable) {}
    }
  }

  private var webView: WebView? = null
  private var filePathCallback: ValueCallback<Array<Uri>>? = null

  private val fileChooserLauncher =
    registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      if (filePathCallback != null) {
        val results: Array<Uri>? =
          if (result.resultCode == RESULT_OK && result.data != null) {
            val data = result.data
            val clipData = data?.clipData
            if (clipData != null) {
              Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            } else {
              data?.data?.let { arrayOf(it) }
            }
          } else {
            null
          }
        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
      }
    }

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    val rootLayout = FrameLayout(this).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      setBackgroundColor(Color.parseColor("#080D1A"))
    }

    ViewCompat.setOnApplyWindowInsetsListener(rootLayout) { view, insets ->
      val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
      insets
    }

    // Modern Opening Loading Screen Setup
    val density = resources.displayMetrics.density

    val loadingOverlay = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
      setBackgroundColor(Color.parseColor("#080D1A"))
      isClickable = true
      isFocusable = true
    }

    // 1. App Icon with clean emblem and subtle pulse animation
    val iconSize = (92 * density).toInt()
    val iconView = ImageView(this).apply {
      layoutParams = LinearLayout.LayoutParams(iconSize, iconSize).apply {
        bottomMargin = (20 * density).toInt()
      }
      setImageResource(R.drawable.ic_wc_blue_logo)
      scaleType = ImageView.ScaleType.FIT_CENTER
    }

    val pulseX = ObjectAnimator.ofFloat(iconView, "scaleX", 0.96f, 1.04f).apply {
      duration = 1800
      repeatCount = ValueAnimator.INFINITE
      repeatMode = ValueAnimator.REVERSE
    }
    val pulseY = ObjectAnimator.ofFloat(iconView, "scaleY", 0.96f, 1.04f).apply {
      duration = 1800
      repeatCount = ValueAnimator.INFINITE
      repeatMode = ValueAnimator.REVERSE
    }
    val iconAnimSet = AnimatorSet().apply {
      playTogether(pulseX, pulseY)
      start()
    }

    // 2. App Name
    val titleView = TextView(this).apply {
      text = "Work Care"
      textSize = 28f
      setTextColor(Color.parseColor("#F8FAFC"))
      typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
      letterSpacing = 0.02f
      gravity = Gravity.CENTER
    }

    // Subtitle / Tagline
    val subtitleView = TextView(this).apply {
      text = "Facility Operations & Issue Resolution"
      textSize = 12f
      setTextColor(Color.parseColor("#94A3B8"))
      letterSpacing = 0.04f
      gravity = Gravity.CENTER
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = (6 * density).toInt()
        bottomMargin = (28 * density).toInt()
      }
    }

    // 3. Modern Loading Bar
    val barWidth = (210 * density).toInt()
    val barHeight = (5 * density).toInt()
    val progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
      isIndeterminate = false
      max = 100
      progress = 8
      progressDrawable = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_loading_bar)
      layoutParams = LinearLayout.LayoutParams(barWidth, barHeight).apply {
        bottomMargin = (14 * density).toInt()
      }
    }

    // 4. Status caption
    val statusView = TextView(this).apply {
      text = "Initializing workspace..."
      textSize = 12f
      setTextColor(Color.parseColor("#64748B"))
      gravity = Gravity.CENTER
      letterSpacing = 0.03f
    }

    loadingOverlay.addView(iconView)
    loadingOverlay.addView(titleView)
    loadingOverlay.addView(subtitleView)
    loadingOverlay.addView(progressBar)
    loadingOverlay.addView(statusView)

    val mainHandler = Handler(Looper.getMainLooper())
    var isDismissed = false

    // Animate progress smoothly towards 88%
    val progressAnimator = ObjectAnimator.ofInt(progressBar, "progress", 8, 88).apply {
      duration = 1600
      interpolator = DecelerateInterpolator()
      start()
    }

    mainHandler.postDelayed({
      if (!isDismissed) statusView.text = "Loading system modules..."
    }, 600)
    mainHandler.postDelayed({
      if (!isDismissed) statusView.text = "Connecting secure workspace..."
    }, 1200)

    val startTime = System.currentTimeMillis()
    val minDisplayTime = 1400L

    fun dismissLoadingScreen() {
      if (isDismissed) return
      isDismissed = true
      progressAnimator.cancel()

      // Fill progress bar to 100% then fade out smoothly
      ObjectAnimator.ofInt(progressBar, "progress", progressBar.progress, 100).apply {
        duration = 220
        addListener(object : AnimatorListenerAdapter() {
          override fun onAnimationEnd(animation: Animator) {
            statusView.text = "Ready"
            loadingOverlay.animate()
              .alpha(0f)
              .setDuration(350)
              .withEndAction {
                iconAnimSet.cancel()
                rootLayout.removeView(loadingOverlay)
              }
              .start()
          }
        })
        start()
      }
    }

    fun scheduleDismissal() {
      val elapsed = System.currentTimeMillis() - startTime
      val remaining = if (elapsed < minDisplayTime) minDisplayTime - elapsed else 150L
      mainHandler.postDelayed({
        dismissLoadingScreen()
      }, remaining)
    }

    // Safety timeout so user is never blocked
    mainHandler.postDelayed({
      dismissLoadingScreen()
    }, 3800)

    val assetLoader = WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
      .build()

    val webViewInstance = WebView(this).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      setBackgroundColor(Color.parseColor("#080D1A"))

      try {
        clearCache(true)
      } catch (_: Exception) {}

      settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = true
        databaseEnabled = true
        allowFileAccess = true
        allowContentAccess = true
        @Suppress("DEPRECATION")
        allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        allowUniversalAccessFromFileURLs = true
        mediaPlaybackRequiresUserGesture = false
        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        cacheMode = WebSettings.LOAD_DEFAULT
        useWideViewPort = true
        loadWithOverviewMode = true
      }

      webViewClient = object : WebViewClient() {
        override fun shouldInterceptRequest(
          view: WebView?,
          request: WebResourceRequest?
        ): WebResourceResponse? {
          val url = request?.url ?: return null
          val response = assetLoader.shouldInterceptRequest(url)
          if (response != null) return response
          if (url.host == "appassets.androidplatform.net") {
            return WebResourceResponse("text/plain", "UTF-8", 204, "No Content", emptyMap(), null)
          }
          return null
        }

        override fun shouldOverrideUrlLoading(
          view: WebView?,
          request: WebResourceRequest?
        ): Boolean {
          val url = request?.url?.toString() ?: return false
          if (url.startsWith("https://appassets.androidplatform.net/") ||
              url.startsWith("http://") ||
              url.startsWith("https://")
          ) {
            return false
          }
          return super.shouldOverrideUrlLoading(view, request)
        }

        override fun onPageFinished(view: WebView?, url: String?) {
          super.onPageFinished(view, url)
          scheduleDismissal()
        }

        override fun onReceivedError(
          view: WebView?,
          request: WebResourceRequest?,
          error: android.webkit.WebResourceError?
        ) {
          super.onReceivedError(view, request, error)
          android.util.Log.e("WorkCareWeb", "WebView error: ${error?.description} for ${request?.url}")
        }
      }

      webChromeClient = object : WebChromeClient() {
        override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
          consoleMessage?.let {
            android.util.Log.d("WorkCareWeb", "${it.message()} -- line ${it.lineNumber()} of ${it.sourceId()}")
          }
          return true
        }

        override fun onShowFileChooser(
          webView: WebView?,
          filePathCallback: ValueCallback<Array<Uri>>?,
          fileChooserParams: FileChooserParams?
        ): Boolean {
          if (filePathCallback != null) {
            val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
              type = "*/*"
              putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
            this@MainActivity.filePathCallback?.onReceiveValue(null)
            this@MainActivity.filePathCallback = filePathCallback
            return try {
              fileChooserLauncher.launch(intent)
              true
            } catch (e: Exception) {
              this@MainActivity.filePathCallback = null
              false
            }
          }
          return false
        }
      }

      loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
    }

    this.webView = webViewInstance
    rootLayout.addView(webViewInstance)
    rootLayout.addView(loadingOverlay)
    setContentView(rootLayout)

    onBackPressedDispatcher.addCallback(
      this,
      object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          if (webView?.canGoBack() == true) {
            webView?.goBack()
          } else {
            isEnabled = false
            onBackPressedDispatcher.onBackPressed()
          }
        }
      }
    )
  }
}

@androidx.compose.runtime.Composable
fun Greeting(name: String, modifier: androidx.compose.ui.Modifier = androidx.compose.ui.Modifier) {
  androidx.compose.material3.Text(text = "Hello $name!", modifier = modifier)
}
