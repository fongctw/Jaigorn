export const billHistory = [
  { id: 'b1', month: 'October 2025', amount: 102.67, status: 'Paid' },
  { id: 'b2', month: 'September 2025', amount: 98.4, status: 'Paid' },
  { id: 'b3', month: 'August 2025', amount: 115.2, status: 'Paid' },
  { id: 'b4', month: 'July 2025', amount: 95.0, status: 'Paid' },
]

export type BillHistoryItem = (typeof billHistory)[0]
