import { useRef } from "react";

export default function BarcodeScanner({
  onResult,
}: {
  onResult: (text: string) => void;
  onError?: (err: any) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLookup = () => {
    const barcode = inputRef.current?.value.trim();
    if (barcode) {
      console.log("📍 Looking up barcode:", barcode);
      onResult(barcode);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-gradient-to-b from-primary/5 to-transparent p-4 rounded-lg text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          📱 Enter or scan barcode number
        </p>
        <p className="text-xs text-muted-foreground">
          Type the barcode and press Enter or click Lookup
        </p>
      </div>

      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter barcode number"
          className="w-full px-4 py-3 border-2 border-primary/30 rounded-lg bg-background text-foreground font-mono text-lg placeholder-muted-foreground focus:border-primary outline-none transition-colors"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleLookup();
            }
          }}
          autoFocus
        />
        <button
          onClick={handleLookup}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          🔍 Lookup Product
        </button>
      </div>

      <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
        <p>💡 <strong>How to use:</strong></p>
        <p>1. Type the barcode number above</p>
        <p>2. Click Lookup or press Enter</p>
        <p>3. Product details will appear</p>
        <p>4. Confirm price and quantity</p>
        <p>5. Add to cart and complete sale</p>
      </div>
    </div>
  );
}
