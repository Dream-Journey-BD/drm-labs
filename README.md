<p align="center">
  <img src="public/logo.svg" width="100" height="100" alt="DRM Labs Logo" />
</p>

<h1 align="center">🛡️ DRM Labs</h1>

<p align="center">
  <strong>⚡ Universal ClearKey DRM Packaging Suite 🎬 Multi-Format Video Player 📡 IPTV Playlist Analyzer 🕵️ Real-Time DRM Inspector</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-3b82f6?style=for-the-badge&logo=linux&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-22c55e?style=for-the-badge&logo=node.js&logoColor=white" alt="Node Version" />
  <img src="https://img.shields.io/badge/DRM-W3C%20ClearKey-6366f1?style=for-the-badge&logo=auth0&logoColor=white" alt="ClearKey" />
  <img src="https://img.shields.io/badge/Streaming-MPEG--DASH%20%7C%20HLS-10b981?style=for-the-badge&logo=fastapi&logoColor=white" alt="Streaming" />
  <img src="https://img.shields.io/badge/Player-Media3%20ExoPlayer%20%7C%20Shaka-f59e0b?style=for-the-badge&logo=android&logoColor=white" alt="Players" />
  <img src="https://img.shields.io/badge/License-MIT-64748b?style=for-the-badge" alt="License" />
</p>

---

## 📖 Overview

**DRM Labs** is an all-in-one, developer-first media streaming environment built for packaging, testing, and debugging **W3C ClearKey DRM** protected media. It seamlessly converts raw video files into broadcast-standard encrypted streams ready for playback in **Android Media3 ExoPlayer**, **Smart TVs**, and modern web browsers.

Whether you're developing Android video applications, testing OTT streaming infrastructure, analyzing IPTV channels, or inspecting DRM license transactions, DRM Labs provides a complete, self-hosted toolkit.

---

## ✨ Core Highlights & Capabilities

### 🔐 1. Automated ClearKey DRM Packaging
* 📁 **Any Video Container**: Upload `.mp4`, `.mkv`, `.webm`, `.ts`, or `.mov` containers with automatic FFmpeg normalization.
* 🛡️ **AES-128-CTR Encryption**: Standard 128-bit W3C Common Encryption (CENC) using custom or 1-click randomized Key ID (KID) and Encryption Key.
* 📦 **Dual Manifest Generation**: Simultaneously produces fragmented MP4 (fMP4) streams for **MPEG-DASH (`.mpd`)** and **Apple HLS (`.m3u8`)**.
* ⚙️ **Strict vs Standard DRM**:
  * 🔒 **Strict Mode (`clear_lead=0`)**: 100% encrypted from segment zero — maximum security.
  * ⚡ **Standard Mode (`clear_lead=6`)**: 6 seconds unencrypted introductory lead for instant player startup.
* 🎵 **Flexible Audio Processing**: Pass-through original audio, encode to AAC (Standard / High-Quality), MP3, or remove audio.

### 🎬 2. Universal Multi-Engine Web Player
* ⚡ **Powered by Google Shaka Player**: Instant in-browser decryption and playback of protected DASH and HLS streams.
* 🎛️ **Stream URL Bar**: Direct loading of local DRM streams, remote DASH (`.mpd`), remote HLS (`.m3u8`), and progressive MP4s.
* 🔑 **Live DRM Key Configuration**: Test playback with custom KID:KEY pairs or query the built-in license server.
* 🌐 **CORS & Header Bypasser**: Inject custom `User-Agent`, `Referer`, `Origin`, and `Authorization` headers with our high-speed streaming proxy.

### 📡 3. IPTV & M3U8 Playlist Analyzer
* 📑 **Comprehensive Parsing**: Load remote URL playlists (e.g., GitHub raw, IPTV providers) or local `.m3u` / `.m3u8` files.
* 🏷️ **Direct DRM Directive Detection**: Automatically extracts `#KODIPROP:inputstream.adaptive.license_key` and `#EXTVLCOPT` parameters.
* 🩺 **Live Health & Latency Monitor**: Ping channels in real-time to check HTTP status codes, latency in milliseconds, and content headers.
* 📥 **Clean Filtered Export**: Export healthy online channels into clean, standardized M3U files.

### 🕵️ 4. Real-Time DRM License Inspector
* 🔍 **Live Transaction Feed**: Real-time logging of all incoming DRM license acquisition requests from ExoPlayer, Shaka, or custom clients.
* 📊 **Deep Request Inspection**: Inspect client IP, User-Agent, request timestamp, latency, and exact JSON request body (`kids`).
* 🔁 **1-Click cURL & Replay**: Re-trigger incoming requests directly from the web UI to troubleshoot server responses and latency bottlenecks.

### 📱 5. Production-Ready ExoPlayer Code Generator
* 📋 **Zero-Guesswork Integration**: Generate ready-to-paste Kotlin & Java snippets for Android Media3 ExoPlayer.
* ⚙️ **Multi-Protocol Support**: HTTP License Server, HLS ClearKey `#EXT-X-KEY`, Local Hex Pair, and Base64 Data URI formats.
* 🛡️ **Network Security Config**: Includes `AndroidManifest.xml` cleartext traffic snippets for physical device LAN testing.

---

## ⚡ Quick Start & Local Setup

### 📋 Prerequisites
* 🟢 **Node.js**: `v18.0.0` or higher
* 🎬 **FFmpeg**: Required on system PATH for video transcoding.
  * 🐧 *Ubuntu / Debian*: `sudo apt-get update && sudo apt-get install -y ffmpeg`
  * 🍎 *macOS (Homebrew)*: `brew install ffmpeg`
  * 🪟 *Windows (winget / choco)*: `winget install Gyan.FFmpeg` or `choco install ffmpeg`

