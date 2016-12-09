# electron-apps [![Build Status](https://travis-ci.org/electron/electron-apps.svg?branch=master)](https://travis-ci.org/electron/electron-apps)

A collection of apps built on Electron. [electron.atom.io/apps](http://electron.atom.io/apps).

## Adding your App

If you have an Electron application or project you'd like to see added, please
open a pull request! All that's required is a basic YML file and an icon.

### Wizard 🔮

This repository has a CLI wizard much like `npm init` that you can use to generate
a datafile for your app. To use the wizard,
[fork and clone this repository](https://help.github.com/articles/fork-a-repo/)
then run:

```sh
npm install && npm run wizard
```

### Manual 💪

Another easy way to add a new app is to copy an existing app and edit its metadata.

To do so, create a new directory in the `apps` directory and include a `.yml`
file and a `.png` or `.svg` icon file. The directory can only contain numbers,
lowercase letters, and dashes.

It should look like this:

```
apps
└── my-cool-app
    ├── my-cool-app.png
    └── my-cool-app.yml
```

YML file rules:

- Must have the same basename as the parent directory, e.g. `foo/foo.yml`
- `name` is required.
- `description` is required.
- `website` is required, and must be a fully-qualified URL.
- `repository` is optional, but must be a fully-qualified URL if provided.
- No fields should be left blank.

Icon file rules:

- Must be a `.png` or `.svg` with the same basename as the parent directory.
- Must be a square
- Must be at least 256px x 256px


## Tests

```sh
npm install
npm test
```

## License

MIT
