
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const PromotionsManagement = () => {
  const [promotions] = useState([]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gerenciar Promoções
            <Button className="bg-orange-600 hover:bg-orange-700 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Criar Nova Promoção</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
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
              <Button className="bg-orange-600 hover:bg-orange-700">
                Criar Primeira Promoção
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lista de promoções será implementada futuramente */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionsManagement;