### 🚀 1-Minute Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/your-username/drm-labs.git
cd drm-labs

# 2️⃣ Install dependencies
npm install

# 3️⃣ Setup Shaka Packager binary (auto-detects OS & platform)
npm run setup

# 4️⃣ Launch the development server
npm run dev
```

🌐 Open your browser at **`http://localhost:3000`**.

> 💡 **Local Network (LAN) & Mobile Testing**: The app automatically detects your machine's LAN IP and displays it in the header (e.g. `http://192.168.1.100:3000`). Use this address on Android devices connected to the same Wi-Fi.

---

## 📱 Android Media3 / ExoPlayer Integration

To play a protected stream on Android using **AndroidX Media3 ExoPlayer**:

### 📦 1. Gradle Dependencies (`build.gradle.kts`)
```kotlin
dependencies {
    implementation("androidx.media3:media3-exoplayer:1.3.1")
    implementation("androidx.media3:media3-exoplayer-dash:1.3.1")
    implementation("androidx.media3:media3-ui:1.3.1")
}
```

### 💡 2. Kotlin Implementation (`MainActivity.kt`)
```kotlin
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

class MainActivity : AppCompatActivity() {
    private lateinit var player: ExoPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val playerView = findViewById<PlayerView>(R.id.player_view)
        player = ExoPlayer.Builder(this).build()
        playerView.player = player

        // 🛡️ ClearKey DRM Configuration
        val streamUrl = "http://192.168.1.100:3000/streams/<stream-id>/stream.mpd"
        val licenseUrl = "http://192.168.1.100:3000/api/clearkey-license"

        val mediaItem = MediaItem.Builder()
            .setUri(streamUrl)
            .setMimeType(MimeTypes.APPLICATION_MPD)
            .setDrmConfiguration(
                MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID)
                    .setLicenseUri(licenseUrl)
                    .setMultiSession(true)
                    .build()
            )
            .build()

        player.setMediaItem(mediaItem)
        player.prepare()
        player.play()
    }

    override fun onDestroy() {
        super.onDestroy()
        player.release()
    }
}
```

### 🛡️ 3. AndroidManifest Cleartext Configuration (`AndroidManifest.xml`)
When testing over local HTTP (LAN IP without SSL certificate), enable cleartext network traffic:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.drmlabs">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:usesCleartextTraffic="true">
        <!-- Activities -->
    </application>
</manifest>
```

---

## 🛠️ Testing DRM License Server with cURL

ExoPlayer automatically parses the Key ID (KID) from the MPD manifest and issues an HTTP POST request to the license server:

```bash
# 📡 Send license request with Base64URL Key ID
curl -X POST "http://localhost:3000/api/clearkey-license" \
  -H "Content-Type: application/json" \
  -d '{"kids": ["ABEiM0RVZneImaq7zN3u_w"], "type": "temporary"}'
```

### 📄 Standard W3C Response (JWK format):
```json
{
  "keys": [
    {
      "kty": "oct",
      "k": "_-7dzLuqmYh3ZlVEMyIRAA",
      "kid": "ABEiM0RVZneImaq7zN3u_w"
    }
  ],
  "type": "temporary"
}
```

---

## 🔌 REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/streams` | 📋 List all packaged DRM streams with URLs and metadata |
| `POST` | `/api/streams` | 📤 Upload, encode, and encrypt a new video file |
| `DELETE` | `/api/streams/:id` | 🗑️ Delete stream and purge media segment files |
| `POST` | `/api/clearkey-license` | 🔑 Universal W3C ClearKey license acquisition (POST payload `kids`) |
| `GET` | `/api/clearkey-license/:streamId` | 🔑 Stream-specific license endpoint |
| `GET` | `/api/drm/logs` | 🕵️ Retrieve real-time DRM request audit logs |
| `POST` | `/api/proxy/stream` | 🌐 Media stream proxy with custom headers & CORS bypass |
| `POST` | `/api/proxy/fetch-playlist` | 📡 Remote M3U/M3U8 playlist downloader |
| `GET` | `/api/network-info` | 📶 Returns server local router IP for Android testing |

---

## 🚢 Production Deployment & Hosting

### 🏗️ Build & Run
```bash
# 1️⃣ Build optimized client and server bundles
npm run build

# 2️⃣ Start high-performance production server
npm start
```

### 🔄 Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Run DRM Labs as a persistent background daemon
pm2 start dist/server.cjs --name "drm-labs"

# View live logs & monitoring
pm2 logs drm-labs
```

---

## 📂 Project Directory Structure

```text
drm-labs/
├── 📁 bin/              # Shaka Packager standalone binary
├── 📁 db/               # JSON persistent database store
├── 📁 public/
│   ├── 📁 streams/      # Generated DASH (.mpd) & HLS (.m3u8) segments
│   └── 🎨 logo.svg      # DRM Labs brand assets
├── 📁 server/           # Express backend services
│   ├── 📄 packager.ts   # FFmpeg & Shaka Packager orchestration
│   ├── 📄 license.ts    # W3C ClearKey DRM license server
│   ├── 📄 logger.ts     # Real-time DRM transaction audit logger
│   └── 📄 proxy.ts      # CORS streaming & playlist proxy
├── 📁 src/              # React frontend application
│   ├── 📁 components/   # Modular UI panels (Player, M3U, DRM, Docs)
│   └── 📄 App.tsx       # Main layout & router
├── 📁 uploads/          # Temporary raw video upload staging
├── ⚙️ package.json      # Dependencies and scripts
└── 📜 LICENSE           # MIT License
```

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

<p align="center">
  Made with ❤️ for media streaming engineers, OTT developers, and DRM researchers.
</p>
