import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Calendar, Building2, Eye, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

interface LeadRequest {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  created_at: string;
  lead_label?: 'hot_lead' | 'warm' | 'cold' | null;
  status?: string;
  property?: { title: string; address: string } | null;
}

const labelOptions = [
  { value: '', label: 'Ohne Label' },
  { value: 'hot_lead', label: 'HOT LEAD' },
  { value: 'warm', label: 'WARM' },
  { value: 'cold', label: 'COLD' },
] as const;

const labelToBadge = (label?: string | null) => {
  switch (label) {
    case 'hot_lead':
      return { text: 'HOT LEAD', variant: 'destructive' as const };
    case 'warm':
      return { text: 'WARM', variant: 'default' as const };
    case 'cold':
      return { text: 'COLD', variant: 'secondary' as const };
    default:
      return { text: '—', variant: 'outline' as const };
  }
};

const LeadsManagement: React.FC = () => {
  const [leads, setLeads] = useState<LeadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<LeadRequest | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 15;

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_contact_requests', token }
      });

      if (data?.requests) {
        setLeads(data.requests as LeadRequest[]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({ title: 'Fehler', description: 'Leads konnten nicht geladen werden.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateLeadLabel = async (id: string, lead_label: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'update_contact_request_lead_label', token, id, lead_label }
      });
      if (data?.request) {
        toast({ title: 'Label aktualisiert', description: 'Lead-Label wurde gespeichert.' });
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead label:', error);
      toast({ title: 'Fehler', description: 'Label konnte nicht gespeichert werden.', variant: 'destructive' });
    }
  };

  const filteredLeads = filterLabel === 'all' ? leads : leads.filter(l => (l.lead_label || '') === filterLabel);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Leads</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Leads werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex items-center gap-4">
          <Select value={filterLabel} onValueChange={(v) => { setFilterLabel(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Label filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Labels</SelectItem>
              <SelectItem value="hot_lead">HOT LEAD</SelectItem>
              <SelectItem value="warm">WARM</SelectItem>
              <SelectItem value="cold">COLD</SelectItem>
              <SelectItem value="">Ohne Label</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''}{filterLabel !== 'all' && ' (gefiltert)'}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentLeads.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Name</TableHead>
                      <TableHead className="min-w-[160px]">Kontakt</TableHead>
                      <TableHead className="min-w-[160px]">Immobilie</TableHead>
                      <TableHead className="min-w-[120px]">Label</TableHead>
                      <TableHead className="min-w-[100px]">Datum</TableHead>
                      <TableHead className="text-right min-w-[100px]">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLeads.map((lead) => {
                      const badge = labelToBadge(lead.lead_label);
                      return (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{lead.vorname} {lead.nachname}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1"><Mail className="h-3 w-3" /><span>{lead.email}</span></div>
                              <div className="flex items-center gap-1"><Phone className="h-3 w-3" /><span>{lead.telefon}</span></div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.property ? (
                              <div className="flex items-center gap-1 text-xs">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate max-w-[180px]">{lead.property.title}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Kontakt-Seite</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={badge.variant}>{badge.text}</Badge>
                              <Select defaultValue={lead.lead_label || ''} onValueChange={(v) => updateLeadLabel(lead.id, v)}>
                                <SelectTrigger className="w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {labelOptions.map(o => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(lead.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="p-2" onClick={() => { setSelected(lead); setViewOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Zeige {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} von {filteredLeads.length} Leads
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">Seite {currentPage} von {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Leads gefunden</h3>
              <p className="text-muted-foreground">Sobald Anfragen eingehen, können Sie sie hier als Leads klassifizieren.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Vollständige Informationen zum Lead</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><strong>Name:</strong> {selected.vorname} {selected.nachname}</div>
              <div><strong>E-Mail:</strong> {selected.email}</div>
              <div><strong>Telefon:</strong> {selected.telefon}</div>
              {selected.property && (
                <div><strong>Immobilie:</strong> {selected.property.title}</div>
              )}
              <div><strong>Erstellt:</strong> {new Date(selected.created_at).toLocaleString('de-DE')}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManagement;
