// src/services/mockData.js

export const MOCK_CUSTOMERS = [
    { id: 1, name: "Ahmed Al-Mansoori", mobile: "050-1234567", email: "ahmed.m@example.com", type: "Individual", status: "Active" },
    { id: 2, name: "Tech Solutions LLC", mobile: "04-8889999", email: "contact@techsolutions.ae", type: "Corporate", status: "Active" },
    { id: 3, name: "Sarah Jones", mobile: "055-9876543", email: "sarah.j@example.com", type: "Individual", status: "Inactive" },
    { id: 4, name: "Blue Sky Trading", mobile: "056-1112222", email: "info@bluesky.ae", type: "Corporate", status: "Active" },
    { id: 5, name: "Mohammed Ali", mobile: "052-3334444", email: "m.ali@example.com", type: "Individual", status: "Pending" },
];

// Simulate API call with delay
export const getCustomers = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_CUSTOMERS]);
        }, 800);
    });
};

export const MOCK_SERVICES = [
    { id: 1, name: "Family Visa Opening", price: 250, category: "Immigration" },
    { id: 2, name: "Medical Test Application", price: 150, category: "Health" },
    { id: 3, name: "Emirates ID Typing - New", price: 370, category: "EID" },
    { id: 4, name: "Emirates ID Typing - Renewal", price: 270, category: "EID" },
    { id: 5, name: "Traffic File Opening", price: 200, category: "Traffic" },
    { id: 6, name: "Sponsorship Transfer", price: 550, category: "Immigration" },
];

export const getServices = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_SERVICES]);
        }, 600);
    });
};

export const MOCK_INVOICES = [
    { id: 1001, date: "2025-12-28", customerName: "Ahmed Al-Mansoori", total: 400, status: "Paid", paymentType: "Cash", items: 2 },
    { id: 1002, date: "2025-12-29", customerName: "Tech Solutions LLC", total: 1200, status: "Paid", paymentType: "Cash", items: 5 },
    { id: 1003, date: "2025-12-30", customerName: "Mohammed Ali", total: 200, status: "Pending", paymentType: "Credit", items: 1 },
];

export const getInvoices = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_INVOICES]);
        }, 800);
    });
};
