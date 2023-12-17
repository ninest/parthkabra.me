// keystatic.config.ts
import { Alert } from "@/components/alert";
import { Chat } from "@/components/special/chat";
import { Keyboard } from "@/components/special/keyboard";
import { collection, component, config, fields } from "@keystatic/core";
import { pick } from "lodash";
import { ComponentProps } from "react";

const commonFields = {
  links: fields.array(
    fields.object({
      name: fields.text({
        label: "Name",
        validation: {
          length: { min: 1 },
        },
      }),
      href: fields.url({
        label: "URL",
        validation: {
          isRequired: true,
        },
      }),
    }),
    {
      label: "Links",
      itemLabel: (props) => `${props.fields.name.value} - ${props.fields.href.value}`,
    }
  ),
  showContents: fields.checkbox({ label: "Show contents?", defaultValue: false }),
  color: fields.text({
    label: "Color",
    validation: {
      length: { min: 0, max: 7 },
    },
  }),
  icon: fields.conditional(
    fields.select({
      label: "Icon type",
      options: [
        {
          label: "None",
          value: "none",
        },
        {
          label: "Emoji",
          value: "emoji",
        },
        {
          label: "Image",
          value: "image",
        },
      ],
      defaultValue: "emoji",
    }),
    {
      none: fields.empty(),
      emoji: fields.text({ label: "Emoji", validation: { length: { min: 1, max: 2 } } }),
      image: fields.image({ label: "Image", directory: "public/images/icons", publicPath: "/images/icons" }),
    }
  ),
  createdAt: fields.date({ label: "Created at", defaultValue: { kind: "today" } }),
  updatedAt: fields.date({ label: "Created at", defaultValue: { kind: "today" } }),
  content: fields.document({
    label: "Content",
    formatting: true,
    dividers: true,
    links: true,
    layouts: [[1], [1, 1]],
    images: {
      directory: "public/images",
      publicPath: "/images",
    },
    componentBlocks: {
      div: component({
        label: "Div",
        schema: {
          className: fields.text({ label: "Classes" }),
          content: fields.child({ kind: "block", componentBlocks: "inherit", placeholder: "Content ..." }),
        },
        preview: ({ fields }) => <div className={fields.className.value}>{fields.content.element}</div>,
      }),
      alert: component({
        label: "Alert",
        schema: {
          variant: fields.select({
            label: "Variant",
            defaultValue: "secondary",
            options: [
              { label: "Default", value: "default" },
              { label: "Secondary", value: "secondary" },
            ],
          }),
          title: fields.text({ label: "Title" }),
          content: fields.child({ kind: "block", componentBlocks: "inherit", placeholder: "Content ..." }),
        },
        preview: ({ fields }) => (
          <Alert variant={fields.variant.value as ComponentProps<typeof Alert>["variant"]} title={fields.title.value}>
            {fields.content.element}
          </Alert>
        ),
      }),
      keyboard: component({
        label: "Keyboard",
        schema: {},
        preview: () => (
          <div>
            <Keyboard disabled />
          </div>
        ),
      }),
      chat: component({
        label: "Chat",
        schema: {
          messages: fields.array(
            fields.object({
              me: fields.checkbox({ label: "From me?" }),
              text: fields.text({
                label: "Text",
                validation: {
                  length: { min: 1 },
                },
              }),
              replyTo: fields.text({ label: "Reply to" }),
            }),
            {
              label: "Messages",
              itemLabel: (props) => (props.fields.me.value ? "Me: " : "") + props.fields.text.value,
            }
          ),
        },
        preview: ({ fields }) => (
          <div>
            <Chat
              messages={fields.messages.elements.map((message) => ({
                me: message.fields.me.value,
                text: message.fields.text.value,
                replyTo: message.fields.replyTo.value,
              }))}
            />
          </div>
        ),
      }),
    },
  }),
};

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    categories: collection({
      label: "Categories",
      path: "content/categories/*",
      slugField: "title",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Name" } }),
        ...pick(commonFields, "content"),
      },
    }),
    posts: collection({
      label: "Posts",
      entryLayout: "content",
      slugField: "title",
      path: "content/posts/**",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "Description", validation: { length: { min: 5 } } }),
        ...pick(commonFields, ["links", "showContents", "color", "icon", "createdAt", "updatedAt", "content"]),
      },
    }),
    work: collection({
      label: "Work",
      entryLayout: "content",
      slugField: "title",
      path: "content/work/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "Description", validation: { length: { min: 5 } } }),
        location: fields.text({ label: "Location", validation: { length: { min: 5 } } }),
        date: fields.object({
          start: fields.date({
            label: "Start date",
            validation: {
              isRequired: true,
            },
          }),
          end: fields.date({
            label: "End date",
            validation: {
              isRequired: false,
            },
          }),
        }),
        ...pick(commonFields, ["links", "showContents", "color", "icon", "createdAt", "updatedAt", "content"]),
      },
    }),
    projects: collection({
      label: "Projects",
      entryLayout: "content",
      slugField: "title",
      path: "content/projects/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "Description", validation: { length: { min: 5 } } }),
        ...pick(commonFields, ["links", "showContents", "color", "icon", "createdAt", "updatedAt", "content"]),
      },
    }),
  },
});
