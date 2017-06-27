# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

This project adheres to the Contributor Covenant [code of conduct](https://github.com/electron/electron/blob/master/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable
behavior to electron@github.com.

The following is a set of guidelines for contributing to `electron-apps`.
These are just guidelines, not rules. Use your best judgment and feel free to
propose changes to this document in a pull request.

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

YML file rules:

- `name` is required.
- `description` is required.
- `website` is required, and must be a fully-qualified URL.
- `repository` is optional, but must be a fully-qualified URL if provided.
- `keywords` is optional, but should be an array if provided.
- `license` is optional.
- No fields should be left blank.

Icon file rules:

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
