<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Parth Kabra's personal website. PostHog is initialized via a dedicated `src/components/posthog.astro` component with a `window.__posthog_initialized` guard to prevent stack overflow errors during Astro View Transitions (ClientRouter) soft navigation. The `ClientRouter` has been enabled in `src/layouts/Base.astro` alongside the PostHog snippet. Nine custom events are now tracked across eight files, covering the full visitor funnel from content discovery through to contact conversion.

| Event | Description | File |
|---|---|---|
| `contact_copied` | User copied contact info (email or phone) to clipboard | `src/components/copyable-contact.astro` |
| `search_performed` | User searched for content using the search box | `src/components/search.astro` |
| `search_result_clicked` | User clicked on a search result | `src/components/search.astro` |
| `theme_toggled` | User toggled between light and dark theme | `src/components/theme-toggle.astro` |
| `post_viewed` | User viewed a blog post (top of content funnel) | `src/components/posts/DefaultPostLayout.astro` |
| `project_viewed` | User viewed a project detail page | `src/components/projects/DefaultProjectLayout.astro` |
| `work_viewed` | User viewed a work experience detail page | `src/components/work/DefaultWorkLayout.astro` |
| `tool_used` | User calculated an average location using the geolocation tool | `src/components/tools/AverageLocationCalculator.astro` |
| `external_link_clicked` | User clicked an external link in an article's Links section | `src/components/article-links.astro` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/382468/dashboard/1468614
- **Contact copied over time**: https://us.posthog.com/project/382468/insights/aKhW7kXO
- **Search to click funnel**: https://us.posthog.com/project/382468/insights/pF3aN53U
- **Content views by type**: https://us.posthog.com/project/382468/insights/K5N5pjYq
- **External links clicked**: https://us.posthog.com/project/382468/insights/bLz380vc
- **Visitor engagement funnel**: https://us.posthog.com/project/382468/insights/vaudeZqg

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
