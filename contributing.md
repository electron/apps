# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

This project adheres to the Contributor Covenant [code of conduct](https://github.com/electron/electron/blob/master/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable
behavior to electron@github.com.

The following is a set of guidelines for contributing to `electron-apps`.
These are just guidelines, not rules. Use your best judgment and feel free to
propose changes to this document in a pull request.

## Contents

* [Adding your app](#adding-your-app)
  + [Using the wizard 🔮](#using-the-wizard-)
  + [Adding your app by hand 💪](#adding-your-app-by-hand-)
  + [YML File Rules](#yml-file-rules)
  + [Categories](#categories)
  + [Screenshots](#screenshots)
  + [Colors](#colors)
  + [Icons](#icons)
  + [Locales](#locales)
  + [Company Logos and Names](#company-logos-and-names)
  + [Submission Guidelines](#submission-guidelines)
* [Removing or Disabling Apps](#removing-or-disabling-apps)
* [Development](#development)
* [Testing](#testing)

## Adding your app

If you have an Electron application you'd like to see added, please
[open a pull request](https://help.github.com/articles/creating-a-pull-request/)!
All that's required is a basic YML file and a PNG icon.

### Using the wizard 🔮

This repository has a CLI wizard much like `npm init` that you can use to generate
a YML datafile for your app. To use the wizard,
[fork and clone this repository](https://help.github.com/articles/fork-a-repo/),
then run:

```sh
git clone https://github.com/electron/electron-apps
cd electron-apps
npm install && npm run wizard
```

### Adding your app by hand 💪

Another easy way to add a new app is to copy an existing app and edit its metadata.

To do so, create a new directory in the `apps` directory and include a `.yml`
file and `.png` icon file. The directory can only contain numbers,
lowercase letters, and dashes, and the yml and icon files should be named
like so:

```
apps
└── my-cool-app
    ├── my-cool-app-icon.png
    └── my-cool-app.yml
```

### YML File Rules

- `name` is required.
- `description` is required.
- `website` is required, and must be a fully-qualified URL.
- `repository` is optional, but must be a fully-qualified URL if provided.
- `keywords` is optional, but should be an array if provided.
- `license` is optional.
- `homebrewCaskName` can be specified if your app is on [homebrew cask](https://caskroom.github.io).
- `snapcraftName` can be specified if your app is on [snapcraft](https://snapcraft.io/).
- `npmPackageName` can be specified if your app is on [npm](https://npmjs.org/).
- `youtube_video_url` is optional, but must be a fully-qualified URL if provided.
- No fields should be left blank.

### Categories

`category` is required and must be one of the following values:

* Books
* Business
* Catalogs
* Developer Tools
* Education
* Entertainment
* Finance
* Food & Drink
* Games
* Health & Fitness
* Graphics & Design
* Lifestyle
* Kids
* Magazines & Newspapers
* Medical
* Music
* Navigation
* News
* Photo & Video
* Productivity
* Reference
* Shopping
* Social Networking
* Sports
* Travel
* Utilities

### Screenshots

Screenshots are optional, but must be _https_ and should be an array in the following format if provided:

```yml
screenshots:
  -
    imageUrl: 'https://mysite.com/awesome1.png'
    caption: 'Awesome screenshot 1'
    imageLink: 'https://mysite.com/awesome.html'
  -
    imageUrl: 'https://mysite.com/awesome2.png'
    caption: 'Awesome screenshot 2'
    imageLink: 'https://mysite.com/awesome.html'
```

* `imageUrl` - *required* - fully-qualified URL of screenshot image.  Allowed image types are png, jpg, and gif.
* `caption` - an optional caption to display with the screenshot.
* `imageLink` - an optional link URL to indicate the link that should be directed to when someone clicks on an image.  If this field is not specified, clicking on a screenshot will go to the application website.

### Colors

- `goodColorOnWhite` is an optional hex string, e.g. `#660000`
- `goodColorOnBlack` is an optional hex string.
- `faintColorOnWhite` is an optional rgba string, e.g. `rgba(100, 0, 0, 0.1)`

If unspecified, an [accessible colors](https://github.com/zeke/pick-a-good-color)
will be picked or derived from the provided icon file.

Colors must meet the
[WCAG contrast guidelines](https://www.w3.org/TR/WCAG/#visual-audio-contrast).
You can use
[leaverou.github.io/contrast-ratio](http://leaverou.github.io/contrast-ratio/)
to help pick accessible colors.

### Icons

- Must be a `.png`
- Must be a square
- Must be at least 256px by 256px
- Must **not** be a copy of another company's or application's icon (see submission guidelines below)

### Locales

By default, your app is assumed to be designed for English speakers. If your
app supports a different language (or multiple languages), please add a
`locales` property that lists all locales supported.

Example:

```yml
name: fangyuanjian
description: 'collaboration and messaging for small-to-medium sized businesses.'
website: 'http://bzsns.cn/'
keywords:
    - messaging
    - collaboration
locales:
  - zh-CN
```

### Company Logos and Names

Please do not directly use another company's name or product without permission. It's generally better to refer to it in a dependent clause; for example, after "compatible with", "on", or "for."

For example, while we would not accept a third-party app named "GitHub Notifications", we would consider "Yourname Notifications for GitHub".

While some existing apps in the collection predate this rule and have been grandfathered in, we will not accept any apps that do not follow this rule going forward.

For the specific case of GitHub, there are also [guidelines](https://github.com/logos) for use of its logos.

### Submission Guidelines

Some things to keep in mind when preparing your app for submission. Heavily inspired by the [awesome-electron](https://github.com/sindresorhus/awesome-electron) submission guidelines.

- **The pull request should have a useful title and include a link to the thing you're submitting and why it should be included.**
- Don't use another company's trademarks (icon, logo or name) without supplying evidence of prior permission
- If you just created something, wait at least 20 days before submitting.
- If you're submitting a closed source app, include evidence of it being built with Electron.
- Submitted open source apps should have a readme, screenshot of the app in the readme, and a binary for at least one OS, preferably macOS, Linux and Windows.
- Keep descriptions short and simple, but descriptive.
- Start the description with a capital and end with a full stop/period.
- Don't mention `Electron` in the description as it's implied.
- Don't start the description with `A` or `An`.
- Check your spelling and grammar.

## Releases

Once your pull request has been merged, your changes will automatically be published in a new release of the `electron-apps` npm module, and will be displayed on the electronjs.org website shortly thereafter. This process
involves a number of scheduled process, and typically takes 20-30 minutes.

## Removing or Disabling Apps

Sometimes it's necessary to remove an app for this registry. To do so,
add a `disabled` property to the app's YML file, followed a comment
explaining the reason for removing it.

```yml
disabled: true # Nylas was sunset and replaced by Mailspring
```

This approach keeps the app data on hand, giving the app developer
an option to resurrect the app at a later date by simply removing the flag.

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

## Development

To develop this thing locally, there are a few things you should know:

You'll need a GitHub token to run the build task. Put it in a file named
`.env`. It will be ignored by git.

```
cp .env.example .env
```

## Testing

On Travis CI, the `npm test` command is run, which only tests human-submitted
data.

When cutting a new release (which is normally done automatically by a Heroku
scheduler process), the `npm run test-all` command is run, which tests not
only the human-submitted data, but also the artifacts generated by the
build process, like resized icons, icon color palettes, releases data, etc.
