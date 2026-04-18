import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat, NotFoundException } from "@zxing/library";

export default function BarcodeScanner({
  onResult,
  onError,
}: {
  onResult: (text: string) => void;
  onError?: (err: any) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  const stopScanner = useCallback(() => {
    if (readerRef.current) {
      readerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(() => {
    if (!videoRef.current) return;
    setCameraError(null);
    lastScannedRef.current = null;

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_8,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.QR_CODE,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 150,
    });
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText();
          // Debounce: ignore duplicate scans within 2 seconds
          if (lastScannedRef.current === text) return;
          lastScannedRef.current = text;

          console.log("✅ Barcode scanned:", text);
          stopScanner();
          setIsScanning(false);
          onResult(text);
        } else if (err && !(err instanceof NotFoundException)) {
          console.error("Scan error:", err);
          if (onError) onError(err);
        }
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCameraError(
          "Camera access denied or not available. Please allow camera permission and try again."
        );
      });
  }, [onResult, onError, stopScanner]);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isScanning, startScanner, stopScanner]);

  const handleManualLookup = () => {
    const barcode = inputRef.current?.value.trim();
    if (barcode) {
      onResult(barcode);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Camera View */}
      {isScanning ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-black">
          <video
            ref={videoRef}
            className="w-full h-56 object-cover"
            muted
            playsInline
          />
          {/* Scan targeting overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-24">
              {/* Corner markers */}
              <span className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-primary rounded-tl-md" />
              <span className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-primary rounded-tr-md" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-primary rounded-bl-md" />
              <span className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-primary rounded-br-md" />
              {/* Scan line animation */}
              <span className="absolute left-1 right-1 top-1/2 h-0.5 bg-primary/70 animate-pulse" />
            </div>
          </div>
          <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/80 font-medium bg-black/40 py-1">
            Align barcode within the frame
          </p>
        </div>
      ) : (
        <button
          onClick={() => setIsScanning(true)}
          className="w-full bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
        >
          📷 Scan Another Barcode
        </button>
      )}

      {/* Camera error */}
      {cameraError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
          {cameraError}
        </div>
      )}

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-muted" />
        <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-medium tracking-widest uppercase">
          or enter manually
        </span>
        <div className="flex-grow border-t border-muted" />
      </div>

      {/* Manual Entry */}
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter barcode number"
          className="w-full px-4 py-3 border-2 border-primary/30 rounded-lg bg-background text-foreground font-mono text-lg placeholder-muted-foreground focus:border-primary outline-none transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleManualLookup();
          }}
        />
        <button
          onClick={handleManualLookup}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          🔍 Lookup Product
        </button>
      </div>

      {/* Hint */}
      <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-1">
        <p>💡 <strong>Tips for better scanning:</strong></p>
        <p>• Hold the barcode steady &amp; well-lit</p>
        <p>• Keep 10–20 cm distance from camera</p>
        <p>• Supports EAN-8, EAN-13, UPC, Code128 &amp; more</p>
      </div>
    </div>
  );
}
