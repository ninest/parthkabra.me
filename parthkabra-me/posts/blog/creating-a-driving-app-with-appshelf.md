---
title: Creating a driving game with appshelf.org
description: A fully functional game in 5 minutes
createdAt: 2026-07-26
categories:
  - blog
draft: false
---
Links: [appshelf.org](https://appshelf.org), [Join the waitlist](https://appshelf.org/waitlist), [Technical introduction to appshelf.org](/blog/introducing-appshelf)

I want to build a simple game where I can
1. Create racing tracks
2. Drive my car around them
3. Drive my car around them with a friend

I want to be creative: I want to to design the art, or at least customize it, but I want to let AI do all the coding.

The first step is to create the app on [appshelf.org](https://appshelf.org). I'm just gonna call it "Roady"

![Creating the app](/images/posts/blog/creating-a-driving-app-with-appshelf/creating.png)

I'm going to create a simple icon for too, using the built-in icon editor:

![icon editor](/images/posts/blog/creating-a-driving-app-with-appshelf/icon-editor.png)

Now for building the app. I have the basic idea, but I'm not entirely sure about the implementation. Here are my thoughts and ideas for the game:

- it should be a pixel game
- i should be able to create, save, and edit multiple tracks
- the game should have some artwork for the actual cars - i know that appshelf has a media editor i can use to customize this art
- i know that in creating each track, i should be able to place "road", grass, and maybe some other things, like a starting/finish line for example
- the controls should be simple, just the arrow keys

This should be enough for now. I'm going to ask the agent to **interview** me so that we come to a shared understanding. So here is the prompt I'm using:

> I want to make a simple car driving game. Can you interview me about it? Here are my ideas:
> - it should be a pixel game
> - i should be able to create, save, and edit multiple tracks
> - the game should have some artwork for the actual cars - i know that appshelf has a media editor i can use to customize this art
> - i know that in creating each track, i should be able to place "road", grass, and maybe some other things, like a starting/finish line for example
> - the controls should be simple, just the arrow keys

![chat](/images/posts/blog/creating-a-driving-app-with-appshelf/chat.png)

Here are the questions it asked, and my answers:
1. What's the goal of the drive? Nothing, just drive
2. How does the track editor work? It's a grid editor
3. What terrain types do you want? Road, grass, barriers. You can't go through barriers, and grass slows you down. Start/finish "road" variant too
4. What's the camera view? Top-down
5. How does car handle work with arrow keys? Tank-like controls, so left/right rotate the car
6. How does the car move and feel? Instant speed or momentum? Momentum

Note that the agent will provide a few options and recommendation, which you can go for if you're unsure. Also, if you feel you're getting too many questions, you can just ask it to stop and build with what it already knows.

After 2/3 more questions, the agent responded with:

> We've covered a lot. Here's what's settled:
> - **Gameplay:** Top-down pixel car, tank controls, light momentum
> - Terrain: Road (normal), grass (slows), barriers (blocks), start/finish (spawn)
> - Tracks: 64×64 grid, paint terrain, name and save multiple tracks
> - UI: Track list, edit/play toggle on one screen, overwrite saves
> - Art: One car sprite (media editor), no animation
> Still open:
> - What happens when you hit a barrier — just stop, or bounce back?
> - Does the track start empty, or pre-filled with grass?
> - Any audio? (probably not needed for a simple game)

That is good to start. I can quickly answer some of the follow ups. I responded with

> Stop when hit barrier, track starts pre-filled with grass. Let's build

Now let's see what was built!

![demo - creating a track](/images/posts/blog/creating-a-driving-app-with-appshelf/demo-1.png)

I created a track called "My first racetrack", and I see this:

![demo - seeing my track](/images/posts/blog/creating-a-driving-app-with-appshelf/demo-2-init.png)

I made a simple circular track. There are some barriers on the turn. Now to start playing, I guess I click on "Edit" on the top right to get it into "Play" mode:

![playing](/images/posts/blog/creating-a-driving-app-with-appshelf/demo-4-play.png)

Yes, that was it! I can play it. The car is a little tiny, but it is there.

I checked my storage drive, and in the "Roady" folder, I see a folder called "tracks", with one file "my-first-racetrack". Storage works!

The media editor also works. I can see my agent created a car, but it doesn't really look like car. I'll edit it myself:

![media editor](/images/posts/blog/creating-a-driving-app-with-appshelf/demo-5-media.png)

![media editor](/images/posts/blog/creating-a-driving-app-with-appshelf/demo-6.png)

Now some of the issues I want fixed:
- Starting the game is not clear enough. By pressing a button that says "Edit", it looks like I'm going into edit mode, but I'm already in "Edit mode".
- The car is way too small, and I can't see it that well
- I would actually like to edit the texture of the grass, road, etc. So maybe the "terrain" can be 4x4 sprites that I can edit in the media editor

I'm going to paste this in the same chat:

![making improvements with side chat](/images/posts/blog/creating-a-driving-app-with-appshelf/chat-2.png)

I can see it added a few more sprites. After some of my own touch ups and refinements, I think I like them much more now. I made the start/finish tile look more like a flag:

![newer designs](/images/posts/blog/creating-a-driving-app-with-appshelf/demo-7.png)

I already think it's looking much better.

Now a slightly bigger change I want to add. I want to add multiplayer on the same device. If I have a friend, we should both be able to play on the same computer. One of use can use the arrow keys, and the other can use W-A-S-D to control the car. As for the other car, it can be the exact same as the red one, but blue. 

I also want there to be more starting tiles, so there can be one starting tile per car. Currently, the editor only lets me place one.

I'm going to prompt exactly that:

![multiplayer](/images/posts/blog/creating-a-driving-app-with-appshelf/chat-3.png)

Looks like it did it!

![multiplayer](/images/posts/blog/creating-a-driving-app-with-appshelf/demo-8.png)

The last thing I want to add is mobile controls. I think a joystick on mobile would be good. Not sure how it would work for the other player, perhaps it can be another joystick at the top of the screen?

And mobile, the sides of the track are being cut off because the mobile screen is not as wide.

![playing on iphone](/images/posts/blog/creating-a-driving-app-with-appshelf/phone.png)

This is finally what I got to in around 15 minutes. There definitely are more enhancements and refinements I can make, but for a prototype, I think this is great!

If you have a small app you have always wanted to make, [join the AppShelf waitlist](https://appshelf.org/waitlist). If you want a more technical introduction to appshelf, check out the [Technical introduction to appshelf.org](/blog/introducing-appshelf).