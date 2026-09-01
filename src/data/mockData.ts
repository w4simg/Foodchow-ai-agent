export interface RestaurantMock {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  outlets: OutletMock[];
}

export interface OutletMock {
  id: string;
  name: string;
  address: string;
  posStatus: 'ONLINE' | 'OFFLINE' | 'SYNC_ERROR';
  kdsStatus: 'ONLINE' | 'OFFLINE' | 'DISCONNECTED';
  printers: PrinterMock[];
  activeMenuId: string;
}

export interface PrinterMock {
  id: string;
  name: string;
  type: 'RECEIPT' | 'KITCHEN';
  ipAddress: string;
  status: 'READY' | 'PAPER_JAM' | 'OUT_OF_PAPER' | 'OFFLINE';
  lastSuccessfulPrint: string;
}

export interface OrderMock {
  id: string;
  restaurantId: string;
  outletId: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; qty: number; price: number }[];
  totalAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'CASH';
  transactionId?: string;
  orderStatus: 'CONFIRMED' | 'PENDING_APPROVAL' | 'PREPARING' | 'DISPATCHED' | 'FAILED';
  kdsSyncStatus: 'SYNCED' | 'NOT_SENT' | 'FAILED';
  printStatus: 'PRINTED' | 'FAILED' | 'PENDING';
  createdAt: string;
}

export const MOCK_RESTAURANTS: RestaurantMock[] = [
  {
    id: "REST-101",
    name: "FoodChow Gourmet Bistro",
    owner: "Rahul Sharma",
    email: "rahul@foodchowbistro.com",
    phone: "+91 98765 43210",
    outlets: [
      {
        id: "OUTLET-12",
        name: "Indiranagar Flagship Outlet #12",
        address: "100 Ft Rd, Indiranagar, Bengaluru",
        posStatus: "ONLINE",
        kdsStatus: "ONLINE",
        printers: [
          {
            id: "PRINTER-101",
            name: "Front Counter thermal receipt printer",
            type: "RECEIPT",
            ipAddress: "192.168.1.150",
            status: "PAPER_JAM",
            lastSuccessfulPrint: "2026-09-01T10:45:00Z"
          },
          {
            id: "PRINTER-102",
            name: "Kitchen KOT printer",
            type: "KITCHEN",
            ipAddress: "192.168.1.151",
            status: "READY",
            lastSuccessfulPrint: "2026-09-01T11:15:00Z"
          }
        ],
        activeMenuId: "MENU-901"
      },
      {
        id: "OUTLET-15",
        name: "Koramangala Express Outlet #15",
        address: "5th Block, Koramangala, Bengaluru",
        posStatus: "OFFLINE",
        kdsStatus: "DISCONNECTED",
        printers: [
          {
            id: "PRINTER-201",
            name: "Main POS Printer",
            type: "RECEIPT",
            ipAddress: "192.168.2.100",
            status: "OFFLINE",
            lastSuccessfulPrint: "2026-09-01T08:30:00Z"
          }
        ],
        activeMenuId: "MENU-902"
      }
    ]
  }
];

export const MOCK_ORDERS: OrderMock[] = [
  {
    id: "1024",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    customerName: "Ananya Roy",
    customerPhone: "+91 99001 12233",
    items: [
      { name: "Paneer Butter Masala Combo", qty: 2, price: 350 },
      { name: "Garlic Naan", qty: 4, price: 60 }
    ],
    totalAmount: 940,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    transactionId: "TXN_992014881",
    orderStatus: "PENDING_APPROVAL",
    kdsSyncStatus: "FAILED",
    printStatus: "FAILED",
    createdAt: "2026-09-01T11:05:00Z"
  },
  {
    id: "1023",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    customerName: "Ananya Roy",
    customerPhone: "+91 99001 12233",
    items: [
      { name: "Cold Coffee", qty: 2, price: 180 }
    ],
    totalAmount: 360,
    paymentStatus: "PAID",
    paymentMethod: "CREDIT_CARD",
    transactionId: "TXN_881940122",
    orderStatus: "CONFIRMED",
    kdsSyncStatus: "SYNCED",
    printStatus: "PRINTED",
    createdAt: "2026-09-01T09:30:00Z"
  },
  {
    id: "1089",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 98888 77777",
    items: [
      { name: "Chef Special Pizza Large", qty: 2, price: 650 },
      { name: "Choco Lava Cake", qty: 2, price: 150 }
    ],
    totalAmount: 1600,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    transactionId: "TXN_776100223",
    orderStatus: "FAILED",
    kdsSyncStatus: "NOT_SENT",
    printStatus: "FAILED",
    createdAt: "2026-09-01T10:50:00Z"
  }
];
