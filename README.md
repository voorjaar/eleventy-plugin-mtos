# eleventy-plugin-mtos

A plugin for [Eleventy](https://www.11ty.dev/) that turns your site into a single page application.

> Checkout [this page](https://voorjaar.github.io/eleventy-plugin-mtos/) for a preview demo. You can compare it to [the site without mtos confgured](https://eleventy-base-blog.netlify.app/).

[![npm](https://img.shields.io/npm/v/eleventy-plugin-mtos.svg)](https://www.npmjs.com/package/eleventy-plugin-mtos)

## What it does?

The plugin uses Eleventy's [addTransform API](https://www.11ty.dev/docs/config/#transforms) to add [mtos](https://github.com/voorjaar/mtos) to your HTML head. You can configure to use a CDN or serve static script.

You still serve the static HTML files, but the user experience is the same as SPA with incremental requests via fetch API on the client side. And you can also add transition animations, progress bar, etc.

## Installation

Install the dependency from npm:

```bash
npm install eleventy-plugin-mtos
```

Update your 11ty configuration:

```js
const mtos = require("eleventy-plugin-mtos");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(mtos, {
    /* options */
  });
};
```

## Options

The following options can be used to configure this plugin.

| Option       | Type                 | Description                                                                                                                                      |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| cdn          | `boolean`            | Using a CDN instead of static script. Defaults to `false`.                                                                                       |
| cdnLink      | `string`             | The CDN link of [mtos](https://github.com/voorjaar/mtos). Defaults to `https://cdn.jsdelivr.net/npm/mtos@${mtos.version}/dist/mtos-iife.min.js`. |
| customJs     | `string \| string[]` | Path to a custom JS file to for the script to import.                                                                                            |
| customCss    | `string \| string[]` | Path to a custom Css file to for the script to import.                                                                                           |
| customStyle  | `string`             | Add custom css content to document head.                                                                                                         |
| customScript | `string`             | Add custom script content to document head.                                                                                                      |
| customHead   | `string \| string[]` | Add custom DOM elements to head.                                                                                                                 |

## Advanced

By using `customJs` \| `customCss` \| `customStyle` \| `customScript` options, you can implement some SPA features, such as adding page transition animation and page loading progress bar.

Create a css file named `assets/custom.css`, then add the following css:

```css
.animated {
  -webkit-animation-duration: 0.5s;
  animation-duration: 0.5s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

@-webkit-keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.fadeIn {
  -webkit-animation-name: fadeIn;
  animation-name: fadeIn;
}

.progress {
  height: 2px;
  width: 100%;
  background-color: #abb8c6;
}

.progress-bar {
  width: 0%;
  height: 100%;
  background-color: #1aa4f4;
  transition: width 0.4s ease;
}
```

Create a js file named `assets/custom.js`, add the following script:

```js
function updateProgress(n) {
  const bar = document.querySelector(".progress-bar");
  if (!bar) return;
  bar.style.width = n + "%";
}

function loadProgress(n = 0) {
  const header = document.querySelector("header");
  if (!header) return;
  const bar = document.createElement("div");
  bar.classList.add("progress");

  const p = document.createElement("div");
  p.classList.add("progress-bar");
  p.style.width = n + "%";

  bar.appendChild(p);
  header.appendChild(bar);

  setTimeout(() => {
    updateProgress(100);
  }, 150);
}

window.addEventListener("load", loadProgress);

mtos.setup({
  onBeforeElUpdated(fromEl, toEl) {
    if (toEl.tagName === "DIV" && toEl.classList.contains("col-content")) {
      toEl.classList.add("animated", "fadeIn");
    }
  },
  onElUpdated(el) {
    if (el.tagName === "DIV" && el.classList.contains("col-content")) {
      setTimeout(() => {
        el.classList.remove("animated", "fadeIn");
      }, 250);
    }
  },
  onFetchStart() {
    updateProgress(0);
  },
  onFetchEnd() {
    updateProgress(30);
  },
  onPageRendered() {
    loadProgress(30);
  },
});
```

Then we can load the animation and progress:

```js
const mtos = require("eleventy-plugin-mtos");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(mtos, {
    customJs: "assets/custom.js",
    customCss: "assets/custom.css",
  });
};
```

**Note**: The above steps are just examples, you can define your own animation and progress bar as needed.

## License

[MIT](https://github.com/voorjaar/eleventy-plugin-mtos/blob/main/LICENSE)

Copyright (c) 2022, Raven Satir
