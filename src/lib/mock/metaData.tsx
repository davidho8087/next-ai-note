export const intents = [
  {
    name: 'question related to general information of outlet and premises',
    category: 'admin-outlet',
  },
  {
    name: 'question related to details of Server information, PC information and devices',
    category: 'server-outlet',
  },
  {
    name: 'question related to CPU , GPU , Memory and Hard-disk details',
    category: 'hardware-details',
  },
  {
    name: 'querying for nothing',
    category: 'unknown',
  },
  {
    name: 'question related to details of store footfall tracking and people counting',
    category: 'people-counting',
  },
  {
    name: 'question related to video analytics and customer traffic analysis',
    category: 'people-counting',
  },
  {
    name: 'question about entry and exit data of stores',
    category: 'people-counting',
  },

  // Add more intents as needed...
]

export const categoryOptions = [
  { label: 'Admin Outlet', value: 'admin-outlet' },
  { label: 'Server Outlet', value: 'server-outlet' },
  { label: 'Hardware Details', value: 'hardware-details' },
  { label: 'People Counting', value: 'people-counting' },
]
