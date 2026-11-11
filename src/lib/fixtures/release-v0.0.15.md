## What's Changed

- fix: stop groups inside deleted groups from blocking sync by @nhridoy in https://github.com/nhridoy/shetu-client/pull/11

**Full Changelog**: https://github.com/nhridoy/shetu-client/compare/v0.0.14...v0.0.15

## Install

Files are named by system and CPU. On a Mac, pick `macOS-Apple-Silicon` (M1 and newer) or `macOS-Intel`. On Windows and Linux, pick `x64` (most PCs) or `ARM64`.

The quickest way is one command. It picks the right file for your computer and skips the security warnings below:

- **macOS or Linux** (Terminal):

  ```
  curl -fsSL https://raw.githubusercontent.com/nhridoy/shetu-client/main/install.sh | bash
  ```

  On Debian/Ubuntu it installs the `.deb`. Elsewhere it puts the AppImage at `~/.local/bin/shetu`, which needs `libfuse2` (most distributions have it; otherwise install it with your package manager).
- **Windows** (PowerShell):

  ```
  irm https://raw.githubusercontent.com/nhridoy/shetu-client/main/install.ps1 | iex
  ```

Installing from a downloaded file instead? Shetu isn't signed by Apple or Microsoft yet, so you'll see a warning the first time:

- **macOS** (_"cannot verify that this app is free from malware"_): drag Shetu to Applications and open it once, then go to **System Settings → Privacy & Security** and click **Open Anyway**.
- **Windows** (_"Windows protected your PC"_): click **More info → Run anyway**. If your browser says the file isn't commonly downloaded, choose **Keep**.

You only do this once. In-app updates install without the warning.
