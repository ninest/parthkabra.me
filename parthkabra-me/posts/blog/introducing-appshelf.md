---
title: HTML apps with superpowers
description: Turn a single HTML file into a shareable app with sign-in and user-owned, synced data
createdAt: 2026-07-21
categories:
  - blog
draft: true
---
Links: [appshelf.org](https://appshelf.org), [Join the waitlist](https://appshelf.org/waitlist)

Making a website is easy. Open a text editor and just start writing.

```html
<head>
  <title>My first website</title>
</head>
<body>
  <h1>Welcome to my first website!</h1>
</body>
```

I'm sure we've all felt this excitement in 4th grade. HTML has always been my infinite canvas where I can make something and share it with anyone in the world almost instantly.

For your next website, you dream bigger. Don't make a website, make an **app**. Rather than limit yourself to a static website that never changes, you want it to be a unique experience for every user. So you make a note-taking app:

```html
<head>
  <title>Notes</title>
</head>
<body>
  <h1>Notes</h1>
  <textarea id="note" placeholder="Write a note..."></textarea>
  <button id="save">Save</button>
  <p id="saved-note"></p>

  <script>
    let note = "";
    const $note = document.getElementById("note");
    const $save = document.getElementById("save");
    const $savedNote = document.getElementById("saved-note");

    $save.addEventListener("click", () => {
      note = $note.value;
      $savedNote.textContent = note;
    });
  </script>
</body>
```

It's amazing! With just five minutes and one HTML file, you have something that looks like a functioning app.

Until you refresh the page. Then your note is gone.

You could add `localStorage`, but then your notes are stuck in one browser. You could set up a database and user accounts, but it's gone from from 5 minutes to 25 minutes. And now you need to babysit your database.

Where should the data live? How do you make it as easy as possible for your parents to use this app? How do you let users inspect and own their data?

Most modern app-building platforms solve the app-building part very well. You can create the app and store data in it too. But I really think users should have complete control of their data. **That's why I'm building AppShelf**. AppShelf lets you turn a single HTML file into a shareable app with sign-in and user-owned, synced data.

## Giving HTML superpowers

AppShelf apps get their superpowers from a script tag. Here is what the note-taking app looks like when its note is saved with AppShelf:

```html
<textarea id="note" placeholder="Write a note..."></textarea>
<button id="save">Save</button>
<p id="saved-note"></p>

<script src="https://appshelf.org/sdk/v0.js"></script>
<script>
  const $note = document.getElementById("note");
  const $save = document.getElementById("save");
  const $savedNote = document.getElementById("saved-note");

  async function loadNote() {
    $note.value = await shelf.store.get("note.txt") ?? "";
  }

  $save.addEventListener("click", async () => {
    await shelf.store.set("note.txt", $note.value);
    $savedNote.textContent = "Saved!";
  });

  loadNote();
</script>
```

That's it. This is all the code you need for a note taking app, where users can log in and save their notes under their account.

There is no database to create and no backend to deploy. The app can save one file, like this example, or keep every note in a separate file. It can store JSON, text, or whatever structure makes sense for the app.

The important thing is that the `note.txt` where the note is saved always stays in the user's file drive. The app can edit that file display its contents, but it cannot share the content or send it externally. Privacy by default!

## Try first, sign in later

The same code works whether you have an AppShelf account or not.

If you aren't signed in, you are treated as a guest and `shelf.store` saves everything locally in your browser. You can open an app and try it without creating an account or wondering whether it is already sending your data somewhere.

If you decide the app is worth using, you can sign in. Your local data is synced to your AppShelf drive, and the app keeps working with the same code.

I really like this for small apps and games. You probably don't need an account just to try a game someone sent you. Maybe you don't care whether a high score survives after you clear your browser data. If you eventually decide that you do care, you can sign in and keep it.

## Your data is actually yours

Every app gets its own folder in your AppShelf drive. An app can access its folder, but it cannot look through the rest of your account. The app developer cannot see the files either.

You can inspect your files, download them, delete them, and move them somewhere else. AppShelf also keeps version history, so if an app makes a mistake and overwrites something important, you can recover an older version. In the future, I also want to let you sync this data directly to your computer.

Apps run inside a restricted iframe with no direct access to the network. They cannot quietly send your notes to the developer or anywhere else. The AppShelf SDK is their only bridge out of the sandbox, and it can access only that app's folder in your account.

There are a lot more technical details here, but those probably deserve their own post.

## From an HTML file to a real app

Storage is only one of the things an app needs. AppShelf has a browser-based editor where you can write the HTML yourself, or you can use the chat interface to describe what you want and have AI build it. You can preview the app on the website itself, so you don't need to install an editor or download anything just to get started.

When ready, the app can have its own URL that you can send to someone. Soon, every AppShelf app will be installable on your home screen. More on this soon.

Doesn't the App Store already solve this? Sort of, but the barrier to entry is much higher. I want to make an app that my parents can use today. I don't want to pay Apple $99, open Xcode, take screenshots of my app, and have my parents install TestFlight just so they can try it. I want to make something in five minutes, send them a link, and not have to worry about where the data is stored.

I am also building the parts that come after publishing. Version history for app updates, ratings and reviews, notifications, file sharing, and a way for users to pay for the AI they use instead of leaving the app developer with an unlimited API bill.

## Let AI do the boring parts

I don't want AppShelf to be only a chat box that spits out an app. AI is great at writing code, especially for a small app. But making something is still fun, I want to build media and sound editors into AppShelf so you can let AI handle the boring coding parts while you keep working on the creative parts.

Maybe you draw the characters for your game, edit its sound effects, or keep changing the layout until it feels like yours. You should not have to leave the browser or set up a development environment to do any of that. More importantly, you should not have to let AI do that for you. It can give you a starting point, but you are way better at being creative.

## What I am building

AppShelf is still early. I'm not trying to build another tool that generates a website and leaves you to figure out the rest. I want one HTML file to be enough to make a real app: something people can try immediately, sign into when they are ready, install, update, and share.

And most importantly, I want the people using that app to own the data they create with it.

If you have a small app you have always wanted to make, [join the AppShelf waitlist](https://appshelf.org/waitlist).
