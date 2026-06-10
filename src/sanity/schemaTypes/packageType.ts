export const packageType = {
  name: 'domePackage',
  title: 'Dome Celebration Packages',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Package Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price (e.g. ₹999)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'duration',
      title: 'Duration (e.g. 1.5 hrs)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'features',
      title: 'Inclusions / Features',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'tag',
      title: 'Badge/Tag (e.g. MOST POPULAR, optional)',
      type: 'string',
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
    }
  ],
};
