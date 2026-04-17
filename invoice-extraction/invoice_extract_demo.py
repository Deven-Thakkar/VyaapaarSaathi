import requests
import json
import pandas as pd
import re

# =========================
# File Name
# =========================
filename = "FlipkartInvoice.pdf"

# =========================
# API KEY
# =========================
API_KEY = "K82878004788957"

url = "https://api.ocr.space/parse/image"

# =========================
# OCR Request
# =========================
with open(filename, 'rb') as f:
    response = requests.post(
        url,
        files={"file": f},
        data={
            "apikey": API_KEY,
            "language": "eng",
            "isTable": True,
            "scale": True
        }
    )

result = response.json()
text = result["ParsedResults"][0]["ParsedText"]

lines = [line.strip() for line in text.split("\n") if line.strip()]

# =========================
# Vendor
# =========================
vendor = next((l for l in lines if "sold by" in l.lower()), None)

# =========================
# Invoice Number
# =========================
invoice_number = next((l for l in lines if "invoice no" in l.lower()), None)

# =========================
# Dates
# =========================
order_date = next((re.search(r'\d{2}-\d{2}-\d{4}', l).group()
                   for l in lines if "order date" in l.lower()), None)

invoice_date = next((re.search(r'\d{2}-\d{2}-\d{4}', l).group()
                     for l in lines if "invoice date" in l.lower()), None)

# =========================
# Find Table Section
# =========================
start = None
end = None

for i, line in enumerate(lines):
    if "product" in line.lower() and "qty" in line.lower():
        start = i
    
    if "grand total" in line.lower():
        end = i
        break

# =========================
# Extract Items
# =========================
items = []
tax = None

if start and end:
    table_lines = lines[start:end]

    for line in table_lines:
        # Skip total rows
        if "total" in line.lower():
            continue
        numbers = re.findall(r'\d+\.\d+', line)
        if len(numbers) >= 2:
            item_name = re.sub(r'\d+.*', '', line).strip()
            price = numbers[0]
            total = numbers[-1]
            # tax extraction
            if len(numbers) >= 3:
                tax = numbers[1]
            qty_match = re.search(r'\s(\d)\s', line)
            qty = qty_match.group(1) if qty_match else "1"
            items.append({
                "item": item_name,
                "quantity": qty,
                "price": price,
                "tax": tax,
                "total": total
            })

# =========================
# Grand Total
# =========================
grand_total = None

for line in lines:
    if "grand total" in line.lower():
        match = re.search(r'\d+\.\d+', line)
        if match:
            grand_total = match.group()

# =========================
# Final Output
# =========================
data = {
    "Vendor": vendor,
    "Invoice Number": invoice_number,
    "Order Date": order_date,
    "Invoice Date": invoice_date,
    "Items": items,
    "Grand Total": grand_total
}

print("\nFinal Structured Output:\n")
print(json.dumps(data, indent=2))

# Optional: display as DataFrame if running in Jupyter
try:
    import IPython
    df = pd.DataFrame(items)
    if hasattr(IPython, 'display'):
        IPython.display.display(df)
except ImportError:
    pass
