package io.github.einzglozz.stickmansiege;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import org.json.JSONObject;

/** Offline game shell. The HTTPS origin is served entirely from bundled assets. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/index.html";
    private static final int IMPORT_SAVE = 41;
    private static final int EXPORT_SAVE = 42;
    private static final Set<String> FILES = new HashSet<>(Arrays.asList(
        "index.html", "core.js", "game.js", "style.css", "icon.svg", "icon-192.png",
        "icon-512.png", "manifest.webmanifest"));
    private WebView game;
    private ValueCallback<Uri[]> fileCallback;
    private byte[] exportBytes;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(8, 15, 29));
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        settings.setUseWideViewPort(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Only user-selected SAF documents for save import.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        game.setWebViewClient(new LocalAssets());
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*"); // The game validates JSON format and size before import.
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try { startActivityForResult(intent, IMPORT_SAVE); }
                catch (RuntimeException error) {
                    fileCallback.onReceiveValue(null); fileCallback = null;
                    message("Auf diesem Gerät ist keine Dateiauswahl verfügbar.");
                }
                return true;
            }
        });
        game.addJavascriptInterface(new BackupBridge(), "SiegeAndroid");
        setContentView(game);
        fullScreen();
        game.loadUrl(START_URL);
    }

    private static boolean local(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
            && uri.getPort() == -1 && uri.getUserInfo() == null;
    }

    private static String mime(String file) {
        if (file.endsWith(".html")) return "text/html";
        if (file.endsWith(".js")) return "application/javascript";
        if (file.endsWith(".css")) return "text/css";
        if (file.endsWith(".png")) return "image/png";
        if (file.endsWith(".svg")) return "image/svg+xml";
        return "application/manifest+json";
    }

    private final class LocalAssets extends WebViewClient {
        @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return !local(request.getUrl()) || !"/assets/index.html".equals(request.getUrl().getPath());
        }
        @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String path = uri.getPath();
            if (local(uri) && "GET".equals(request.getMethod()) && path != null && path.startsWith("/assets/")) {
                String file = path.substring("/assets/".length());
                if (FILES.contains(file)) {
                    try {
                        InputStream stream = getAssets().open("www/" + file);
                        return new WebResourceResponse(mime(file), "UTF-8", 200, "OK",
                            Collections.singletonMap("Cache-Control", "no-cache"), stream);
                    } catch (IOException ignored) { }
                }
            }
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
        }
    }

    public final class BackupBridge {
        @JavascriptInterface public void saveBackup(String json) {
            if (json == null || json.length() > 1024 * 1024) return;
            final byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            if (bytes.length > 1024 * 1024) return;
            try {
                JSONObject backup = new JSONObject(json);
                if (!"stickman-siege-save".equals(backup.optString("format"))
                    || backup.optInt("version") != 1 || backup.optJSONObject("save") == null) return;
            } catch (Exception invalid) { return; }
            runOnUiThread(() -> {
                if (isFinishing() || game == null || !START_URL.equals(game.getUrl())) return;
                exportBytes = bytes;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                String date = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).format(new Date());
                intent.putExtra(Intent.EXTRA_TITLE, "Stickman-Siege-Spielstand-" + date + ".json");
                try { startActivityForResult(intent, EXPORT_SAVE); }
                catch (RuntimeException error) { exportBytes = null; message("Sicherung konnte nicht geöffnet werden."); }
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == IMPORT_SAVE && fileCallback != null) {
            Uri uri = result == RESULT_OK && data != null ? data.getData() : null;
            if (uri != null && !"content".equals(uri.getScheme())) {
                uri = null; message("Bitte eine Datei über die Android-Dokumentauswahl wählen.");
            }
            fileCallback.onReceiveValue(uri == null ? null : new Uri[]{uri});
            fileCallback = null;
        } else if (request == EXPORT_SAVE) {
            if (result == RESULT_OK && data != null && data.getData() != null
                && "content".equals(data.getData().getScheme()) && exportBytes != null) {
                try (OutputStream stream = getContentResolver().openOutputStream(data.getData(), "wt")) {
                    if (stream == null) throw new IOException("No output stream");
                    stream.write(exportBytes);
                    message("Spielstand-Sicherung gespeichert.");
                } catch (IOException | SecurityException error) { message("Die Sicherung konnte nicht geschrieben werden."); }
            }
            exportBytes = null;
        }
    }

    @Override protected void onPause() {
        if (game != null) {
            game.evaluateJavascript("window.dispatchEvent(new Event('blur'));", null);
            game.onPause(); game.pauseTimers();
        }
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (game != null) { game.onResume(); game.resumeTimers(); }
        fullScreen();
    }
    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) fullScreen();
    }
    @Override public void onBackPressed() {
        game.evaluateJavascript("window.dispatchEvent(new Event('blur'));", null);
        new AlertDialog.Builder(this).setTitle("Spiel schließen?")
            .setMessage("Dein normaler Fortschritt bleibt gespeichert. Ein laufender Endloslauf endet.")
            .setNegativeButton("Im Spiel bleiben", (dialog, which) -> fullScreen())
            .setPositiveButton("Schließen", (dialog, which) -> finish()).show();
    }
    @Override protected void onDestroy() {
        if (fileCallback != null) { fileCallback.onReceiveValue(null); fileCallback = null; }
        if (game != null) { game.removeJavascriptInterface("SiegeAndroid"); game.destroy(); game = null; }
        super.onDestroy();
    }
    private void fullScreen() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }
    private void message(String text) { Toast.makeText(this, text, Toast.LENGTH_LONG).show(); }
}
