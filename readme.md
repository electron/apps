# electron-apps [![Build Status](https://travis-ci.org/electron/electron-apps.svg?branch=master)](https://travis-ci.org/electron/electron-apps)

A collection of apps built on Electron. [electron.atom.io/apps](http://electron.atom.io/apps).

## Adding your app

If you have an Electron application you'd like to see added,
please read the [contributing](contributing.md) doc.

## How it Works

This package is a joint effort between humans and robots.

First, a human adds an app:

```
apps
└── hyper
    ├── hyper-icon.png
    └── hyper.yml
```

The yml file requires just a few fields:

```yml
name: Hyper
description: 'HTML/JS/CSS Terminal'
website: 'https://hyper.is'
repository: 'https://github.com/zeit/hyper'
category: 'Developer Tools'
```

Humans can include other data like `keywords` and `license`, but they're not required to do so.

The human then opens a PR. Tests pass, the PR gets merged. Yay!

Later, a bot comes along and adds more data about the app.

First, the date the app was submitted is inferred from the git history. Humans could provide this metadata, but they shouldn't have to. Let the machines do the work.

```yml
date: 2017-02-15
```

Then, the bot creates resized versions of the app icon:

```
hyper
├── hyper-icon-128.png
├── hyper-icon-32.png
├── hyper-icon-64.png
├── hyper-icon.png
└── hyper.yml
```

Then the bot extracts a color palette from the app icon:

```yml
iconColors: ['#FF0000', '#C54F23', '#DD8833']
```

And it also picks some colors that are "on brand" for use on black or white
backgrounds:

```yml
goodColorOnWhite: '#916E02'
goodColorOnBlack: '#FCCC36'
faintColorOnWhite: 'rgba(80, 0, 0, 0.1)
```

Lastly, the bot commits changes to git, pushes to GitHub, and publishes a new release to npm.

The bot can be extended to collect other useful data, especially if the app has a GitHub repository URL. Some ideas:

- URLs to download to Win/Mac/Linux builds
- READMEs
- Stargazer counts
- Fork counts
- Download counts
- What else?

## License

[MIT](htps://github.com/electron/electron/blob/master/LICENSE)
