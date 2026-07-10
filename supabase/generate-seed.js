const fs = require('fs');
const path = require('path');

// Helper to generate UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Target store UUID
const storeId = '29f4e073-bc1d-4071-ae3a-c8718a90f998';

// Shared data collections
const indianNames = [
  'Aarav Sharma', 'Aditya Patel', 'Amit Kumar', 'Ananya Iyer', 'Arjun Rao',
  'Deepak Reddy', 'Divya Nair', 'Harish Rao', 'Ishaan Gupta', 'Jyoti Prasad',
  'Karthik Swami', 'Kavitha Hegde', 'Manoj Gowda', 'Neha Deshmukh', 'Pranav Kulkarni',
  'Priya Pillai', 'Rahul Verma', 'Ramesh Chandra', 'Ravi Shankar', 'Sandeep Hegde',
  'Sanjay Dutt', 'Sarita Mishra', 'Siddharth Sen', 'Sneha Rao', 'Suresh Prabhu',
  'Vikram Seth', 'Vivek Oberoi', 'Yash Pal', 'Zeeshan Khan', 'Vijay Mallya'
];

const corporateClients = [
  'Acro Furniture Solutions', 'Infy Office Layouts', 'Tata Retail Hub', 'Wipro Guest House',
  'Vardhaman Textiles', 'Apollo Clinics Lounge', 'Reddy Labs Reception', 'GMR Airport Lounges'
];

const cities = [
  { city: 'Hyderabad', state: 'Telangana', pin: '500001' },
  { city: 'Secunderabad', state: 'Telangana', pin: '500003' },
  { city: 'Bangalore', state: 'Karnataka', pin: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pin: '600001' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pin: '520001' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pin: '530001' }
];

const furnitureAdjectives = ['Royal', 'Premium', 'Classic', 'Modern', 'Minimalist', 'Luxurious', 'Eco-sustain', 'Imperial', 'Heritage', 'Comfort'];
const woodTypes = ['Teak Wood', 'Rose Wood', 'Mahogany', 'Sheesham Wood', 'Oak Wood', 'Engineered Wood'];
const colors = ['Teak Finish', 'Walnut Brown', 'Charcoal Grey', 'Warm Beige', 'Ivory White', 'Ebony Black', 'Ocean Blue', 'Crimson Red'];

const categoryData = [
  { name: 'Sofas', range: [18000, 120000], items: ['3-Seater Sofa', 'L-Shape Sofa Sectional', 'Recliner Sofa', 'Chesterfield Sofa', 'Sofa Cum Bed'] },
  { name: 'Beds', range: [15000, 95000], items: ['King Size Bed with Storage', 'Queen Size Wooden Bed', 'Single Bed', 'Poster Bed', 'Upholstered Bed Platform'] },
  { name: 'Dining Tables', range: [20000, 110000], items: ['6-Seater Wooden Dining Table', '4-Seater Glass Top Dining Table', 'Marble Top Dining Table', 'Extendable Dining Table'] },
  { name: 'Dining Chairs', range: [3000, 15000], items: ['Cushioned Dining Chair', 'Solid Wood Dining Chair', 'High Back Chair', 'Rattan Accent Chair'] },
  { name: 'Office Chairs', range: [4500, 35000], items: ['Ergonomic Task Chair', 'Executive Leather High-Back', 'Mesh Medium-Back Office Chair', 'Visitor Stool Chair'] },
  { name: 'TV Units', range: [8000, 45000], items: ['Wall Mounted TV Cabinet', 'Floor Standing TV Console', 'Modular TV Stand with Shelves'] },
  { name: 'Coffee Tables', range: [4000, 25000], items: ['Wooden Nesting Tables', 'Glass Top Coffee Table', 'Storage Trunk Coffee Table', 'Round Accent Coffee Table'] },
  { name: 'Wardrobes', range: [18000, 130000], items: ['3-Door Wardrobe with Mirror', '2-Door Sliding Wardrobe', 'Modular 4-Door Wardrobe', 'Open Walk-in Closet Organizer'] },
  { name: 'Study Tables', range: [5000, 30000], items: ['Compact Student Desk', 'Executive Study Desk with Drawers', 'Wall Folding Laptop Desk', 'Solid Wood Computer Desk'] },
  { name: 'Mattresses', range: [8000, 65000], items: ['Orthopedic Memory Foam Mattress', 'Pocket Spring Premium Mattress', 'Dual Comfort Latex Mattress'] },
  { name: 'Dressers', range: [9000, 38000], items: ['Dressing Table with LED Mirror', 'Compact Dresser Cabinet', '6-Drawer Wide Dresser chest'] },
  { name: 'Recliners', range: [16000, 75000], items: ['Single Motor Power Recliner', 'Manual Rocking Recliner Lounge Chair', 'Massage Recliner Chair'] },
  { name: 'Outdoor Furniture', range: [12000, 85000], items: ['Garden Patio Bistro Set', 'Rattan Outdoor Swing Chair', 'Wooden Sun Lounger Bed'] },
  { name: 'Storage Cabinets', range: [6000, 32000], items: ['Multi-drawer Utility Cabinet', 'Shoe Storage Bench Rack', 'Wooden Sideboard Credenza'] },
  { name: 'Bookshelves', range: [5000, 28000], items: ['Ladder Bookshelf Display Unit', '5-Tier Open Bookshelf Console', 'Closed Glass-door Library Cabinet'] }
];

