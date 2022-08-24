export const alert = {
  render: "Alert",
  children: ["paragraph", "tag", "list", "title", "heading"],
  attributes: {
    title: { type: String, required: false },
    open: { type: Boolean, default: false },
    variant: { type: String },
  },
};
