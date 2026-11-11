# Terra

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: solo developers leaving Termius over price or closed source. Secondary: small teams and self-hosters.

## Product Purpose

A free, MIT-licensed, open-source Termius alternative. A Tauri desktop SSH client (terminals, hosts, SFTP, port forwarding, keys, editor) plus an open-source Go sync server you can run yourself.

## Capabilities and Constraints

Direct client-to-host SSH, no relay. The vault is encrypted on the device (Argon2id, XChaCha20-Poly1305, X25519 for team vaults) before sync. The app requires signing in to a Terra server; the server can see record names, tags and timestamps, but not addresses, usernames, passwords, keys or commands. A hosted "Terra Cloud" is announced as coming soon, with no prices or signup URL.

## Brand Commitments

Raycast-style dark, violet `#8B7CFF` and blue `#5B8CFF` accents, Satoshi + JetBrains Mono, dark theme only. Headline: "SSH, without the subscription." Fair, dated Termius comparison. Zero U+2013 and U+2014 punctuation. Modify terra-web only.

## Stack

Astro 7, React islands, Tailwind v4, MDX, Phosphor icons, Biome, Vitest, pnpm.

## Evidence on Hand

Verified facts and the banned-claims list are in `docs/superpowers/specs/2026-11-11-terra-violet-redesign-design.md`, checked against terra-client v0.0.15 and terra-server v0.0.6. The client README overstates crypto and features; do not copy from it.

## Product Principles

Keep control with the user. Say plainly what the server can see. Show the real workflow without asking for credentials. Make source code one click away.
