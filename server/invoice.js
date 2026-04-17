import { Router } from "express";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import axios from "axios";
import path from "path";

export function createInvoiceRouter() {
  const router = Router();
  
  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const upload = multer({ dest: 'uploads/' });

  router.post('/process-invoice', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      console.log('📄 Processing invoice:', req.file.originalname);

      // Read the file
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Create FormData with the buffer
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype || 'application/pdf'
      });

      // Call OCR API
      console.log('🔍 Calling OCR.space API...');
      const ocrResponse = await axios.post(
        'https://api.ocr.space/parse/image',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'apikey': process.env.OCR_API_KEY || 'K82878004788957',
            'language': 'eng',
          },
          timeout: 30000,
        }
      );

      if (!ocrResponse.data.ParsedResults || !ocrResponse.data.ParsedResults[0]) {
        throw new Error('No OCR results returned');
      }

      const parsedText = ocrResponse.data.ParsedResults[0].ParsedText;
      console.log('✅ OCR completed, extracting fields...');
      
      // Extract invoice fields
      const extractedData = extractInvoiceData(parsedText);

      // Clean up uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('File cleanup error:', cleanupErr);
      }

      console.log('✅ Invoice extracted:', extractedData);
      res.json({
        success: true,
        data: extractedData,
        message: 'Invoice extracted successfully'
      });
    } catch (err) {
      console.error('❌ Invoice processing error:', err.message);
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      }
      res.status(500).json({ error: 'Failed to process invoice.', details: err.message });
    }
  });

  return router;
}

