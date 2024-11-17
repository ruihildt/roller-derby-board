# Roller Derby Board

Roller Derby Board is a web app that lets you record a video of a roller derby strategy with audio, directly in your browser.

## Features

This is a work in progress. I started implenting the basics.

What we have so far:

- a track
- working animation and audio recording
- out of bounds detection
- pack definition
- engagement zone

What's missing to cover the basics:

- player status based on zones
- 10 feet lines
- physics and collision detection
- improve the design
- record without audio / save as gif

Ideas:

- Add common start strategies
- Show recorded video before offering to download it
- Assign players to keyboard shortcut and control them with the direction keys
- Save an animation not only as a video, but also as a set of instructions the user can reload at a later point in time

I will implement new features based on your feedback and usecases, please open an issue (or send an email to ruihildt@protonmail.com ) if you have any.

## Prior art & inspiration

I would be nothing without the work of others. Quite litteraly, since I have been using LLM to help me code this. And I would like to thank the following projects for inspiration.

### New Ultimate Roller Derby Simulator

NURDS is great and I initially tried to record the track with it, but it turns out SVG animation doesn't work well for that usecase.

I am tempted to call this project YARDS (Yet Another Roller Derby Simulator) in homage to NURDS.

[Source code](https://github.com/fa-bien/nurds) | [Demo](https://nurds.space/)

### Roller Derby Track Visualization

Haven't looked at it in detail, the 3D visualization is pretty cool.

[Source code](https://github.com/webdingens/track-viz) | [Demo](https://trackviz.netlify.app/)

## Technical details

### Technologies

This is using HTML Canvas to draw the board, and the MediaRecorder API for the audio recording. The video is saved as webm and is actually scaled up from what is shown in the browser.

### About the LLM usage

I'm not entirely sure how many lines of code I have actually wrote in this project (very few), and it's really weird. It's the first time I prompt engineer my way to a project.

While I'm an ok frontend developer, without LLM help, I would have probably never been able to get this far. I suck at geometry and I can't even double check if everything is correct `¯\_(ツ)\_/¯`.

If you have any suggestions on how to improve the code, I would love to hear them.

### Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## License

It's really debatable, since what the license of content produced by LLM is hotly debated and there are multiple ongoing lawsuits.

Assuming that the code here is mine, I hereby license it under the [AGPL license](https://www.gnu.org/licenses/agpl-3.0.en.html).

I am not a lawyer, but alternatively, do what you want, I'm not going to sue anyone for it.
