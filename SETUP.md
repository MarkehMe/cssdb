
CSSDB Local Setup Guide
=======================

The setup guide below aims to get you running a local version of the site with minimal fuss. The guide assumes you're using a
Mac. You may be able to get the site up-and running on a PC, and almost definitely on Linux. If you spot any issues, please
add to this document.


Dependencies
------------

All instructions assume you have a version of [Node.js][node] and npm installed. CSSDB requires Node 0.8+. Mac users are probably best off to install through [Homebrew][brew]:

```sh
$ brew install node
```

In order to store tweet and user data in development, you'll need [MongoDB][mongodb]. Again, Homebrew is the easiest way to get this installed (make sure you pay attention to the part about running MongoDB on startup if you don't want to have to start it manually):

```sh
$ brew install mongodb
```

Once you have Node/MongoDB installed, you can clone this repository, `cd` into it and run the following to install application dependencies through npm:

```sh
$ make deps
```

If your system doesn't have Make (I'm looking at you, Windows) then you can just run `npm install` then `./node_modules/.bin/bower install` or install [Make for Windows][make].


Configuration
-------------

All configurations locally are managed through a `.env` file in
the root of the repository. You'll notice an existing file called `.env.sample`; copy this using the following command:

```sh
$ cp .env.sample .env
```

Now edit the new `.env` file. You'll need to set your database connection string (`DB` in the config file) if your local MongoDB instance requires a password.


### Configuring GitHub

To configure GitHub, either leave the settings blank (you'll get lower rate limits but that may not matter locally) or [register an application][github-app-new].

Set the GitHub configurations in your `.env` file like so:

```
GITHUB_CLIENT_ID=<your app client id>
GITHUB_CLIENT_SECRET=<your app client secret>
```


### Configuring SMTP

To configure SMTP (for sending notification emails), set the following configurations. If you don't need the local site to email you activation links, you can just leave these blank.

```
EMAIL_RECIPIENT=<the email address notifications will be sent to>
EMAIL_SENDER=<the email address notifications will be sent from>
SMTP_HOST=<the SMTP host>
SMTP_USER=<the SMTP user>
SMTP_PASS=<the SMTP password>
```


Compiling Styles
----------------

CSSDB depends on a couple of libraries for styling, which are managed through [Bower][bower]. The styles will not compile if you haven't got these dependencies locally. You can get all dependencies by running:

```sh
$ make deps
```

The styles for CSSDB are written in Sass. You'll need to compile them using the [Sass command line tool][sass]. There are some convenient Make targets available to help you compile styles to the right places:

```sh
$ make compile-sass  # Create CSS from Sass
$ make minify-sass   # Create minified CSS from Sass
$ make watch-sass    # Watch Sass for changes and compile
```


Running CSSDB
-------------

To run the application locally, use the following command. This will allow your app to reload automatically when files change as
well as ensure that all your configurations are loaded in.

```sh
$ make start
```

This will normally start the application on port `5000`. You should be able to access it at http://localhost:5000/


Troubleshooting
---------------

If you have any issues getting set up locally, please check the [issue tracker][issues] to see if anyone else has had a similar problem. If not, feel free to open an issue and someone will try to help you out.



[bower]: http://twitter.github.com/bower/
[brew]: http://mxcl.github.com/homebrew/
[github-app-new]: https://github.com/settings/applications/new
[issues]: https://github.com/rowanmanning/cssdb/issues
[make]: http://gnuwin32.sourceforge.net/packages/make.htm
[mongodb]: http://www.mongodb.org/
[node]: http://nodejs.org/
[sass]: http://sass-lang.com/download.html
