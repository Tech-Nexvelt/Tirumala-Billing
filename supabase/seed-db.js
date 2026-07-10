const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('[Seeder] Error: .env.local file not found in root directory.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabaseUrl = getEnvVal('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnvVal('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[Seeder] Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured in .env.local.');
  process.exit(1);
}

console.log(`[Seeder] Initializing admin client for: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const storeId = '29f4e073-bc1d-4071-ae3a-c8718a90f998';

// Helper to generate UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Format date to local Indian YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// Data definitions for Invoices
const indianNames = [
  'Aarav Sharma', 'Aditya Patel', 'Amit Kumar', 'Ananya Iyer', 'Arjun Rao',
  'Deepak Reddy', 'Divya Nair', 'Harish Rao', 'Ishaan Gupta', 'Jyoti Prasad',
  'Karthik Swami', 'Kavitha Hegde', 'Manoj Gowda', 'Neha Deshmukh', 'Pranav Kulkarni',
  'Priya Pillai', 'Rahul Verma', 'Ramesh Chandra', 'Ravi Shankar', 'Sandeep Hegde',
  'Sanjay Dutt', 'Sarita Mishra', 'Siddharth Sen', 'Sneha Rao', 'Suresh Prabhu',
  'Vikram Seth', 'Vivek Oberoi', 'Yash Pal', 'Zeeshan Khan', 'Vijay Mallya'
];

const corporateClients = [
  'Acro Furniture Solutions Ltd', 'Infy Office Layouts Ltd', 'Tata Retail Hub Ltd',
  'Wipro Guest House Ltd', 'Vardhaman Textiles Ltd', 'Apollo Clinics Lounge Ltd'
];

const cities = [
  { city: 'Hyderabad', state: 'Telangana', pin: '500001' },
  { city: 'Secunderabad', state: 'Telangana', pin: '500003' },
  { city: 'Bangalore', state: 'Karnataka', pin: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pin: '600001' }
];

const furnitureAdjectives = ['Royal', 'Premium', 'Classic', 'Modern', 'Minimalist', 'Luxurious', 'Heritage', 'Comfort'];
const woodTypes = ['Teak Wood', 'Rose Wood', 'Mahogany', 'Sheesham Wood', 'Oak Wood'];
const colors = ['Teak Finish', 'Walnut Brown', 'Charcoal Grey', 'Warm Beige', 'Ivory White', 'Ebony Black'];

const categories = [
  { name: 'Sofas', range: [18000, 120000], items: ['3-Seater Sofa', 'L-Shape Sofa Sectional', 'Recliner Sofa', 'Chesterfield Sofa'] },
  { name: 'Beds', range: [15000, 95000], items: ['King Size Bed', 'Queen Size Wooden Bed', 'Single Bed', 'Platform Bed'] },
  { name: 'Dining Tables', range: [20000, 110000], items: ['6-Seater Dining Table', '4-Seater Glass Dining Table', 'Marble Top Dining Table'] },
  { name: 'Dining Chairs', range: [3000, 15000], items: ['Cushioned Dining Chair', 'Solid Wood Dining Chair', 'Rattan Accent Chair'] },
  { name: 'Office Chairs', range: [4500, 35000], items: ['Ergonomic Task Chair', 'Executive High-Back', 'Visitor Stool Chair'] },
  { name: 'TV Units', range: [8000, 45000], items: ['Wall TV Cabinet', 'TV Console Table', 'Modular TV Stand'] },
  { name: 'Coffee Tables', range: [4000, 25000], items: ['Wooden Nesting Table', 'Glass Coffee Table', 'Round Coffee Table'] },
  { name: 'Wardrobes', range: [18000, 130000], items: ['3-Door Wardrobe', '2-Door Sliding Wardrobe', 'Modular Closet'] },
  { name: 'Study Tables', range: [5000, 30000], items: ['Student Study Table', 'Executive Study Desk', 'Folding Laptop Desk'] },
  { name: 'Mattresses', range: [8000, 65000], items: ['Orthopedic Foam Mattress', 'Pocket Spring Mattress', 'Latex Mattress'] },
  { name: 'Dressers', range: [9000, 38000], items: ['Dresser with LED Mirror', 'Compact Dresser chest'] },
  { name: 'Recliners', range: [16000, 75000], items: ['Single Motor Recliner', 'Rocking Recliner Lounge'] },
  { name: 'Outdoor Furniture', range: [12000, 85000], items: ['Patio Bistro Set', 'Outdoor Swing Chair'] },
  { name: 'Storage Cabinets', range: [6000, 32000], items: ['Utility Cabinet', 'Shoe Rack Bench', 'Sideboard Credenza'] },
  { name: 'Bookshelves', range: [5000, 28000], items: ['Ladder Bookshelf', '5-Tier Open Shelf'] }
];

async function seed() {
  try {
    // 1. Delete transactional history to prepare for seed (reverse FK order)
    console.log('[Seeder] Cleaning existing POS transaction data...');
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('invoice_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Evict customers only (profiles with is_active = false)
    await supabase.from('profiles').delete().eq('is_active', false);

    console.log('[Seeder] Creating Store settings...');
    const { error: storeErr } = await supabase.from('stores').upsert({
      id: storeId,
      name: 'Tirumala Furniture',
      legal_name: 'Tirumala Furniture Retailers PVT LTD',
      address: 'Plot 45, Beside Metro Station, KPHB Phase 3, Kukatpally',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500072',
      phone: '+91 90000 12345',
      email: 'contact@tirumalafurniture.com',
      invoice_prefix: 'TF-',
      invoice_footer: 'Thank you for shopping at Tirumala Furniture! Warranty claims require copy of this invoice.',
      currency_symbol: '₹'
    });
    if (storeErr) throw storeErr;

    // Get current logged-in user profile to act as creator of invoices
    const { data: staffList, error: staffErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_active', true)
      .limit(1);

    if (staffErr || !staffList || staffList.length === 0) {
      console.error('[Seeder] Error: No active staff profile found in database profiles table.');
      process.exit(1);
    }
    const creatorId = staffList[0].id;

    // 2. Seed Categories (Bulk Insert)
    console.log('[Seeder] Seeding product categories...');
    const catInserts = categories.map(cat => ({
      id: uuidv4(),
      store_id: storeId,
      name: cat.name,
      description: `Premium ${cat.name} showroom catalog.`
    }));

    const { data: insertedCats, error: catErr } = await supabase
      .from('categories')
      .insert(catInserts)
      .select();
    
    if (catErr) throw catErr;

    const dbCategories = insertedCats.map((dbCat, idx) => ({
      ...dbCat,
      range: categories[idx].range,
      items: categories[idx].items
    }));

    // 3. Seed Products (Bulk Insert 100 items)
    console.log('[Seeder] Seeding 100 furniture products...');
    const productInserts = [];
    let barcodeCounter = 1;

    for (let i = 0; i < 100; i++) {
      const cat = dbCategories[i % dbCategories.length];
      const adj = furnitureAdjectives[Math.floor(Math.random() * furnitureAdjectives.length)];
      const wood = woodTypes[Math.floor(Math.random() * woodTypes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const itemBase = cat.items[i % cat.items.length];
      const name = `${adj} ${itemBase} (${wood}, ${color})`;

      const barcode = `TF${String(barcodeCounter).padStart(6, '0')}`;
      const sku = `${cat.name.substring(0, 3).toUpperCase()}-${wood.substring(0, 3).toUpperCase()}-${String(barcodeCounter).padStart(4, '0')}`;
      
      const minPrice = cat.range[0];
      const maxPrice = cat.range[1];
      const selling_price = Math.round((minPrice + Math.random() * (maxPrice - minPrice)) / 500) * 500;
      const purchase_price = Math.round((selling_price * (0.6 + Math.random() * 0.1)) / 500) * 500;
      
      productInserts.push({
        id: uuidv4(),
        store_id: storeId,
        category_id: cat.id,
        name,
        sku,
        barcode,
        purchase_price,
        selling_price,
        stock_qty: Math.floor(Math.random() * 40) + 10,
        status: 'active'
      });
      barcodeCounter++;
    }

    const { data: dbProducts, error: prodErr } = await supabase
      .from('products')
      .insert(productInserts)
      .select();
    
    if (prodErr) throw prodErr;

    // 4. Generate Customer Metadata lists (used inline inside Invoices)
    console.log('[Seeder] Preparing customer list...');
    const mockCustomers = [];
    for (let i = 0; i < 50; i++) {
      const isCorporate = (i % 8 === 0);
      let name = '';
      let address = '';
      if (isCorporate) {
        name = corporateClients[i % corporateClients.length];
        address = `Building #${20 + i}, Hitec City`;
      } else {
        name = indianNames[i % indianNames.length] + (i > 25 ? ` ${i}` : '');
        address = `H.No. ${100 + i}, Colony Road`;
      }
      
      const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const cityObj = cities[i % cities.length];
      const fullAddress = `${address}, ${cityObj.city}, ${cityObj.state}`;
      mockCustomers.push({ name, phone, address: fullAddress });
    }

    // 5. Build Invoice Headers, Line Items & Payments arrays for Bulk Inserts
    console.log('[Seeder] Seeding 100 historical invoices & payments...');
    let invoiceSeq = 1000;
    const paymentMethods = ['cash', 'upi', 'card', 'split'];

    const invoicesToInsert = [];
    const itemsToInsert = [];
    const paymentsToInsert = [];

    for (let i = 100; i >= 1; i--) {
      const invoiceId = uuidv4();
      const invoiceNumber = `TF-${invoiceSeq}`;
      invoiceSeq++;

      const dayOffset = Math.floor(i * 0.9);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - dayOffset);
      targetDate.setHours(10 + (i % 10), Math.floor(Math.random() * 60), 0, 0);
      const dateStr = targetDate.toISOString();
      const dbDate = formatDate(targetDate);

      const isGuest = (i % 4 === 0);
      const cust = isGuest ? { name: 'Guest Customer', phone: null, address: null } : mockCustomers[i % mockCustomers.length];

      const itemCount = 1 + (i % 3);
      const selectedItems = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const p = dbProducts[(i + j) % dbProducts.length];
        if (!selectedItems.find(item => item.product_id === p.id)) {
          const quantity = 1;
          const unitPrice = p.selling_price;
          const discountPercent = (j % 3 === 0) ? 5 : 0;
          const discountAmount = Math.round(((unitPrice * quantity * discountPercent) / 100) * 100) / 100;
          const lineTotal = (unitPrice * quantity) - discountAmount;

          selectedItems.push({
            product_id: p.id,
            product_name: p.name,
            product_sku: p.sku,
            product_barcode: p.barcode,
            quantity,
            unit_price: unitPrice,
            discount_percent: discountPercent,
            discount_amount: discountAmount,
            line_total: lineTotal
          });
          subtotal += lineTotal;
        }
      }

      const additionalDiscountPct = (i % 8 === 0) ? 3 : 0;
      const additionalDiscountAmount = Math.round((subtotal * additionalDiscountPct / 100) * 100) / 100;
      const deliveryCharge = (i % 6 === 0) ? 1000 : 0;
      const installationCharge = (i % 7 === 0) ? 500 : 0;

      const rawTotal = subtotal - additionalDiscountAmount + deliveryCharge + installationCharge;
      const grandTotal = Math.round(rawTotal);
      const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;

      const method = paymentMethods[i % paymentMethods.length];
      const paymentStatus = 'paid';

      // Insert invoice header object
      invoicesToInsert.push({
        id: invoiceId,
        store_id: storeId,
        invoice_number: invoiceNumber,
        invoice_date: dbDate,
        customer_name: cust.name,
        customer_phone: cust.phone,
        customer_address: cust.address,
        subtotal,
        discount_amount: additionalDiscountAmount,
        delivery_charge: deliveryCharge,
        installation_charge: installationCharge,
        round_off: roundOff,
        grand_total: grandTotal,
        payment_method: method,
        payment_status: paymentStatus,
        status: 'active',
        created_by: creatorId,
        created_at: dateStr
      });

      // Insert line items objects
      for (let idx = 0; idx < selectedItems.length; idx++) {
        const item = selectedItems[idx];
        itemsToInsert.push({
          id: uuidv4(),
          invoice_id: invoiceId,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          product_barcode: item.product_barcode,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          discount_amount: item.discount_amount,
          line_total: item.line_total,
          sort_order: idx
        });
      }

      // Insert payments objects
      if (method === 'split') {
        const amt1 = Math.round(grandTotal * 0.5);
        const amt2 = grandTotal - amt1;
        paymentsToInsert.push({
          id: uuidv4(),
          invoice_id: invoiceId,
          method: 'upi',
          amount: amt1,
          reference: 'TXN-SPLIT-UPI',
          created_at: dateStr
        });
        paymentsToInsert.push({
          id: uuidv4(),
          invoice_id: invoiceId,
          method: 'card',
          amount: amt2,
          reference: 'TXN-SPLIT-CARD',
          created_at: dateStr
        });
      } else {
        paymentsToInsert.push({
          id: uuidv4(),
          invoice_id: invoiceId,
          method: method,
          amount: grandTotal,
          reference: `TXN-${invoiceNumber}`,
          created_at: dateStr
        });
      }
    }

    // Execute bulk transactions
    console.log('[Seeder] Uploading invoice headers...');
    const { error: invoiceBulkErr } = await supabase.from('invoices').insert(invoicesToInsert);
    if (invoiceBulkErr) throw invoiceBulkErr;

    console.log('[Seeder] Uploading invoice line items...');
    const { error: itemsBulkErr } = await supabase.from('invoice_items').insert(itemsToInsert);
    if (itemsBulkErr) throw itemsBulkErr;

    console.log('[Seeder] Uploading payments history...');
    const { error: paymentsBulkErr } = await supabase.from('payments').insert(paymentsToInsert);
    if (paymentsBulkErr) throw paymentsBulkErr;

    console.log('[Seeder] Database seeding completed successfully! ✅');
  } catch (err) {
    console.error('[Seeder] Seeding error:', err);
    process.exit(1);
  }
}

seed();
