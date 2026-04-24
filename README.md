<h1 align="center">Navimint</h1>

<p align="center">
  <strong>Desktop app for visualizing screens and navigation flow from source code repositories</strong>
</p>

<p align="center">
  <a href="./README.ja.md"><img src="https://img.shields.io/badge/README-日本語-orange" alt="Japanese README" /></a>
</p>

---

## Overview

Navimint is a desktop application that uses Cursor's TypeScript SDK to analyze a source code repository and visualize its screen list and navigation flow.

Given a user-specified directory, the Cursor TypeScript SDK analyzes the source code and generates `screens.json`. Navimint then uses that `screens.json` to present screen relationships in a visual form.
