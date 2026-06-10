export const reviewType = {
  name: 'review',
  title: 'Reviews',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Reviewer Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'text',
      title: 'Review Text',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'stars',
      title: 'Stars (1-5)',
      type: 'number',
      initialValue: 5,
      validation: (Rule: any) => Rule.min(1).max(5).integer(),
    }
  ],
};
