# electron-apps [![Build Status](https://travis-ci.org/electron/electron-apps.svg?branch=master)](https://travis-ci.org/electron/electron-apps)

A collection of apps built on Electron. [electron.atom.io/apps](http://electron.atom.io/apps).

## Adding Your App

If you have an Electron application or project you'd like to see added, please
open a pull request. **In your pull request, please make it clear if you are
involved with the project or have an OK from the project team to add the app
to the site**. We want to make sure each team is aware and OK with their project
being added.

Add your app to the list by creating a new directory in the `apps` directory,
and including a `.yml` file and a `.png` or `.svg` icon file. The directory can
only contain numbers, lowercase letters, and dashes.

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

:idea: ProTip: Copy an existing directory to get started!

## Tests

```sh
npm install
npm test
```

## License

MIT
