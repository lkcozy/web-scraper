<div align="center">
    <h1 align="center">Welcome to web-scraper 🕸️</h1>

    A simple web scraping with Puppeteer in TypeScript

  <p>
    <a>
      <img src="https://img.shields.io/github/package-json/v/lkcozy/code-notes" alt="Current version." />
    </a>
    <a href="#" target="_blank">
        <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg" />
    </a>
        <img src="https://github.com/lkcozy/web-scraper/actions/workflows/checkUpdats.yml/badge.svg?branch=main" alt="🔎 Check Updates" />
    <a href="https://github1s.com/lkcozy/web-scraper" target="_blank">
        <img src="https://img.shields.io/badge/Github1s-open-blue" alt="Open Code Notes with github1s" />
    </a>
   </p>
</div>

## Getting Started

Install github cli

```sh
brew install gh
```

Set github secrets

```sh
gh secret set EMAIL_USERNAME -b"lkklcozy@gmail.com"
gh secret set EMAIL_PASSWORD -b""
```

Usage

```sh
yarn install
yarn watch
```

[Test GitHub Actions locally](https://lkcozy.github.io/code-notes/git/github-actions#test-github-actions-locally)

```sh
brew install act
```

```sh
act --secret-file act.secrets
```

## Reference

- [gh-action-data-scraping](https://github.com/sw-yx/gh-action-data-scraping)

This repo shows how to use github actions to do automated data scraping, with storage in git itself! free git storage and scheduled updates!!!


- [Puppeteer](https://github.com/puppeteer/puppeteer): Puppeteer is a tool to manipulate web page by using headless Chrome.

- [Setting up a typescript project in 2021](https://dev.to/avalon-lab/setting-up-a-typescript-project-in-2021-4cfg): This post will describe how to create a project in typescript from scratch. The final project include some basic code, tests, commit hooks to enforce code formatting, automatic tests on push and more. [Source Code](https://github.com/xiorcal/ts-demo)