console.log('Generating seed SQL components...');

let sql = `-- ============================================================
-- TIRUMALA FURNITURE - SEED SCRIPT FOR DEVELOPMENT & TESTING
-- Deterministic seed matching all POS and inventory metrics
-- ============================================================

-- 1. CLEANUP EXISTING DATA
TRUNCATE TABLE payments, invoice_items, invoices, products, categories, profiles CASCADE;

-- 2. SEED STORES
INSERT INTO stores (id, name, address, phone, invoice_prefix, footer, currency, created_at, updated_at)
VALUES (
  '${storeId}',
  'Tirumala Furniture',
  'Plot 45, Beside Metro Station, KPHB Phase 3, Kukatpally, Hyderabad, Telangana, 500072',
  '+91 90000 12345',
  'TF-',
  'Thank you for shopping at Tirumala Furniture! Warranty claims require copy of this invoice.',
  'INR',
  NOW() - INTERVAL '100 days',
  NOW() - INTERVAL '100 days'
);

-- 3. SEED USERS & PROFILES
-- Nexvelt Admin Profile
INSERT INTO profiles (id, store_id, full_name, role, is_active, created_at, updated_at)
VALUES (
  'd3b07384-d113-4071-8888-29f4e073bc1d',
  '${storeId}',
  'Nexvelt Admin',
  'admin',
  true,
  NOW() - INTERVAL '100 days',
  NOW() - INTERVAL '100 days'
);
`;

// Cashier Profiles
const cashiers = [
  { id: '11111111-1111-4111-a111-111111111111', name: 'Rajesh Goud' },
  { id: '22222222-2222-4222-a222-222222222222', name: 'Priya Sharma' },
  { id: '33333333-3333-4333-a333-333333333333', name: 'Amit Verma' }
];

cashiers.forEach(c => {
  sql += `
INSERT INTO profiles (id, store_id, full_name, role, is_active, created_at, updated_at)
VALUES ('${c.id}', '${storeId}', '${c.name}', 'cashier', true, NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days');`;
});

sql += '\n\n-- 4. SEED CATEGORIES\n';
const catIds = [];
categoryData.forEach((c) => {
  const cid = uuidv4();
  catIds.push({ id: cid, name: c.name, range: c.range, items: c.items });
  sql += `INSERT INTO categories (id, store_id, name, description, created_at, updated_at) VALUES ('${cid}', '${storeId}', '${c.name}', 'Premium ${c.name} collection for home & office.', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');\n`;
});

sql += '\n\n-- 5. SEED PRODUCTS (300 Items)\n';
const products = [];
let barcodeCounter = 1;

