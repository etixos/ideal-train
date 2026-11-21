export interface Message {
  id: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive';
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string[];
  time: string;
  unread?: boolean;
  flagged?: boolean;
  attachment?: string;
  label?: 'Vendors' | 'Stores' | 'Finance' | 'HR';
}

export const MESSAGES: Message[] = [
  { id: 'm1', folder: 'inbox', from: 'Halyard Outfitters', fromEmail: 'orders@halyard.example', subject: 'PO-24811 confirmation and revised ship date', preview: 'Thank you for the order. Two styles will ship separately due to…', body: ['Good morning,', 'Thank you for PO-24811. Four of the six lines will ship Monday. The Selvedge Work Shirt (indigo, M and L) will follow on December 4 because of a mill delay.', 'Revised invoices are attached. Please let us know if you would prefer to hold the whole order.', 'Best regards,\nRuth Calder\nHalyard Outfitters'], time: '9:41 AM', unread: true, flagged: true, attachment: 'PO-24811-revised.pdf', label: 'Vendors' },
  { id: 'm2', folder: 'inbox', from: 'Priya Natarajan', fromEmail: 'priya.n@hollisgrant.example', subject: 'Riverside holiday window: final proof', preview: 'Attached is the final layout for the window. Hannah suggested…', body: ['Hi all,', 'Attached is the final layout for the Riverside holiday window. Hannah suggested moving the enamelware forward and keeping the brass fixtures in the second tier.', 'Install is scheduled for Tuesday after close.', 'Priya'], time: '8:15 AM', unread: true, attachment: 'riverside-window-v4.pdf', label: 'Stores' },
  { id: 'm3', folder: 'inbox', from: 'Accounts Payable', fromEmail: 'ap@hollisgrant.example', subject: 'November close calendar', preview: 'The November close begins on Monday, December 1. Please submit…', body: ['Team,', 'The November close begins on Monday, December 1. Submit accruals by noon Wednesday and store cash reconciliations by end of day Tuesday.', 'Thank you.'], time: 'Yesterday', label: 'Finance' },
  { id: 'm4', folder: 'inbox', from: 'Marcus Bell', fromEmail: 'marcus.b@hollisgrant.example', subject: 'Cycle count results, Aisle B', preview: 'Variance of −3 units, all in Hardware. Brass pulls look like a…', body: ['Dana,', 'The cycle count variance for Aisle B was −3 units, all in Hardware. The brass pulls look like a receiving error on PO-24790; I have asked Calloway for the packing slip.', 'Marcus'], time: 'Yesterday' },
  { id: 'm5', folder: 'inbox', from: 'Cooper Hill Apiary', fromEmail: 'hello@cooperhill.example', subject: 'Holiday candle allocation', preview: 'We can offer an additional 120 pairs of tapers before the 15th…', body: ['Hello,', 'We can offer an additional 120 pairs of tapers before December 15 at last season’s pricing. Let us know by Friday.', 'Warmly,\nEleanor'], time: 'Tue', label: 'Vendors' },
  { id: 'm6', folder: 'inbox', from: 'People Operations', fromEmail: 'people@hollisgrant.example', subject: 'Seasonal staff onboarding checklist', preview: 'Please confirm that each seasonal associate has completed…', body: ['Managers,', 'Please confirm that each seasonal associate has completed register training and the safety module before their first closing shift.'], time: 'Mon', label: 'HR' },
  { id: 'm7', folder: 'sent', from: 'Dana Whitlock', fromEmail: 'dana.w@hollisgrant.example', subject: 'Re: Saturday coverage', preview: 'I can move Theo to the morning and bring Samuel in at two…', body: ['I can move Theo to the morning and bring Samuel in at two. That keeps the register covered through the rush.'], time: 'Mon' },
  { id: 'm8', folder: 'drafts', from: 'Dana Whitlock', fromEmail: 'dana.w@hollisgrant.example', subject: 'Q4 vendor review agenda', preview: 'Draft: 1. Fill rates 2. Lead times 3. Holiday allocation…', body: ['1. Fill rates', '2. Lead times', '3. Holiday allocation', '4. 2027 terms'], time: 'Sun' },
];
