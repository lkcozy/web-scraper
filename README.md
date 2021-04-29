# Web Scraper

Simple web scraping with Puppeteer in TypeScript

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

- [Puppeteer](https://github.com/puppeteer/puppeteer)

Puppeteer is a tool to manipulate web page by using headless Chrome.

- [Setting up a typescript project in 2021](https://dev.to/avalon-lab/setting-up-a-typescript-project-in-2021-4cfg)

[Source Code](https://github.com/xiorcal/ts-demo)

This post will describe how to create a project in typescript from scratch. The final project include some basic code, tests, commit hooks to enforce code formatting, automatic tests on push and more