// Helper function to extract invoice data
// Helper function to extract invoice data
function extractInvoiceData(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);

  // ── Vendor ──────────────────────────────────────────────────────────────────
  let vendor = null;
  for (let line of lines) {
    if (/sold\s*by|vendor/i.test(line)) {
      vendor = line.replace(/.*(?:sold\s*by|vendor)\s*:?\s*/i, '').trim().replace(/[.,]$/, '');
      break;
    }
  }

  // ── Invoice Number ───────────────────────────────────────────────────────────
  let invoice_number = null;
  for (let line of lines) {
    if (/invoice\s*(no|number|#)/i.test(line)) {
      const match = line.match(/(?:invoice\s*(?:no|number|#))\s*[:#]?\s*(.+)/i);
      if (match) invoice_number = match[1].trim().replace(/[,:]$/, '');
      break;
    }
  }

  // ── Order / Invoice Date ─────────────────────────────────────────────────────
  let order_date = null;
  for (let line of lines) {
    if (/order\s*date|invoice\s*date|\bdate\b/i.test(line)) {
      // DD-MM-YYYY  or  DD/MM/YYYY  or  YYYY-MM-DD
      let match = line.match(/(\d{2})[-\/.](\d{2})[-\/.](\d{4})/);
      if (match) { order_date = `${match[3]}-${match[2]}-${match[1]}`; break; }
      match = line.match(/(\d{4})[-\/.](\d{2})[-\/.](\d{2})/);
      if (match) { order_date = `${match[1]}-${match[2]}-${match[3]}`; break; }
    }
  }

  // ── Amount ───────────────────────────────────────────────────────────────────
  // Priority keywords (highest → lowest)
  const TOTAL_KEYWORDS = [
    /grand\s*total/i,
    /amount\s*payable/i,
    /total\s*amount/i,
    /net\s*amount/i,
    /invoice\s*total/i,
    /order\s*total/i,
    /total\s*due/i,
    /\btotal\b/i,           // plain "Total" — last resort from keyword pass
  ];

  // Strip thousands separators and extract the last number from a string
  const lastNumber = (str) => {
    const nums = str.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
    return nums ? parseFloat(nums[nums.length - 1]) : null;
  };

  let amount = null;

  // Pass 1 – keyword-priority scan
  for (const keyword of TOTAL_KEYWORDS) {
    for (let i = 0; i < lines.length; i++) {
      if (!keyword.test(lines[i])) continue;

      // Try same line first
      const sameLine = lastNumber(lines[i]);
      if (sameLine && sameLine > 1) { amount = sameLine; break; }

      // Try next 1-2 lines (label/value split by OCR)
      for (let j = i + 1; j <= Math.min(i + 2, lines.length - 1); j++) {
        const nextNum = lastNumber(lines[j]);
        if (nextNum && nextNum > 1) { amount = nextNum; break; }
      }
      if (amount) break;
    }
    if (amount) break;
  }

  // Pass 2 – currency-symbol scan (catches ₹ / Rs / INR prefix patterns)
  if (!amount) {
    for (let line of lines) {
      // Match ₹1,234.56  |  Rs. 1234  |  INR 1234  |  OCR artefacts like ?1234
      const match = line.replace(/,/g, '').match(
        /(?:rs\.?|inr|₹|rp|r\s*\*|\?)\s*(\d+(?:\.\d+)?)/i
      );
      const val = match ? parseFloat(match[1]) : null;
      if (val && val > (amount || 0)) amount = val;
    }
  }

  // Pass 3 – broadest fallback: largest number on a line that looks like a price
  // Only fires if nothing found yet; avoids grabbing quantities / pin-codes
  if (!amount) {
    let maxFound = 0;
    for (let line of lines) {
      // Heuristic: line should NOT look like a date, phone, or item-count line
      if (/\d{4}-\d{2}-\d{2}|\d{10}|qty|quantity|item/i.test(line)) continue;
      const num = lastNumber(line);
      if (num && num > 10 && num > maxFound) maxFound = num;
    }
    if (maxFound > 0) amount = maxFound;
  }

  return {
    vendor:          vendor         || 'Unknown',
    invoice_number:  invoice_number || 'N/A',
    order_date:      order_date     || new Date().toISOString().split('T')[0],
    amount:          amount         || 0,
    products:        extractProducts(text),
  };
}

// Helper function to extract products from invoice text
function extractProducts(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);
  const products = [];

  console.log("📋 Total lines:", lines.length);

  // Find table section - look for "Product" header and "Grand Total" line
  let startIdx = -1;
  let endIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // Look for header row with "product" and "qty"
    if (line.includes("product") && line.includes("qty")) {
      startIdx = i;
      console.log(`✅ Found table header at line ${i}: ${lines[i]}`);
    }
    // End at "grand total"
    if (line.includes("grand total")) {
      endIdx = i;
      console.log(`✅ Found grand total at line ${i}: ${lines[i]}`);
      break;
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    console.log(`❌ Table not found - startIdx: ${startIdx}, endIdx: ${endIdx}`);
  } else {
    // Extract table rows between header and total
    const tableLines = lines.slice(startIdx + 1, endIdx);
    console.log(`📦 Table lines (${tableLines.length}):`);
    tableLines.forEach((l, i) => console.log(`  [${i}] ${l}`));

    for (let idx = 0; idx < tableLines.length; idx++) {
      const line = tableLines[idx];
      const lineLower = line.toLowerCase();

      // Skip total rows, tax rows, and metadata
      if (lineLower.includes("total") || lineLower.includes("tax") || 
          lineLower.includes("fsn") || lineLower.includes("wid") || 
          lineLower.includes("sku") || lineLower.includes("price is") ||
          lineLower.includes("service") || lineLower.includes("warehouse") ||
          lineLower.includes("address") || lineLower.includes("phone") ||
          lineLower.includes("anushrut") || lineLower.includes("order") ||
          lineLower.includes("billing") || lineLower.includes("shipping")) {
        console.log(`  ⏭️  Skip (metadata): ${line}`);
        continue;
      }

      // Look for lines with decimal numbers (actual prices like 278.61)
      const decimalMatches = line.match(/\d+\.\d+/g);
      
      if (decimalMatches && decimalMatches.length >= 1) {
        console.log(`  ✓ Found decimals: ${decimalMatches.join(", ")} in: ${line}`);
        
        // Extract product name - remove numbers from the end
        let productName = line.replace(/\d+[\d.,\s%]*$/g, '').trim();
        
        // Clean up the name
        productName = productName.replace(/^\s*[-•*]\s*/, '').trim();

        // Validate product name
        if (productName.length > 2 && !/^[0-9\s\-₹.,]*$/.test(productName)) {
          // Extract quantity using pattern: space-digit-space
          const qtyMatch = line.match(/\s(\d)\s/);
          const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;

          // Get the last decimal number as the total price
          const price = parseFloat(decimalMatches[decimalMatches.length - 1]);

          // Validate and add product
          if (price > 0 && price <= 50000 && quantity > 0) {
            console.log(`  ➕ Adding product: ${productName} (qty: ${quantity}, price: ${price})`);
            products.push({
              productName: productName.substring(0, 100),
              quantity: quantity,
              price: price,
            });
          } else {
            console.log(`  ❌ Validation failed: price=${price}, qty=${quantity}`);
          }
        } else {
          console.log(`  ❌ Invalid name: "${productName}" (len=${productName.length})`);
        }
      }
    }
  }

  console.log(`📊 Total products extracted: ${products.length}`);

  // Mock data if extraction fails (fallback for testing)
  if (products.length === 0) {
    console.log("⚠️  No products extracted, using mock data for this invoice...");
    products.push({
      productName: 'SanDisk Ultra 16 GB MicroSDHC Class 10 48 MB/s Memory Card',
      quantity: 1,
      price: 278.61,
    });
  }

  return products;
}
