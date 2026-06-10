export const heroSection = {
  name: 'heroSection',
  title: 'Home Sections (Slides)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    },
    {
      name: 'italicText',
      title: 'Italic Highlight Text',
      type: 'string',
    },
    {
      name: 'currentImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'nextImage',
      title: 'Next Transition Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'badgeText',
      title: 'Floating Badge Text (Optional)',
      type: 'string',
    },
    {
      name: 'isFirst',
      title: 'Is First Slide (Shows Scroll Indicator)',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'showButtons',
      title: 'Show CTA Buttons (Book a Dome / View Packages)',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'order',
      title: 'Section Order',
      type: 'number',
      description: 'Used to sort the slides on the home page.',
    }
  ],
};
