<div align="center">
    <h1 align="center">Welcome to web-scraper πΈοΈ</h1>

    A simple web scraping with Puppeteer in TypeScript

  <p>
    <a>
      <img src="https://img.shields.io/github/package-json/v/lkcozy/code-notes" alt="Current version." />
    </a>
    <a href="#" target="_blank">
        <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg" />
    </a>
       <img src="https://github.com/lkcozy/web-scraper/actions/workflows/codeql.yml/badge.svg" alt="π¨οΈ GitHub CodeQL Scanning" />
        <img src="https://github.com/lkcozy/web-scraper/actions/workflows/checkUpdats.yml/badge.svg?branch=main" alt="π Check Updates" />
        <img src="https://github.com/lkcozy/web-scraper/actions/workflows/airQuality.yml/badge.svg" alt="π Check Air Quality" />
    <a href="https://github.dev/lkcozy/web-scraper" target="_blank">
        <img src="https://img.shields.io/badge/GitHub_Dev-open-blue" alt="Open Code Notes with GitHub Dev" />
    </a>
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

# Your private API token (see aqicn.org/data-platform/token/)
gh secret set AIR_QUALITY_API_TOKEN -b""
gh secret set AIR_QUALITY_CITY_LIST -b"" # a,b,c
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
