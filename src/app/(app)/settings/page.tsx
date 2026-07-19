'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { QRCodeSVG } from '@/components/products/labels/QRCodeSVG'

const TABS = [
  { id: 'store', label: '🏪 Store Info' },
  { id: 'qrcode', label: '🔳 QR Code' },
  { id: 'printer', label: '🖨️ Printer' },
  { id: 'users', label: '👥 Users' },
  { id: 'backup', label: '💾 Backup' },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl space-y-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const { store, profile, refreshProfile, isAdmin } = useAuth()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('store')
  const [isSaving, setIsSaving] = useState(false)

  const [storeForm, setStoreForm] = useState({
    name: '',
    legal_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    invoice_prefix: 'INV-',
    invoice_footer: 'Thank you for shopping with us!',
    currency_symbol: '₹',
  })

  useEffect(() => {
    if (store) {
      setStoreForm({
        name: store.name ?? '',
        legal_name: store.legal_name ?? '',
        address: store.address ?? '',
        city: store.city ?? '',
        state: store.state ?? '',
        pincode: store.pincode ?? '',
        phone: store.phone ?? '',
        email: store.email ?? '',
        invoice_prefix: store.invoice_prefix ?? 'INV-',
        invoice_footer: store.invoice_footer ?? 'Thank you for shopping with us!',
        currency_symbol: store.currency_symbol ?? '₹',
      })
    }
  }, [store])

  const handleSaveStore = async () => {
    if (!store?.id) return
    setIsSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('stores')
        .update(storeForm)
        .eq('id', store.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Store settings saved!')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = "w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
  const inputStyle = {
    background: 'var(--secondary-bg)',
    border: '1.5px solid var(--border)',
    color: 'var(--text-primary)',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--primary)'
    e.target.style.boxShadow = '0 0 0 3px rgba(0,217,217,0.1)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure your store and billing preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--secondary-bg)' }}>
        {TABS.filter(t => t.id !== 'users' || isAdmin).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 h-9 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Info Tab */}
      {activeTab === 'store' && (
        <div className="space-y-4">
          <SectionCard title="Store Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Store Name *">
                <input type="text" value={storeForm.name}
                  onChange={e => setStoreForm(p => ({ ...p, name: e.target.value }))}
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="Legal Name">
                <input type="text" value={storeForm.legal_name}
                  onChange={e => setStoreForm(p => ({ ...p, legal_name: e.target.value }))}
                  placeholder="For official documents"
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>
            <Field label="Address">
              <input type="text" value={storeForm.address}
                onChange={e => setStoreForm(p => ({ ...p, address: e.target.value }))}
                className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="City">
                <input type="text" value={storeForm.city}
                  onChange={e => setStoreForm(p => ({ ...p, city: e.target.value }))}
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="State">
                <input type="text" value={storeForm.state}
                  onChange={e => setStoreForm(p => ({ ...p, state: e.target.value }))}
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="PIN Code">
                <input type="text" value={storeForm.pincode}
                  onChange={e => setStoreForm(p => ({ ...p, pincode: e.target.value }))}
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input type="tel" value={storeForm.phone}
                  onChange={e => setStoreForm(p => ({ ...p, phone: e.target.value }))}
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="Email">
                <input type="email" value={storeForm.email}
                  onChange={e => setStoreForm(p => ({ ...p, email: e.target.value }))}
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Invoice Customization">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Invoice Prefix" hint="e.g. INV-, TF-, BILL-">
                <input type="text" value={storeForm.invoice_prefix}
                  onChange={e => setStoreForm(p => ({ ...p, invoice_prefix: e.target.value }))}
                  placeholder="INV-"
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="Currency Symbol">
                <input type="text" value={storeForm.currency_symbol}
                  onChange={e => setStoreForm(p => ({ ...p, currency_symbol: e.target.value }))}
                  className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>
            <Field label="Invoice Footer Message">
              <textarea
                value={storeForm.invoice_footer}
                onChange={e => setStoreForm(p => ({ ...p, invoice_footer: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </Field>
          </SectionCard>

          <button
            onClick={handleSaveStore}
            disabled={isSaving}
            className="h-11 px-8 rounded-xl font-bold text-sm flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #00D9D9, #35F5FF)',
              color: '#0F172A',
              cursor: isSaving ? 'wait' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : '✓ Save Settings'}
          </button>
        </div>
      )}

      {/* QR Code Settings */}
      {activeTab === 'qrcode' && (
        <div className="space-y-4">
          <SectionCard title="QR Code Configuration">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default QR Code Format">
                <select className={inputClass} style={inputStyle} defaultValue="QR_STANDARD">
                  <option value="QR_STANDARD">Standard QR Code (Version 2) (Recommended)</option>
                  <option value="QR_MICRO">Compact Micro QR Code</option>
                  <option value="QR_HIGH_DENSITY">High Density Matrix</option>
                </select>
              </Field>
              <Field label="Label Template Size">
                <select className={inputClass} style={inputStyle} defaultValue="100x150">
                  <option value="100x150">Large Tag (100×150mm)</option>
                  <option value="80x120">Standard Furniture (80×120mm)</option>
                  <option value="70x100">Medium Tag (70×100mm)</option>
                  <option value="50x75">Compact Tag (50×75mm)</option>
                  <option value="thermal_roll">Thermal Roll (58mm continuous)</option>
                  <option value="a4_grid">A4 Sheet Grid (2×4 Labels)</option>
                </select>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="QR Label Preview">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Large Tag', size: '100×150mm' },
                { name: 'Standard Tag', size: '80×120mm' },
                { name: 'Compact Tag', size: '50×75mm' },
              ].map(item => (
                <div key={item.name}
                  className="p-4 rounded-xl text-center border cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
                  style={{ background: 'var(--secondary-bg)', borderColor: 'var(--border)' }}>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <QRCodeSVG value="TF-DEMO-SKU-1001" size={48} darkColor="#0F172A" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{item.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Printer Settings */}
      {activeTab === 'printer' && (
        <SectionCard title="Printer Configuration">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Receipt Width" hint="80mm for thermal printer, A4 for laser">
              <select className={inputClass} style={inputStyle} defaultValue="80mm">
                <option value="58mm">58mm Thermal</option>
                <option value="80mm">80mm Thermal (Recommended)</option>
                <option value="A4">A4 Paper</option>
              </select>
            </Field>
            <Field label="Auto Print on Save">
              <select className={inputClass} style={inputStyle} defaultValue="false">
                <option value="false">Manual Print</option>
                <option value="true">Auto Print</option>
              </select>
            </Field>
          </div>
          <div
            className="p-4 rounded-lg text-sm"
            style={{ background: 'var(--info-bg)', color: 'var(--info)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <strong>Thermal Printer Setup:</strong> Configure your thermal printer as the default printer in your OS settings.
            The 80mm layout is optimized for ESC/POS thermal printers. Press Print on any invoice to test.
          </div>
        </SectionCard>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && isAdmin && (
        <SectionCard title="User Management">
          <div
            className="p-4 rounded-lg text-sm"
            style={{ background: 'var(--info-bg)', color: 'var(--info)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            To invite a cashier: send them the store registration link and ask them to sign up.
            Then set their role to &quot;cashier&quot; from this page.
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            User management via Supabase dashboard at supabase.com. Full user invite UI coming soon.
          </p>
        </SectionCard>
      )}

      {/* Backup */}
      {activeTab === 'backup' && (
        <SectionCard title="Data Backup & Export">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Export your billing data for backup or analysis.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              📊 Export Bills (CSV)
            </button>
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium"
              style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              📦 Export Products (CSV)
            </button>
          </div>
          <div
            className="p-4 rounded-lg text-sm"
            style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            Your data is secure and you can backup anytime.
          </div>
        </SectionCard>
      )}
    </div>
  )
}
