import { useState, useRef } from 'react';
import { Plus, Trash2, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import './index.css';

function App() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [items, setItems] = useState([
    {
      id: crypto.randomUUID(),
      thickness: '50mm',
      type: 'windows',
      sizeLength: '',
      sizeBreadth: '',
      position: 'NA',
      quantity: 1,
      unitPrice: 0,
    }
  ]);
  const billRef = useRef(null);

  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        thickness: '50mm',
        type: 'windows',
        sizeLength: '',
        sizeBreadth: '',
        position: 'NA',
        quantity: 1,
        unitPrice: 0,
      }
    ]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  };

  const generateImage = async () => {
    if (!billRef.current) return null;
    
    const originalDisplay = billRef.current.style.display;
    billRef.current.style.display = 'inline-block';
    
    try {
      const dataUrl = await toPng(billRef.current, {
        backgroundColor: '#ffffff',
        style: { margin: '0', boxSizing: 'border-box' }
      });
      billRef.current.style.display = originalDisplay;
      return dataUrl;
    } catch (err) {
      console.error('Error generating Image:', err);
      billRef.current.style.display = originalDisplay;
      return null;
    }
  };

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const handleSaveImage = async () => {
    const imageUrl = await generateImage();
    if (imageUrl) {
      downloadImage(imageUrl, `Bill_${formatDate(date)}.png`);
    }
  };

  const handleWhatsAppShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Bill_${formatDate(date)}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Bill' });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert("Bill image copied to clipboard! Open WhatsApp and paste (Ctrl+V / Cmd+V) to send.");
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      alert("Could not share automatically. Please use 'Save as Image' instead.");
    }
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const advance = advanceAmount ? Number(advanceAmount) : 0;
  const balance = grandTotal - advance;

  const renderBillTable = () => (
    <>
      <div className="print-date" style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
        Date: {formatDate(date)}
      </div>
      <table className="svg-table" style={{ borderCollapse: 'collapse', marginTop: '1rem', whiteSpace: 'nowrap' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', textAlign: 'left', backgroundColor: '#f9fafb', color: '#374151' }}>#</th>
            <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', textAlign: 'left', backgroundColor: '#f9fafb', color: '#374151' }}>Description</th>
            <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', textAlign: 'left', backgroundColor: '#f9fafb', color: '#374151' }}>Size</th>
            <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', textAlign: 'left', backgroundColor: '#f9fafb', color: '#374151' }}>Qty</th>
            <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', textAlign: 'left', backgroundColor: '#f9fafb', color: '#374151' }}>Unit Price</th>
            <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', textAlign: 'left', backgroundColor: '#f9fafb', color: '#374151' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            let parts = [];
            if (item.thickness !== 'NA') parts.push(item.thickness);
            if (item.type !== 'NA') parts.push(item.type);
            if (item.position !== 'NA') parts.push(`(${item.position})`);
            let desc = parts.join(' ');

            let sizeDisplay = '-';
            if (item.sizeLength || item.sizeBreadth) {
              sizeDisplay = `${item.sizeLength || '0'} × ${item.sizeBreadth || '0'}`;
            }

            return (
              <tr key={item.id}>
                <td style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', textTransform: 'capitalize' }}>{desc}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem' }}>{sizeDisplay}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem' }}>₹{item.unitPrice.toFixed(2)}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', fontWeight: '500' }}>₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', fontSize: '1.1rem' }}>Total Amount</td>
            <td style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', fontWeight: '800', fontSize: '1.2rem', color: '#4F46E5' }}>₹{grandTotal.toFixed(2)}</td>
          </tr>
          {advance > 0 && (
            <>
              <tr>
                <td colSpan="5" style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', fontSize: '1.1rem' }}>Advance Amount</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', fontWeight: '700', fontSize: '1.1rem', color: '#059669' }}>₹{advance.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="5" style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', fontSize: '1.1rem' }}>Balance Amount</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '1rem 1.5rem', fontWeight: '800', fontSize: '1.2rem', color: '#DC2626' }}>₹{balance.toFixed(2)}</td>
              </tr>
            </>
          )}
        </tfoot>
      </table>
    </>
  );

  return (
    <div className="app-container">
      <div className="billing-card">
        
        <div className="action-buttons print-hidden">
          <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
            Preview
          </button>
          <button onClick={handleSaveImage} className="btn btn-primary">
            <ImageIcon size={18} />
            Save as Image
          </button>
          <button onClick={handleWhatsAppShare} className="btn btn-success">
            <MessageCircle size={18} />
            Share on WhatsApp
          </button>
        </div>

        <div className="invoice-details print-hidden">
          <div className="input-group">
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
        </div>

        <div className="items-section print-hidden">
          <h2>Items</h2>
          
          <div className="items-list">
            {items.map((item, index) => (
              <div key={item.id} className="item-row">
                <div className="item-index">{index + 1}</div>
                
                <div className="item-grid">
                  <div className="input-group">
                    <label>Thickness</label>
                    <select value={item.thickness} onChange={(e) => updateItem(item.id, 'thickness', e.target.value)}>
                      <option value="50mm">50mm</option>
                      <option value="75mm">75mm</option>
                      <option value="8 ft length">8 ft length</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Type</label>
                    <select value={item.type} onChange={(e) => updateItem(item.id, 'type', e.target.value)}>
                      <option value="windows">Windows</option>
                      <option value="channel">Channel</option>
                      <option value="ventilators">Ventilators</option>
                      <option value="doorframes">Doorframes</option>
                      <option value="corner cover">Corner cover</option>
                      <option value="NA">NA</option>
                    </select>
                  </div>

                  <div className="input-group size-group">
                    <label>Size</label>
                    <div className="size-inputs">
                      <input 
                        type="text" 
                        value={item.sizeLength} 
                        onChange={(e) => updateItem(item.id, 'sizeLength', e.target.value)} 
                        placeholder="L"
                      />
                      <span className="size-x">×</span>
                      <input 
                        type="text" 
                        value={item.sizeBreadth} 
                        onChange={(e) => updateItem(item.id, 'sizeBreadth', e.target.value)} 
                        placeholder="B"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Position</label>
                    <select value={item.position} onChange={(e) => updateItem(item.id, 'position', e.target.value)}>
                      <option value="NA">NA</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity} 
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} 
                    />
                  </div>

                  <div className="input-group">
                    <label>Unit Price</label>
                    <input 
                      type="number" 
                      min="0"
                      value={item.unitPrice || ''} 
                      onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} 
                      placeholder="0.00"
                    />
                  </div>

                  <div className="input-group total-group">
                    <label>Total</label>
                    <div className="item-total">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-danger icon-btn" 
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="add-item-wrapper">
            <button onClick={addItem} className="btn btn-secondary">
              <Plus size={18} />
              Add Another Item
            </button>
          </div>
        </div>

        <div className="advance-section print-hidden">
          <div className="input-group">
            <label>Advance Amount (Optional)</label>
            <input 
              type="number" 
              min="0"
              value={advanceAmount} 
              onChange={(e) => setAdvanceAmount(e.target.value)} 
              placeholder="Enter advance amount"
            />
          </div>
        </div>

        <div className="summary-section print-hidden">
          <div className="summary-content">
            <div className="grand-total">
              <span>Total Amount</span>
              <span className="amount">₹{grandTotal.toFixed(2)}</span>
            </div>
            {advance > 0 && (
              <>
                <div className="advance-total">
                  <span>Advance Amount</span>
                  <span className="amount">₹{advance.toFixed(2)}</span>
                </div>
                <div className="balance-total">
                  <span>Balance Amount</span>
                  <span className="amount">₹{balance.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hidden area used for Image export */}
        <div 
          className="print-only-table" 
          ref={billRef} 
          style={{ display: 'none', background: '#ffffff', width: 'max-content', padding: '2rem', fontFamily: 'Inter, sans-serif' }}
        >
          {renderBillTable()}
        </div>

        {showPreview && (
          <div className="preview-modal">
            <div className="preview-content">
              <div className="preview-header">
                <h2>Bill Preview</h2>
                <button onClick={() => setShowPreview(false)} className="btn btn-danger">Close</button>
              </div>
              <div className="preview-body" style={{ background: '#fff', padding: '1rem', overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                {renderBillTable()}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
