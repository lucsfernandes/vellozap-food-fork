import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { usePromotions, type Promotion, type PromotionInput } from "@/hooks/usePromotions";

const PROMOTION_TYPES = [
  { value: "desconto", label: "Desconto" },
  { value: "combo", label: "Combo" },
  { value: "frete_gratis", label: "Frete Grátis" },
] as const;

const promotionTypeLabel = (type: string) =>
  PROMOTION_TYPES.find((t) => t.value === type)?.label ?? type;

interface FormState {
  name: string;
  type: string;
  discount: string;
  validFrom: string;
  validTo: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  type: "desconto",
  discount: "",
  validFrom: "",
  validTo: "",
  active: true,
};

const PromotionsManagement = () => {
  const { promotions, loading, createPromotion, updatePromotion, removePromotion } =
    usePromotions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditing(promotion);
    setForm({
      name: promotion.name,
      type: promotion.type,
      discount: promotion.discount ? String(promotion.discount) : "",
      validFrom: promotion.valid_from ? promotion.valid_from.slice(0, 10) : "",
      validTo: promotion.valid_to ? promotion.valid_to.slice(0, 10) : "",
      active: promotion.active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload: PromotionInput = {
      name: form.name.trim(),
      type: form.type,
      discount: form.discount ? parseFloat(form.discount) : 0,
      validFrom: form.validFrom || null,
      validTo: form.validTo || null,
      active: form.active,
    };
    const result = editing
      ? await updatePromotion(editing.id, payload)
      : await createPromotion(payload);
    setSaving(false);
    if (result) {
      setIsDialogOpen(false);
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    await updatePromotion(promotion.id, { active: !promotion.active });
  };

  const handleDelete = async (promotion: Promotion) => {
    await removePromotion(promotion.id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gerenciar Promoções
            <Button
              onClick={openCreate}
              className="bg-orange-600 hover:bg-orange-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Nova Promoção</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhuma promoção cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie promoções e combos especiais para aumentar suas vendas
              </p>
              <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700">
                Criar Primeira Promoção
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{promotion.name}</span>
                      <Badge variant="outline">{promotionTypeLabel(promotion.type)}</Badge>
                      <Badge variant={promotion.active ? "default" : "secondary"}>
                        {promotion.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-x-3">
                      {promotion.discount > 0 && (
                        <span>Desconto: {formatCurrency(promotion.discount)}</span>
                      )}
                      {promotion.valid_from && (
                        <span>De: {promotion.valid_from.slice(0, 10)}</span>
                      )}
                      {promotion.valid_to && (
                        <span>Até: {promotion.valid_to.slice(0, 10)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={promotion.active}
                      onCheckedChange={() => handleToggleActive(promotion)}
                    />
                    <Button variant="outline" size="sm" onClick={() => openEdit(promotion)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promotion)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Promoção" : "Criar Nova Promoção"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-name">Nome *</Label>
              <Input
                id="promo-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Combo Família"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-type">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger id="promo-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PROMOTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-discount">Desconto (R$)</Label>
              <Input
                id="promo-discount"
                type="number"
                step="0.01"
                min="0"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promo-from">Válida de</Label>
                <Input
                  id="promo-from"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-to">Válida até</Label>
                <Input
                  id="promo-to"
                  type="date"
                  value={form.validTo}
                  onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="promo-active"
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
              <Label htmlFor="promo-active">Promoção ativa</Label>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsManagement;
