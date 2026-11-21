# Slip Scout Credit

Build “The Collector – Catch it before you sign”: phone-first, dark theme. A big “📷 Scan delivery” button (file input, accept="image/*", capture="environment"). Resize the photo to max 1024px wide, convert to JPEG base64, and POST JSON {image} to https://collecty.kalaiselvanprathish.workers.dev. Also add a “Paste slip text” box that POSTs {text}, and a “Use demo slip” button that fills the text box with a sample invoice. Results: if verdict is DONT_SIGN, a red banner “🚫 Don’t sign — you’re owed $[owed]”, otherwise a green “✅ Safe to sign”. Below that, issue cards (item, type, overcharge), the message_to_driver, and credit_email with a Copy button.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9e18bbb7-753d-5d79-abb8-d8b4a614e239).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