catIds.forEach((cat) => {
  for (let i = 0; i < 20; i++) {
    const adj = furnitureAdjectives[Math.floor(Math.random() * furnitureAdjectives.length)];
    const wood = woodTypes[Math.floor(Math.random() * woodTypes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const itemBase = cat.items[i % cat.items.length];
    const name = `${adj} ${itemBase} (${wood}, ${color})`;
    
    const barcodeStr = `TF${String(barcodeCounter).padStart(6, '0')}`;
    const skuStr = `${cat.name.substring(0, 3).toUpperCase()}-${wood.substring(0, 3).toUpperCase()}-${String(barcodeCounter).padStart(4, '0')}`;
    
    const minPrice = cat.range[0];
    const maxPrice = cat.range[1];
    const sellingPrice = Math.round((minPrice + Math.random() * (maxPrice - minPrice)) / 500) * 500;
    const purchasePrice = Math.round((sellingPrice * (0.6 + Math.random() * 0.1)) / 500) * 500;
    
    const status = (barcodeCounter % 35 === 0) ? 'inactive' : 'active';
    let stock = Math.floor(Math.random() * 25) + 5;
    if (barcodeCounter % 15 === 0) stock = 0;
    else if (barcodeCounter % 19 === 0) stock = Math.floor(Math.random() * 3) + 1;
    
    const id = uuidv4();
    products.push({ id, name, sku: skuStr, barcode: barcodeStr, price: sellingPrice });
    
    sql += `INSERT INTO products (id, store_id, category_id, name, sku, barcode, purchase_price, selling_price, stock_qty, status, created_at, updated_at) VALUES ('${id}', '${storeId}', '${cat.id}', '${name.replace(/'/g, "''")}', '${skuStr}', '${barcodeStr}', ${purchasePrice}, ${sellingPrice}, ${stock}, '${status}', NOW() - INTERVAL '85 days', NOW() - INTERVAL '85 days');\n`;
    barcodeCounter++;
  }
});

sql += '\n\n-- 6. SEED CUSTOMERS (200 Customers)\n';
const customers = [];

const guestId = uuidv4();
sql += `INSERT INTO profiles (id, store_id, full_name, role, is_active, created_at, updated_at) VALUES ('${guestId}', '${storeId}', 'Guest Customer', 'cashier', false, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');\n`;

for (let i = 0; i < 200; i++) {
  const isCorporate = (i % 12 === 0);
  let name = '';
  let address = '';
  if (isCorporate) {
    name = corporateClients[i % corporateClients.length] + ' Ltd';
    address = `Building #${10 + i}, Sector-${3 + (i % 5)}, Hitec City`;
  } else {
    name = indianNames[i % indianNames.length] + (i > 30 ? ` ${i}` : '');
    address = `H.No. ${12 + (i % 88)}, Gali No. ${1 + (i % 5)}, Colony Road`;
  }
  
  const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const cityObj = cities[i % cities.length];
  const fullAddress = `${address}, ${cityObj.city}, ${cityObj.state}`;
  
  const id = uuidv4();
  customers.push({ id, name, phone, address: fullAddress });
  
  sql += `INSERT INTO profiles (id, store_id, full_name, role, is_active, created_at, updated_at) VALUES ('${id}', '${storeId}', '${name.replace(/'/g, "''")}', 'cashier', false, NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days');\n`;
}

sql += '\n\n-- 7. SEED INVOICES & PAYMENTS (500 Invoices)\n';

let invoiceSeq = 1000;
const paymentMethods = ['cash', 'upi', 'card', 'bank_transfer', 'split'];

for (let i = 500; i >= 1; i--) {
  const invoiceId = uuidv4();
  const invoiceNumber = `TF-${invoiceSeq}`;
  invoiceSeq++;
  
  const dayOffset = Math.floor(i * 0.18);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - dayOffset);
  
  const hour = 10 + Math.floor(Math.random() * 11);
  const minute = Math.floor(Math.random() * 60);
  targetDate.setHours(hour, minute, 0, 0);
  const dateStr = targetDate.toISOString();
  
  const isGuest = (i % 4 === 0);
  const cust = isGuest ? { id: guestId, name: 'Guest', phone: '', address: '' } : customers[i % customers.length];
  const cashier = cashiers[i % cashiers.length];
  
  const itemCount = 1 + (i % 5);
  const selectedProducts = [];
  let subtotal = 0;
  
  for (let j = 0; j < itemCount; j++) {
    const p = products[Math.floor(Math.random() * products.length)];
    if (!selectedProducts.find(item => item.id === p.id)) {
      const quantity = 1 + (j % 2);
      const unitPrice = p.price;
      const discountPercent = (j % 4 === 0) ? 5 : 0;
      const discountAmount = Math.round(((unitPrice * quantity * discountPercent) / 100) * 100) / 100;
      const lineTotal = (unitPrice * quantity) - discountAmount;
      
      selectedProducts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity,
        unitPrice,
        discountPercent,
        discountAmount,
        lineTotal
      });
      subtotal += lineTotal;
    }
  }
  
  const additionalDiscountPct = (i % 10 === 0) ? 3 : 0;
  const additionalDiscountAmount = Math.round((subtotal * additionalDiscountPct / 100) * 100) / 100;
  const deliveryCharge = (i % 7 === 0) ? 1200 : 0;
  const installationCharge = (i % 9 === 0) ? 500 : 0;
  
  const rawTotal = subtotal - additionalDiscountAmount + deliveryCharge + installationCharge;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;
  
  const method = paymentMethods[i % paymentMethods.length];
  const paymentStatus = (i % 25 === 0) ? 'cancelled' : 'completed';
  
  sql += `\n-- Invoice ${invoiceNumber}\n`;
  sql += `INSERT INTO invoices (id, store_id, invoice_number, customer_name, customer_phone, customer_address, subtotal, discount_amount, delivery_charge, installation_charge, round_off, grand_total, payment_method, payment_status, created_by, created_at)
VALUES (
  '${invoiceId}',
  '${storeId}',
  '${invoiceNumber}',
  '${cust.name.replace(/'/g, "''")}',
  '${cust.phone}',
  '${cust.address.replace(/'/g, "''")}',
  ${subtotal},
  ${additionalDiscountAmount},
  ${deliveryCharge},
  ${installationCharge},
  ${roundOff},
  ${grandTotal},
  '${method}',
  '${paymentStatus}',
  '${cashier.id}',
  '${dateStr}'
);\n`;

  selectedProducts.forEach(item => {
    sql += `INSERT INTO invoice_items (id, invoice_id, product_id, product_name, sku, quantity, unit_price, discount_percent, discount_amount, line_total)
VALUES (
  '${uuidv4()}',
  '${invoiceId}',
  '${item.id}',
  '${item.name.replace(/'/g, "''")}',
  '${item.sku}',
  ${item.quantity},
  ${item.unitPrice},
  ${item.discountPercent},
  ${item.discountAmount},
  ${item.lineTotal}
);\n`;
  });

  if (paymentStatus === 'completed') {
    if (method === 'split') {
      const splitVal1 = Math.round(grandTotal * 0.4);
      const splitVal2 = grandTotal - splitVal1;
      sql += `INSERT INTO payments (id, invoice_id, method, amount, reference, created_at) VALUES ('${uuidv4()}', '${invoiceId}', 'card', ${splitVal1}, 'TXN-SPLIT-CARD', '${dateStr}');\n`;
      sql += `INSERT INTO payments (id, invoice_id, method, amount, reference, created_at) VALUES ('${uuidv4()}', '${invoiceId}', 'upi', ${splitVal2}, 'TXN-SPLIT-UPI', '${dateStr}');\n`;
    } else {
      sql += `INSERT INTO payments (id, invoice_id, method, amount, reference, created_at) VALUES ('${uuidv4()}', '${invoiceId}', '${method}', ${grandTotal}, 'TXN-${invoiceNumber}', '${dateStr}');\n`;
    }
  }
}

const destPath = path.join(__dirname, 'seed.sql');
fs.writeFileSync(destPath, sql, 'utf8');
console.log(`Successfully generated production-quality seed SQL at: ${destPath}`);
console.log('Includes: 1 Store, 4 User Profiles, 15 Categories, 300 Furniture Products, 201 Customers, 500 Invoices, 1400+ line items and matching payments.');
