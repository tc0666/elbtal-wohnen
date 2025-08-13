import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableLabels: string[];
  onCreated?: () => void;
}

const ANREDE = [
  { value: 'herr', label: 'Herr' },
  { value: 'frau', label: 'Frau' },
  { value: 'divers', label: 'Divers' },
];

const AddLeadDialog: React.FC<AddLeadDialogProps> = ({ open, onOpenChange, availableLabels, onCreated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [anrede, setAnrede] = useState<string | undefined>();
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [nachricht, setNachricht] = useState('');
  const [strasse, setStrasse] = useState('');
  const [nummer, setNummer] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [leadLabel, setLeadLabel] = useState<string>('none');

  const labels = useMemo(() => Array.from(new Set(availableLabels)), [availableLabels]);

  const reset = () => {
    setAnrede(undefined);
    setVorname('');
    setNachname('');
    setEmail('');
    setTelefon('');
    setNachricht('');
    setStrasse('');
    setNummer('');
    setPlz('');
    setOrt('');
    setLeadLabel('none');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Kein Admin-Token gefunden');

      const payload = {
        action: 'create_contact_request',
        token,
        anrede,
        vorname,
        nachname,
        email,
        telefon,
        nachricht,
        strasse: strasse || null,
        nummer: nummer || null,
        plz: plz || null,
        ort: ort || null,
        lead_label: leadLabel === 'none' ? null : leadLabel,
      };

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: payload,
      });
      if (error) throw error;

      toast({ title: 'Lead erstellt', description: `${vorname} ${nachname} wurde hinzugefügt.` });
      onOpenChange(false);
      reset();
      onCreated?.();
    } catch (err: any) {
      console.error('Create lead error:', err);
      toast({ title: 'Fehler', description: err.message || 'Lead konnte nicht erstellt werden.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lead hinzufügen</DialogTitle>
          <DialogDescription>Füge einen neuen Lead manuell hinzu.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Select value={anrede ?? 'none'} onValueChange={(v) => setAnrede(v === 'none' ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Anrede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine</SelectItem>
                  {ANREDE.map(a => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Vorname" value={vorname} onChange={(e) => setVorname(e.target.value)} required />
            <Input placeholder="Nachname" value={nachname} onChange={(e) => setNachname(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="email" placeholder="E‑Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input placeholder="Telefon" value={telefon} onChange={(e) => setTelefon(e.target.value)} required />
            <Select value={leadLabel} onValueChange={setLeadLabel}>
              <SelectTrigger>
                <SelectValue placeholder="Label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ohne Label</SelectItem>
                {labels.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Straße" value={strasse} onChange={(e) => setStrasse(e.target.value)} />
            <Input placeholder="Nr." value={nummer} onChange={(e) => setNummer(e.target.value)} />
            <Input placeholder="PLZ" value={plz} onChange={(e) => setPlz(e.target.value)} />
            <Input placeholder="Ort" value={ort} onChange={(e) => setOrt(e.target.value)} />
          </div>

          <Textarea placeholder="Nachricht" value={nachricht} onChange={(e) => setNachricht(e.target.value)} required rows={5} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Abbrechen</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Speichern…' : 'Speichern'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadDialog;
