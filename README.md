<div align="center">
    <h1 align="center">Welcome to web-scraper 🕸️</h1>
    A simple web scraping with Puppeteer in TypeScript

  <p>
    <a>
      <img src="https://img.shields.io/github/package-json/v/lkcozy/web-scraper" alt="Current version." />
    </a>
    <a href="#" target="_blank">
        <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg" />
    </a>
        <img src="https://github.com/lkcozy/web-scraper/actions/workflows/pullRequestlog.yml/badge.svg?branch=main" alt="📝 Update Pull Requests Log" />
        <img src="https://github.com/lkcozy/web-scraper/actions/workflows/checkUpdats.yml/badge.svg?branch=main" alt="🔎 Check Updates" />
        <img src="https://github.com/lkcozy/web-scraper/actions/workflows/airQuality.yml/badge.svg" alt="🔎 Check Air Quality" />
    <a href="https://github.dev/lkcozy/web-scraper" target="_blank">
        <img src="https://img.shields.io/badge/GitHub_Dev-open-blue" alt="Open Code Notes with GitHub Dev" />
    </a>
    </a>
   </p>
</div>

## Getting Started

### Install github cli

```zsh
brew install gh
```

### Set github secrets

```zsh
gh secret set EMAIL_USERNAME -b""
gh secret set EMAIL_PASSWORD -b""

# Your private API token (see aqicn.org/data-platform/token/)
gh secret set AIR_QUALITY_API_TOKEN -b""
gh secret set AIR_QUALITY_CITY_LIST -b"" # a,b,c

# https://github.com/KanHarI/gpt-commit-summarizer
gh secret set OPENAI_API_KEY -b""

# https://pirate-weather.apiable.io/products/weather-data
gh secret set PIRATE_WEATHER_API_KEY -b""
```

### Add/Update secrets in workflows accordingly

## Usage

```zsh
yarn install
yarn build
yarn watch
yarn upgrade-interactive # yarn outdated in 1.0
```

## [Test GitHub Actions locally](https://lkcozy.github.io/code-notes/git/github-actions#test-github-actions-locally)

```zsh
brew install act
```

```zsh
act --secret-file act.secrets
```

## Reference

- [gh-action-data-scraping](https://github.com/sw-yx/gh-action-data-scraping): This repo shows how to use github actions to do automated data scraping, with storage in git itself! free git storage and scheduled updates!!!
- [Puppeteer](https://github.com/puppeteer/puppeteer): Puppeteer is a tool to manipulate web page by using headless Chrome.
- [Setting up a typescript project in 2021](https://dev.to/avalon-lab/setting-up-a-typescript-project-in-2021-4cfg): This post will describe how to create a project in typescript from scratch. The final project include some basic code, tests, commit hooks to enforce code formatting, automatic tests on push and more. [Source Code](https://github.com/xiorcal/ts-demo)
- [Automatic Commit Summaries Using OpenAI’s Language Model](https://betterprogramming.pub/leverage-openais-language-model-for-automated-commit-summaries-8181cef30375)

test
