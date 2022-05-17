---
title: Dividing Your App Into Modules
description: "Non-file based routing in NextJS: Customize how you organize your code"
date: 2021-05-31
links:
  - source: github
    href: https://github.com/ninest/nextjs-custom-routing
    title: Demo
  - source: github
    href: https://github.com/vercel/next.js/discussions/9081
    title: "[RFC] Custom Routes"
---

Nextjs uses [**file-based routing**](https://nextjs.org/docs/routing/introduction). Files in the `pages/` router are automatically mapped to page URLs. While this is great for most sites, especially static sites like blogs, it can become difficult to deal with as the project grows in size and complexity.

File-based routing is great, but it may make more sense to divide your app into multiple modules, with all related code closer together.

## The issue

Take a look at this Nextjs app structure:

<section className="space-y-base md:space-y-0 md:flex items-center md:space-x-xl">
<div className="leading-5 font-mono">

- **lib/**
  - <span className="bg-warning">auth.js</span>
  - <span className="bg-error">admin.js</span>
  - <span className="bg-primary-light">mdx.js</span>
  - <span className="bg-primary-light">comments.js</span>
- **pages/**
  - **api/**
    - <span className="bg-warning">login.js</span>
    - <span className="bg-warning">signup.js</span>
    - <span className="bg-primary-light">comment.js</span>
    - <span className="bg-error">admin.js</span>
  - index.js
  - <span className="bg-warning">login.js</span>
  - <span className="bg-warning">signup.js</span>
  - **blog/**
    - <span className="bg-primary-light">[slug].js</span>
  - <span className="bg-error">admin.js</span>

</div>

<div className="space-y-base">

This is the structure of a basic Nextjs application. The colors represent the different parts of the app: <span className="text-primary">blog</span>, <span className="text-warning">authentication</span>, and <span className="text-error">admin-related</span>.

As you can see, files relating to a single part of the app are spread across many folders. I would much prefer storing each part under a new folder ...

</div>

</section>

<section className="md:pt-xl space-y-base md:space-y-0 md:flex items-center md:space-x-xl">

<div className="leading-5 font-mono">

- **pages/**
  - index.js
- **modules/**
  - **auth/**
    - <span className="bg-warning">login.js</span>
    - <span className="bg-warning">signup.js</span>
    - **api/**
      - <span className="bg-warning">login.js</span>
      - <span className="bg-warning">admin.js.js</span>
    - **lib/**
      - <span className="bg-warning">auth.js</span>
  - **blog/**
    - <span className="bg-primary-light">[slug.js]</span>
    - **lib/**
      - <span className="bg-primary-light">mdx.js</span>
      - <span className="bg-primary-light">comments.js</span>
  - **admin/**
    - <span className="bg-error">index.js</span>
    - **api/**
      - <span className="bg-error">admin.js</span>
    - **lib/**
      - <span className="bg-error">admin.js</span>

</div>

<div>

... like this. This feels a lot easier to read and manage, even with larger and complex applications. Each "module" has its own folder.

</div>

</section>

There are a few ways to achieve a folder structure like this.

## Custom page extensions

Within the pages folder, [custom extensions for pages](https://nextjs.org/docs/api-reference/next.config.js/custom-page-extensions) can be specified. For example, we can have all pages end `.page.js` and `.api.js`. Other files will just have a `.js` extensions, and therefore are not pages:

```js title="next.config.js"
module.exports = {
  pageExtensions: ["page.js", "api.js"],
  // use page.tsx and api.ts for TypeScript
};
```

What this means is we can put files **that are not pages** inside the `pages/` directory, so our file structure can be slightly improved:

<section className="space-y-base md:space-y-0 md:flex items-center md:space-x-xl">
<div className="leading-5 font-mono">

- **pages/**
  - **api/**
    - <span className="bg-warning">login.api.js</span>
    - <span className="bg-warning">signup.api.js</span>
    - <span className="bg-primary-light">comment.api.js</span>
    - <span className="bg-error">admin.api.js</span>
  - index.js
  - <span className="bg-warning">login.page.js</span>
  - <span className="bg-warning">signup.page.js</span>
  - **auth-lib/**
    - <span className="bg-warning">auth.js</span>
  - **blog/**
    - <span className="bg-primary-light">[slug].page.js</span>
    - **lib/**
      - <span className="bg-primary-light">mdx.js</span>
      - <span className="bg-primary-light">comments.js</span>
  - **admin**
    - <span className="bg-error">index.page.js</span>
    - **lib/**
      - <span className="bg-error">admin.js</span>

</div>

<div>

While this is _slightly_ better, there are issues.

- The API routes are still in the `api/` directory.
- The authentication pages (login and signup) are at the same level as the index, so they do not have their own "module" folder like **blog** and **admin** do. **Rewrites** can help us fix this.

</div>

</section>

## Rewrites

[Rewrites allow you to map an incoming request path to a different destination path](https://nextjs.org/docs/api-reference/next.config.js/rewrites). Unlike redirects, the user stays on the same page.

The issue is that each "module" apart from **auth** has its own folder in the `pages/` directory. So what we can do is change the file structure slightly:

- Move <span className="bg-warning font-mono">/pages/login.page.js</span> to <span className="bg-warning font-mono">/pages/auth/login.page.js</span>
- Move <span className="bg-warning font-mono">/pages/signup.page.js</span> to <span className="bg-warning font-mono">/pages/auth/signup.page.js</span>

Now the auth pages are at `/auth/login` `/auth/signup`, while we want them at `/login` and `/signup`. Add the following to the `rewrites` section in `next.config.js`:

```js title="next.config.js"
module.exports = {
  ...,
  async rewrites() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
      },
      {
        source: "/signup",
        destination: "/auth/signup",
      },
    ];
  },
};
```

Restart your dev server and visit [localhost:3000/login](http://localhost:3000/login) and [localhost:3000/signup](http://localhost:3000/signup) to confirm that the rewrites are working properly.

<Alert variant="warning" title="SEO and duplicate content with rewrites">

See [this comment](https://github.com/vercel/next.js/discussions/9081#discussioncomment-115466) for more information.

</Alert>

Our file structure currently looks like this now:

<section className="space-y-base md:space-y-0 md:flex items-center md:space-x-xl">
<div className="leading-5 font-mono">

- **pages/**
  - **api/**
    - <span className="bg-warning">login.api.js</span>
    - <span className="bg-warning">signup.api.js</span>
    - <span className="bg-primary-light">comment.api.js</span>
    - <span className="bg-error">admin.api.js</span>
  - index.js
  - **auth/**
    - <span className="bg-warning">login.page.js</span>
    - <span className="bg-warning">signup.page.js</span>
    - **lib/**
      - <span className="bg-warning">auth.js</span>
  - **blog/**
    - <span className="bg-primary-light">[slug].page.js</span>
    - **lib/**
      - <span className="bg-primary-light">mdx.js</span>
      - <span className="bg-primary-light">comments.js</span>
  - **admin**
    - <span className="bg-error">index.page.js</span>
    - **lib/**
      - <span className="bg-error">admin.js</span>

</div>

<div>

We have solved two problems: dividing the app into modules, and putting non-page routes in the `pages/` directory. The last problem is to move the API routes into their modules.

</div>

</section>

There are three things we can do at this stage.

1. Leave it as is, if you're okay with this structure.
2. Use a [custom server](https://nextjs.org/docs/advanced-features/custom-server) (like Express). Write all your API routes with Express and let Nextjs handle the page routes. While this allows for customization, we lose out on many Nextjs features, such as hot reload by default, TypeScript support, and have to set them up ourselves. A Nextjs app with a custom server **cannot be** deployed on Vercel.
3. _Import your API functions from other files_: write your APIs in the file you want, and import it into a file in `pages/api` directory. Let's explore this method in more detail.

## Importing and exporting

From the above file structure, let's take `auth` module as an example. Create an API folder inside the `auth/` directory like this:

<div className="leading-5 font-mono">

- <b className="opacity-50">pages/</b>
  - <span className="opacity-50">...</span>
  - <b className="opacity-50">auth/</b>
    - <span className="bg-warning opacity-50">login.page.js</span>
    - <span className="bg-warning opacity-50">signup.page.js</span>
    - <b className="opacity-50">lib/</b>
      - <span className="bg-warning opacity-50">auth.js</span>
    - <b>api/</b>
      - <span className="bg-warning">login.js</span>
      - <span className="bg-warning">login.js</span>

</div>

In them, [create and export the handler function](https://nextjs.org/docs/api-routes/introduction) as your normally would:

<div className="space-y-base lg:space-y-0 lg:flex lg:space-x-base  justify-between">

```js title="auth/api/login.js"
export default function handler(req, res) {
  res.status(200).json({ name: "Login API" });
}
```

```js title="auth/api/signup.js"
export default function handler(req, res) {
  res.status(200).json({ name: "Sign up API" });
}
```

</div>

Now in `pages/api/login.api.js` and `pages/api/signup.api.js`, all you have to do is

1. Import the `handler` from `pages/auth/api/login.js` or `pages/auth/api/signup.js`.
2. Export it as the default export.

<div className="space-y-base lg:space-y-0 lg:flex lg:space-x-base  justify-between">

```js title="api/login.api.js"
import handler from "../auth/api/signup";
export default handler;
```

```js title="auth/api/signup.api.js"
import handler from "../auth/api/signup";
export default handler;
```

</div>

After doing this with the APIs from the other modules, the final directory should look something like this:

<section className="space-y-base md:space-y-0 md:flex items-center md:space-x-xl">
<div className="leading-5 font-mono">

- **pages/**
  - **api/**
    - <span className="bg-warning opacity-50">login.api.js</span>
    - <span className="bg-warning opacity-50">signup.api.js</span>
    - <span className="bg-primary-light opacity-50">comment.api.js</span>
    - <span className="bg-error opacity-50">admin.api.js</span>
  - index.js
  - **auth/**
    - <span className="bg-warning">login.page.js</span>
    - <span className="bg-warning">signup.page.js</span>
    - **lib/**
      - <span className="bg-warning">auth.js</span>
    - **api/**
      - <span className="bg-warning">auth.js</span>
      - <span className="bg-warning">login.js</span>
  - **blog/**
    - <span className="bg-primary-light">[slug].page.js</span>
    - **lib/**
      - <span className="bg-primary-light">mdx.js</span>
      - <span className="bg-primary-light">comments.js</span>
    - **api/**
      - <span className="bg-primary-light">comment.js</span>
  - **admin**
    - <span className="bg-error">index.page.js</span>
    - **lib/**
      - <span className="bg-error">admin.js</span>
    - **api/**
      - <span className="bg-error">admin.js</span>

</div>

<div>

We still have files inside the `pages/api` directory, but all of them only have 2 lines of code (importing and exporting the handler function).

</div>

</section>

### Dynamic API routes

Dynamic API routes work, but you have to rename the file inside the `api/` directory.

For example, the blog comments API takes in a URL parameter (`/api/comments/34`, where 34 is the blog post ID). In that case you will only need to change the files inside `pages/api`. You do **not** need to rename the files in `pages/blog/api/`.

<div className="space-y-base lg:space-y-0 lg:flex lg:space-x-base  justify-between">

```js  title="pages/blog/api/comments.js"
export default (req, res) => {
  const { id } = req.query;
  res.status(200).json({ name: `Comments for Blog Post ${id}` });
};
```

```js title="pages/api/comments/[id].api.js"
import handler from "../../blog/api/comments";
export default handler;
```

</div>

The file structure looks like this:

<div className="leading-5 font-mono">

- <b className="opacity-50">pages/</b>
  - **api/**
    - <b className="opacity-50">...</b>
    - **comments/**
      - <span className="bg-primary-light">[id].api.js</span> <span className="text-gray text-sm">This filename was changed and it was put under the comments/ directory</span>
  - <b className="opacity-50">blog/</b>
    - <span className="bg-primary-light opacity-50">[slug].page.js</span>
    - <b className="opacity-50">lib/</b>
      - <span className="bg-primary-light opacity-50">mdx.js</span>
      - <span className="bg-primary-light opacity-50">comments.js</span>
    - **api/**
      - <span className="bg-primary-light">comment.js</span> <span className="text-gray text-sm">This remained the same</span>
  - <b className="opacity-50">...</b>

</div>

See a full example of this structure: [nextjs-custom-routing](https://github.com/ninest/nextjs-custom-routing)

### Pages

Similar to API routes, if you want to keep your pages in a different folder, you can import and export them from the appropriate file.

For example, I want to have a page at the route `/blog/[slug].js`, but I want to keep the file inside the directory `/modules/blog/blogPost.js`. I can easily do it like this:


```js title="pages/blog/[slug].js"
import BlogPost, { getServerSideProps } from "../modules/blog/blogPost";

export default BlogPost;
export { getServerSideProps };
```


```js  title="modules/blog/blogPost.js"
export default function BlogPost() {
  ...
}

export async getServerSideProps() {
  ...
}
```


Note that you will have to keep the files `pages/blog/[slug].js` and `modules/blog/blogPost.js` in sync. If you want to change the name of the URL parameter `slug`, you will have to rename `pages/blog/[slug].js`. Also, remember to import end export `getServerSideProps`, `getStaticeProps`, or `getStaticPaths` if you have defined them.

## Multi-zones

Another way to divide your app into modules is to use use ["multi-zones"](https://nextjs.org/docs/advanced-features/multi-zones). This involves having multiple Nextjs projects ([example](https://github.com/vercel/next.js/tree/canary/examples/with-zones)). This may work out for you, but I personally would like the entire app to be under the same project so that I do not have to configure rewrites.

## Which method should I use?

I would first go for [custom page extensions](/nextjs/custom-routing#custom-page-extensions). If that isn't helpful (say you want to rename your pages to something other than `[slug].js`, for example), use the importing and exporting method with [page routes](/nextjs/custom-routing#pages) or [API routes](/nextjs/custom-routing#importing-and-exporting).
